import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronLeft20Regular } from '@fluentui/react-icons'
import Link from 'next/link'

interface PageHeaderProps {
  title: string
  description?: string
  status?: {
    label: string
    variant: 'success' | 'warning' | 'danger' | 'info'
  }
  primaryAction?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: React.ComponentType<{ className?: string }>
  }
  backButton?: {
    href: string
    label?: string
  }
  className?: string
}

const statusVariants = {
  success: 'bg-status-success text-fg-on-accent',
  warning: 'bg-status-warning text-fg-on-accent',
  danger: 'bg-status-danger text-fg-on-accent',
  info: 'bg-status-info text-fg-on-accent',
}

export function PageHeader({ 
  title, 
  description, 
  status, 
  primaryAction, 
  backButton,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn('pb-6 border-b border-stroke-divider', className)}>
      {backButton && (
        <div className="mb-4">
          <Link
            href={backButton.href}
            className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg-default transition-colors"
          >
            <ChevronLeft20Regular className="h-4 w-4" />
            {backButton.label || 'Back'}
          </Link>
        </div>
      )}
      
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-fg-default truncate">
              {title}
            </h1>
            {status && (
              <span
                className={cn(
                  'inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium',
                  statusVariants[status.variant]
                )}
              >
                {status.label}
              </span>
            )}
          </div>
          
          {description && (
            <p className="text-fg-muted text-lg leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {primaryAction && (
          <div className="flex-shrink-0">
            {primaryAction.href ? (
              <Button asChild size="lg">
                <Link href={primaryAction.href}>
                  {primaryAction.icon && (
                    <primaryAction.icon className="h-4 w-4 mr-2" />
                  )}
                  {primaryAction.label}
                </Link>
              </Button>
            ) : (
              <Button size="lg" onClick={primaryAction.onClick}>
                {primaryAction.icon && (
                  <primaryAction.icon className="h-4 w-4 mr-2" />
                )}
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}