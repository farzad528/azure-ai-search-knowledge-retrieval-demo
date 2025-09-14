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
      'flex flex-col items-center justify-center py-12 px-6 text-center',
      className
    )}>
      {Icon && (
        <div className="rounded-full bg-bg-subtle p-4 mb-4">
          <Icon className="h-8 w-8 text-fg-muted" />
        </div>
      )}
      
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
          {action.label}
        </Button>
      )}
    </div>
  )
}