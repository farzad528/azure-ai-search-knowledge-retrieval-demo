import * as React from 'react'
import { ErrorCircle20Regular, ArrowClockwise20Regular } from '@fluentui/react-icons'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline'
  }
  className?: string
}

export function ErrorState({ 
  title, 
  description, 
  action, 
  className 
}: ErrorStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center rounded-2xl border border-glass-border bg-glass-surface px-8 py-14 text-center shadow-md backdrop-blur-surface',
      className
    )}>
      <div className="mb-6 rounded-full border border-status-danger/30 bg-status-danger/10 p-4 shadow-xs">
        <ErrorCircle20Regular className="h-8 w-8 text-status-danger" />
      </div>
      
      <h3 className="mb-3 text-xl font-semibold tracking-tight text-fg-default">
        {title}
      </h3>
      
      {description && (
        <p className="mb-6 max-w-sm text-sm text-fg-muted">
          {description}
        </p>
      )}
      
      {action && (
        <Button
          variant={action.variant || 'default'}
          onClick={action.onClick}
        >
          <ArrowClockwise20Regular className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  )
}