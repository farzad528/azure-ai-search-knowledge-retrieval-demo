import React from 'react'

/**
 * InlineCitationsText
 * Renders text content replacing [ref_id:n] markers with interactive citation chips.
 * Props:
 *  - text: original assistant text containing markers
 *  - references: array of reference objects (optional)
 *  - activity: array of activity objects (optional) to resolve knowledgeSourceName
 *  - messageId: id of the parent message (used for scroll targets)
 *  - onActivate: optional callback when a citation chip is clicked (receives index & reference)
 *  - className: optional wrapper class
 */
export interface InlineCitationsTextProps {
  text: string
  references?: any[]
  activity?: any[]
  messageId: string | number
  onActivate?: (idx: number, ref?: any) => void
  className?: string
}

export const InlineCitationsText: React.FC<InlineCitationsTextProps> = ({
  text,
  references = [],
  activity = [],
  messageId,
  onActivate,
  className
}) => {
  const render = React.useMemo(() => {
    if (!text) return null
    const nodes: React.ReactNode[] = []
    const regex = /\[ref_id:(\d+)\]/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index))
      const refIdx = parseInt(match[1], 10)
      const ref = references[refIdx]
      const activityEntry = ref ? activity.find((a: any) => a.id === ref.activitySource) : undefined
      const fileName = ref?.blobUrl ? decodeURIComponent(ref.blobUrl.split('/').pop() || ref.id) : (ref?.docKey || ref?.id)
      const label = activityEntry?.knowledgeSourceName || fileName || `Reference ${refIdx + 1}`
      nodes.push(
        <button
          key={`cite-${match.index}`}
          type="button"
          onClick={() => {
            if (onActivate) onActivate(refIdx, ref)
            // Attempt to scroll to referenced block
            const el = document.getElementById(`ref-${messageId}-${refIdx}`)
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' })
              el.classList.add('ring-2','ring-accent','ring-offset-1')
              setTimeout(() => el.classList.remove('ring-2','ring-accent','ring-offset-1'), 1400)
            }
          }}
          aria-label={`View reference ${label}`}
          title={label}
          className="align-baseline inline-flex items-center gap-1 ml-1 mb-0.5 px-1.5 py-0.5 rounded bg-accent-subtle hover:bg-accent/20 hover:underline underline-offset-2 text-accent text-[10px] font-medium transition focus:outline-none focus:ring-1 focus:ring-accent max-w-[170px]"
        >
          <span className="truncate max-w-[130px]">{label}</span>
          <span className="text-[8px] opacity-70">#{refIdx + 1}</span>
        </button>
      )
      lastIndex = regex.lastIndex
    }
    if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
    return nodes
  }, [text, references, activity, messageId, onActivate])

  return <span className={className}>{render}</span>
}
