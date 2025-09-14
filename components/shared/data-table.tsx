import * as React from 'react'
import { cn } from '@/lib/utils'
import { LoadingSkeleton } from './loading-skeleton'

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyState?: React.ReactNode
  onRowClick?: (item: T) => void
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyState,
  onRowClick,
  className
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn('w-full', className)}>
        <div className="border border-stroke-divider rounded-md">
          <div className="border-b border-stroke-divider bg-bg-subtle">
            <div className="grid grid-cols-12 gap-4 px-6 py-3">
              {columns.map((_, index) => (
                <LoadingSkeleton key={index} className="h-4" />
              ))}
            </div>
          </div>
          <div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-stroke-divider last:border-b-0">
                {columns.map((_, colIndex) => (
                  <LoadingSkeleton key={colIndex} className="h-4" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (data.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="border border-stroke-divider rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-subtle">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.width && `w-${column.width}`
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-bg-card divide-y divide-stroke-divider">
            {data.map((item, index) => (
              <tr
                key={index}
                className={cn(
                  'hover:bg-bg-hover transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key as string}
                    className={cn(
                      'px-6 py-4 whitespace-nowrap text-sm',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                  >
                    {column.render 
                      ? column.render(item)
                      : item[column.key as keyof T] as React.ReactNode
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}