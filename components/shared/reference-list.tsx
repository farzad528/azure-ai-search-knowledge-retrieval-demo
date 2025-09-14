import * as React from 'react'
import { Open20Regular } from '@fluentui/react-icons'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface Reference {
  id: string
  source: string
  title: string
  excerpt: string
  url?: string
  score?: number
}

interface ReferenceListProps {
  references: Reference[]
  maxItems?: number
  showScores?: boolean
  className?: string
}

export function ReferenceList({ 
  references, 
  maxItems, 
  showScores = false,
  className 
}: ReferenceListProps) {
  const displayReferences = maxItems 
    ? references.slice(0, maxItems) 
    : references

  if (references.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-fg-muted text-sm">No references found</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {displayReferences.map((reference) => (
        <Card key={reference.id} className="hover:elevation-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-accent bg-accent-subtle px-2 py-1 rounded-pill">
                    {reference.source}
                  </span>
                  {showScores && reference.score && (
                    <span className="text-xs text-fg-muted">
                      {Math.round(reference.score * 100)}% match
                    </span>
                  )}
                </div>
                
                <h4 className="font-medium text-sm text-fg-default mb-2 line-clamp-2">
                  {reference.title}
                </h4>
                
                <p className="text-sm text-fg-muted line-clamp-3">
                  {reference.excerpt}
                </p>
              </div>
              
              {reference.url && (
                <a
                  href={reference.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-1 text-fg-muted hover:text-fg-default transition-colors"
                  aria-label="Open reference"
                >
                  <Open20Regular className="h-4 w-4" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {maxItems && references.length > maxItems && (
        <div className="text-center pt-2">
          <span className="text-xs text-fg-muted">
            +{references.length - maxItems} more references
          </span>
        </div>
      )}
    </div>
  )
}