import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline'
  }
  className?: string
}

export function EmptyState({ 
  title, 
  description, 
  icon: Icon, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center rounded-2xl border border-glass-border bg-glass-surface px-8 py-14 text-center shadow-md backdrop-blur-surface',
      className
    )}>
      {Icon && (
        <div className="mb-6 rounded-full border border-glass-border bg-glass-surface p-4 shadow-xs">
          <Icon className="h-8 w-8 text-fg-muted" />
        </div>
      )}
      
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
          {action.label}
        </Button>
      )}
    </div>
  )
}