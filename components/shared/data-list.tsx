import * as React from 'react'
import { cn } from '@/lib/utils'
import { LoadingSkeleton } from './loading-skeleton'

interface DataListProps<T> {
  data: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  loading?: boolean
  emptyState?: React.ReactNode
  className?: string
  itemClassName?: string
}

export function DataList<T>({
  data,
  renderItem,
  loading = false,
  emptyState,
  className,
  itemClassName
}: DataListProps<T>) {
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 5 }).map((_, index) => (
          <LoadingSkeleton 
            key={index} 
            className={cn('h-24 w-full', itemClassName)} 
          />
        ))}
      </div>
    )
  }

  if (data.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>
  }

  return (
    <div className={cn('space-y-4', className)}>
      {data.map((item, index) => (
        <div key={index} className={itemClassName}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}