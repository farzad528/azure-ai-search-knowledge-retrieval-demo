/**
 * Client-side image preprocessing for vision models.
 *
 * Rationale:
 * - For high-detail processing, OpenAI o-series / GPT-4o style tiling downsizes images so that the longest side <= 2048px and the shortest side >= ~768px when possible.
 * - Sending larger than 2048 on the long side wastes bandwidth with no quality gain; likewise upscaling a very small dimension adds no useful information.
 * - Token cost is driven by 512px tiles after internal resizing. Constraining within this envelope maximizes useful detail vs cost.
 * - If low-detail (not currently exposed in this API version) were used, the model would internally use a ~512x512 representation, so additional resolution would not help.
 *
 * Strategy implemented here:
 * 1. Decode the image into an offscreen canvas.
 * 2. Compute target dimensions such that:
 *    - Long side <= 2048
 *    - Short side >= 768 IF the original short side was already >= 768 (we do not upscale above original).
 *    - Maintain aspect ratio.
 * 3. Perform a single high-quality drawImage resize.
 * 4. Export as JPEG for photographic/images (except preserve PNG if transparency or if source was PNG and very small text content would benefit). GIF/WebP are flattened to JPEG unless animated (we do not support animation detection here; first frame used).
 * 5. Iteratively reduce quality until size <= maxBytes (default 4MB safety to stay well below 20MB API hard limit) or quality floor reached.
 *
 * Edge cases handled:
 * - Transparent PNG: if alpha channel detected and coverage > minimal, keep PNG.
 * - Very small images: leave untouched (no upscale beyond original dimensions).
 * - Non-image or decoding failure: propagate error to caller.
 */

export interface ProcessedImageResult {
  dataUrl: string
  width: number
  height: number
  originalWidth: number
  originalHeight: number
  originalBytes: number
  processedBytes: number
  mimeType: string
  wasResized: boolean
  wasCompressed: boolean
  notes?: string[]
}

interface ProcessImageOptions {
  maxLongSide?: number // default 2048
  targetMinShortSide?: number // attempt to keep short side >= 768 if original permits
  maxBytes?: number // target upper bound
  jpegInitialQuality?: number
  jpegMinQuality?: number
  jpegQualityStep?: number
  preservePngIfTransparent?: boolean
}

export async function processImageFile(file: File, options: ProcessImageOptions = {}): Promise<ProcessedImageResult> {
  const {
    maxLongSide = 2048,
    targetMinShortSide = 768,
    maxBytes = 4 * 1024 * 1024, // 4MB soft cap
    jpegInitialQuality = 0.92,
    jpegMinQuality = 0.6,
    jpegQualityStep = 0.05,
    preservePngIfTransparent = true
  } = options

  const arrayBuffer = await file.arrayBuffer()
  const originalBytes = arrayBuffer.byteLength
  const blob = new Blob([arrayBuffer], { type: file.type })
  const img = await decodeImage(blob)
  const originalWidth = img.width
  const originalHeight = img.height
  const notes: string[] = []

  // Determine target dimensions
  let targetWidth = originalWidth
  let targetHeight = originalHeight
  const isLandscape = originalWidth >= originalHeight
  const longSide = Math.max(originalWidth, originalHeight)
  const shortSide = Math.min(originalWidth, originalHeight)

  if (longSide > maxLongSide || (shortSide < targetMinShortSide && shortSide < maxLongSide)) {
    // Scale down if too large, but never upscale.
    const scaleDownFactor = longSide > maxLongSide ? maxLongSide / longSide : 1
    let scaledWidth = Math.round(originalWidth * scaleDownFactor)
    let scaledHeight = Math.round(originalHeight * scaleDownFactor)

    // Try to keep short side >= targetMinShortSide if original allowed it
    if (shortSide >= targetMinShortSide) {
      // After initial scale, ensure short side not falling below targetMinShortSide excessively
      const currentShort = Math.min(scaledWidth, scaledHeight)
      if (currentShort < targetMinShortSide) {
        const adjustFactor = targetMinShortSide / currentShort
        scaledWidth = Math.round(scaledWidth * adjustFactor)
        scaledHeight = Math.round(scaledHeight * adjustFactor)
        // Do not exceed maxLongSide after adjustment
        const newLong = Math.max(scaledWidth, scaledHeight)
        if (newLong > maxLongSide) {
          const backoff = maxLongSide / newLong
          scaledWidth = Math.round(scaledWidth * backoff)
          scaledHeight = Math.round(scaledHeight * backoff)
        }
      }
    }

    targetWidth = scaledWidth
    targetHeight = scaledHeight
  }

  const wasResized = targetWidth !== originalWidth || targetHeight !== originalHeight
  if (wasResized) {
    notes.push(`resized ${originalWidth}x${originalHeight} -> ${targetWidth}x${targetHeight}`)
  } else {
    notes.push('no-resize')
  }

  // Draw into canvas
  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

  const hasTransparency = detectTransparency(ctx)
  let mimeType = 'image/jpeg'
  if (file.type === 'image/png' && preservePngIfTransparent && hasTransparency) {
    mimeType = 'image/png'
    notes.push('preserved-png-transparency')
  }

  let quality = jpegInitialQuality
  let dataUrl = canvas.toDataURL(mimeType, mimeType === 'image/jpeg' ? quality : undefined)
  let processedBytes = dataUrlSize(dataUrl)
  let wasCompressed = false

  while (mimeType === 'image/jpeg' && processedBytes > maxBytes && quality > jpegMinQuality) {
    quality = Math.max(jpegMinQuality, +(quality - jpegQualityStep).toFixed(2))
    dataUrl = canvas.toDataURL(mimeType, quality)
    processedBytes = dataUrlSize(dataUrl)
    wasCompressed = true
  }

  if (processedBytes > maxBytes) {
    notes.push('max-bytes-not-met')
  }
  if (wasCompressed) notes.push('compressed')

  return {
    dataUrl,
    width: targetWidth,
    height: targetHeight,
    originalWidth,
    originalHeight,
    originalBytes,
    processedBytes,
    mimeType,
    wasResized,
    wasCompressed,
    notes
  }
}

async function decodeImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(new Error('Image decode failed'))
    }
    img.src = url
  })
}

function dataUrlSize(dataUrl: string): number {
  // dataURL format: data:<mime>;base64,<payload>
  const idx = dataUrl.indexOf(',')
  if (idx === -1) return 0
  const base64 = dataUrl.slice(idx + 1)
  // 4 base64 chars -> 3 bytes; handle padding
  const len = base64.length
  const padding = (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0)
  return Math.floor((len * 3) / 4) - padding
}

function detectTransparency(ctx: CanvasRenderingContext2D): boolean {
  const { width, height } = ctx.canvas
  const sample = ctx.getImageData(0, 0, width, height).data
  // Sample every 10th pixel row/column to avoid heavy cost on large images
  const stepX = Math.max(1, Math.floor(width / 100))
  const stepY = Math.max(1, Math.floor(height / 100))
  for (let y = 0; y < height; y += stepY) {
    for (let x = 0; x < width; x += stepX) {
      const idx = (y * width + x) * 4
      const alpha = sample[idx + 3]
      if (alpha < 250) { // near-transparent
        return true
      }
    }
  }
  return false
}
