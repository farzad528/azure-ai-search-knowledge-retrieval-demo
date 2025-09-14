import * as React from 'react'
import { cn } from '@/lib/utils'

interface KeyValueItem {
  key: string
  value: React.ReactNode
  copyable?: boolean
}

interface KeyValueProps {
  items: KeyValueItem[]
  layout?: 'vertical' | 'horizontal'
  className?: string
}

export function KeyValue({ 
  items, 
  layout = 'vertical', 
  className 
}: KeyValueProps) {
  const isHorizontal = layout === 'horizontal'

  return (
    <dl className={cn(
      isHorizontal ? 'grid grid-cols-2 gap-x-6 gap-y-4' : 'space-y-4',
      className
    )}>
      {items.map((item, index) => (
        <div 
          key={index} 
          className={cn(
            isHorizontal && 'col-span-1',
            !isHorizontal && 'flex flex-col space-y-1'
          )}
        >
          <dt className="text-sm font-medium text-fg-default">
            {item.key}
          </dt>
          <dd className={cn(
            'text-sm text-fg-muted',
            item.copyable && 'font-mono'
          )}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}