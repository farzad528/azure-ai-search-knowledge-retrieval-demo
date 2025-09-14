import * as React from "react"
import { cn } from "@/lib/utils"

interface FormFieldContextValue {
  id: string
  name: string
  error?: string
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

interface FormFieldProps {
  name: string
  children: React.ReactNode
  error?: string
}

export function FormField({ name, children, error }: FormFieldProps) {
  const id = `${name}-field`
  
  return (
    <FormFieldContext.Provider value={{ id, name, error }}>
      <div className="space-y-2">
        {children}
      </div>
    </FormFieldContext.Provider>
  )
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function FormLabel({ 
  className, 
  required, 
  children, 
  ...props 
}: FormLabelProps) {
  const context = React.useContext(FormFieldContext)
  
  return (
    <label
      htmlFor={context?.id}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-status-danger ml-1">*</span>}
    </label>
  )
}

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {}

export function FormControl({ className, ...props }: FormControlProps) {
  const context = React.useContext(FormFieldContext)
  
  return (
    <div
      className={className}
      aria-describedby={context?.error ? `${context.id}-error` : undefined}
      {...props}
    />
  )
}

interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function FormDescription({ className, ...props }: FormDescriptionProps) {
  const context = React.useContext(FormFieldContext)
  
  return (
    <p
      id={`${context?.id}-description`}
      className={cn("text-sm text-fg-muted", className)}
      {...props}
    />
  )
}

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function FormMessage({ className, children, ...props }: FormMessageProps) {
  const context = React.useContext(FormFieldContext)
  const body = context?.error || children
  
  if (!body) {
    return null
  }
  
  return (
    <p
      id={`${context?.id}-error`}
      className={cn("text-sm text-status-danger", className)}
      {...props}
    >
      {body}
    </p>
  )
}