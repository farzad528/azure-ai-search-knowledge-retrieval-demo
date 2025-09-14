import * as React from 'react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'

interface ActivityItem {
  id: string
  type: string
  title: string
  description?: string
  timestamp: Date | string
  icon?: React.ComponentType<{ className?: string }>
  status?: 'success' | 'warning' | 'danger' | 'info'
  metadata?: Record<string, any>
}

interface ActivityTimelineProps {
  items: ActivityItem[]
  className?: string
}

const statusColors = {
  success: 'bg-status-success',
  warning: 'bg-status-warning',
  danger: 'bg-status-danger',
  info: 'bg-status-info',
}

export function ActivityTimeline({ items, className }: ActivityTimelineProps) {
  if (items.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-fg-muted">No activity to show</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {items.map((item, index) => {
        const Icon = item.icon
        const isLast = index === items.length - 1

        return (
          <div key={item.id} className="flex">
            <div className="flex flex-col items-center mr-4">
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full',
                item.status 
                  ? statusColors[item.status] 
                  : 'bg-bg-subtle'
              )}>
                {Icon ? (
                  <Icon className={cn(
                    'w-4 h-4',
                    item.status ? 'text-fg-on-accent' : 'text-fg-muted'
                  )} />
                ) : (
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    item.status ? 'bg-fg-on-accent' : 'bg-fg-muted'
                  )} />
                )}
              </div>
              {!isLast && (
                <div className="w-0.5 h-8 bg-stroke-divider mt-2" />
              )}
            </div>

            <div className="flex-1 min-w-0 pb-8">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-fg-default">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-sm text-fg-muted mt-1">
                      {item.description}
                    </p>
                  )}
                  
                  {item.metadata && Object.keys(item.metadata).length > 0 && (
                    <div className="mt-3 space-y-1">
                      {Object.entries(item.metadata).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 text-xs text-fg-muted">
                          <span className="font-medium">{key}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <time className="text-xs text-fg-muted flex-shrink-0 ml-4">
                  {formatRelativeTime(item.timestamp)}
                </time>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}