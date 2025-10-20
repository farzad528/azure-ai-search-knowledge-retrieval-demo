import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statusPillVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 transition-colors duration-fast ease-out',
  {
    variants: {
      variant: {
        success: 'bg-status-success/20 text-status-success ring-status-success/40',
        warning: 'bg-status-warning/20 text-status-warning ring-status-warning/40',
        danger: 'bg-status-danger/20 text-status-danger ring-status-danger/40',
        info: 'bg-status-info/20 text-status-info ring-status-info/40',
        neutral: 'bg-glass-surface text-fg-muted ring-glass-border',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
)

interface StatusPillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusPillVariants> {
  children: React.ReactNode
}

export function StatusPill({ 
  className, 
  variant, 
  children, 
  ...props 
}: StatusPillProps) {
  return (
    <span
      className={cn(statusPillVariants({ variant, className }))}
      {...props}
    >
      {children}
    </span>
  )
}