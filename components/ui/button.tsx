import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold tracking-tight transition-all duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-canvas disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-accent text-fg-on-accent shadow-md hover:bg-accent-hover hover:shadow-lg active:bg-accent-pressed active:shadow-sm",
        destructive: "bg-status-danger text-fg-on-accent shadow-sm hover:bg-status-danger/90 active:bg-status-danger/80",
        outline: "border border-glass-border bg-glass-surface text-fg-default shadow-xs hover:border-accent-muted hover:bg-glass-hover active:bg-bg-pressed",
        secondary: "bg-bg-elevated text-fg-default shadow-xs hover:bg-bg-hover active:bg-bg-pressed",
        ghost: "text-fg-muted hover:bg-glass-hover hover:text-fg-default active:bg-bg-pressed",
        link: "text-accent underline-offset-4 transition-shadow hover:underline hover:shadow-[0_2px_0]",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 rounded-lg px-4",
        lg: "h-12 rounded-2xl px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }