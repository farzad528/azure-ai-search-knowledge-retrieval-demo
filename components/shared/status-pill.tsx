import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statusPillVariants = cva(
  'inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        success: 'bg-status-success text-fg-on-accent',
        warning: 'bg-status-warning text-fg-on-accent',
        danger: 'bg-status-danger text-fg-on-accent',
        info: 'bg-status-info text-fg-on-accent',
        neutral: 'bg-bg-subtle text-fg-muted',
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