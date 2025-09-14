'use client'

import * as React from 'react'
import { Image20Regular, Dismiss20Regular } from '@fluentui/react-icons'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ImageInputProps {
  onImageSelect: (imageUrl: string, file: File) => void
  onImageRemove?: () => void
  selectedImage?: string
  className?: string
  disabled?: boolean
}

export function ImageInput({ 
  onImageSelect, 
  onImageRemove, 
  selectedImage, 
  className, 
  disabled 
}: ImageInputProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      onImageSelect(url, file)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage)
    }
    onImageRemove?.()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn('relative', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      {selectedImage ? (
        <div className="relative inline-block">
          <img 
            src={selectedImage} 
            alt="Selected" 
            className="h-20 w-20 object-cover rounded border border-stroke-divider"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-bg-card border border-stroke-divider"
            onClick={handleRemoveImage}
            disabled={disabled}
          >
            <Dismiss20Regular className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleButtonClick}
          disabled={disabled}
          aria-label="Add image"
        >
          <Image20Regular className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}