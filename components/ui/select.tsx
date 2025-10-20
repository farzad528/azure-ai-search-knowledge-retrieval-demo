import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  disabled?: boolean
}

export function Select({ value, onValueChange, children, disabled }: SelectProps) {
  const [open, setOpen] = React.useState(false)

  const contextValue = React.useMemo(
    () => ({
      value,
      onValueChange,
      open: disabled ? false : open,
      onOpenChange: disabled ? () => {} : setOpen,
    }),
    [value, onValueChange, open, disabled]
  )

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error('SelectTrigger must be used within Select')

    return (
      <button
        ref={ref}
        type="button"
        role="combobox"
        aria-expanded={context.open}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-glass-border bg-glass-surface px-4 py-2 text-sm font-medium tracking-tight text-fg-default shadow-xs backdrop-blur-surface transition-all duration-base ease-out focus:outline-none focus:ring-2 focus:ring-stroke-focus focus:ring-offset-2 focus:ring-offset-bg-canvas hover:border-accent-muted disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        onClick={() => context.onOpenChange(!context.open)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 text-fg-subtle" />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

interface SelectValueProps {
  placeholder?: string
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectValue must be used within Select')

  return (
    <span className={cn(!context.value && "text-fg-subtle")}>
      {context.value || placeholder}
    </span>
  )
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

export function SelectContent({ children, className }: SelectContentProps) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectContent must be used within Select')

  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (context.open) {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          context.onOpenChange(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [context])

  if (!context.open) return null

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 mt-2 w-full rounded-2xl border border-glass-border bg-glass-surface p-2 shadow-lg backdrop-blur-elevated",
        className
      )}
    >
      {children}
    </div>
  )
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function SelectItem({ value, children, className }: SelectItemProps) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectItem must be used within Select')

  const isSelected = context.value === value

  return (
    <button
      type="button"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-lg py-2 pl-9 pr-3 text-sm text-fg-muted outline-none transition-colors duration-fast ease-out hover:bg-glass-hover focus:bg-glass-hover",
        isSelected && "bg-accent-subtle text-accent",
        className
      )}
      onClick={() => {
        context.onValueChange(value)
        context.onOpenChange(false)
      }}
    >
      <span className="absolute left-3 flex h-3.5 w-3.5 items-center justify-center text-accent">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </button>
  )
}