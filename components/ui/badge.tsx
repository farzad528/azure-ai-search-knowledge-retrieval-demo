import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors duration-fast ease-out focus:outline-none focus:ring-2 focus:ring-stroke-focus focus:ring-offset-2 focus:ring-offset-bg-canvas",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent text-fg-on-accent shadow-xs hover:bg-accent-hover",
        secondary:
          "border border-glass-border bg-glass-surface text-fg-muted hover:border-accent-muted",
        destructive:
          "border-transparent bg-status-danger text-fg-on-accent shadow-xs hover:bg-status-danger/85",
        outline: "border border-stroke-divider text-fg-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }