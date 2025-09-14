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
      'flex flex-col items-center justify-center py-12 px-6 text-center',
      className
    )}>
      <div className="rounded-full bg-status-danger/10 p-4 mb-4">
        <ErrorCircle20Regular className="h-8 w-8 text-status-danger" />
      </div>
      
      <h3 className="text-lg font-semibold text-fg-default mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-fg-muted text-sm max-w-sm mb-6">
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