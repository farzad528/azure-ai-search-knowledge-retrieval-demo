import * as React from 'react'
import { Dismiss20Regular } from '@fluentui/react-icons'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { modalVariants, backdropVariants } from '@/lib/motion'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  // Close on Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onOpenChange])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          
          {/* Dialog container */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={modalVariants}
                className="w-full max-w-md transform overflow-hidden rounded-lg bg-bg-card border border-stroke-divider shadow-lg transition-all"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
              >
                {children}
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

interface DialogContentProps {
  className?: string
  children: React.ReactNode
}

export function DialogContent({ className, children }: DialogContentProps) {
  return (
    <div className={cn('bg-bg-card', className)}>
      {children}
    </div>
  )
}

interface DialogHeaderProps {
  className?: string
  children: React.ReactNode
}

export function DialogHeader({ className, children }: DialogHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)}>
      {children}
    </div>
  )
}

interface DialogFooterProps {
  className?: string
  children: React.ReactNode
}

export function DialogFooter({ className, children }: DialogFooterProps) {
  return (
    <div className={cn('flex justify-end space-x-2 p-6 pt-0', className)}>
      {children}
    </div>
  )
}

interface DialogTitleProps {
  className?: string
  children: React.ReactNode
}

export function DialogTitle({ className, children }: DialogTitleProps) {
  return (
    <h2 className={cn('text-lg font-semibold text-fg-default', className)}>
      {children}
    </h2>
  )
}

interface DialogDescriptionProps {
  className?: string
  children: React.ReactNode
}

export function DialogDescription({ className, children }: DialogDescriptionProps) {
  return (
    <p className={cn('text-sm text-fg-muted', className)}>
      {children}
    </p>
  )
}

interface DialogCloseProps {
  className?: string
  onClose?: () => void
}

export function DialogClose({ className, onClose }: DialogCloseProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('absolute right-4 top-4', className)}
      onClick={onClose}
      aria-label="Close dialog"
    >
      <Dismiss20Regular className="h-4 w-4" />
    </Button>
  )
}