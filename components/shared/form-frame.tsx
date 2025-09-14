import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface FormAction {
  label: string
  onClick: () => void
  variant?: 'default' | 'outline' | 'ghost'
  loading?: boolean
  disabled?: boolean
}

interface FormFrameProps {
  title: string
  description?: string
  children: React.ReactNode
  actions: FormAction[]
  className?: string
}

export function FormFrame({ 
  title, 
  description, 
  children, 
  actions, 
  className 
}: FormFrameProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="border-b border-stroke-divider p-6">
        <h2 className="text-xl font-semibold text-fg-default mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-fg-muted">
            {description}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>

      {/* Sticky Actions */}
      <div className="border-t border-stroke-divider bg-bg-card p-6">
        <div className="flex gap-3 justify-end">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
            >
              {action.loading && (
                <div className="spinner mr-2" />
              )}
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}