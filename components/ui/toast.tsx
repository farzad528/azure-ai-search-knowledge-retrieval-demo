'use client'

import * as React from 'react'
import { Dismiss20Regular, CheckmarkCircle20Regular, ErrorCircle20Regular, Info20Regular, Warning20Regular } from '@fluentui/react-icons'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  toast: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])

    // Auto dismiss after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, toast.duration || 5000)
    }
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div className="fixed right-6 top-6 z-50 w-96">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

const toastConfig = {
  success: {
    icon: CheckmarkCircle20Regular,
    className: 'ring-1 ring-status-success/40',
    iconClassName: 'text-status-success',
  },
  error: {
    icon: ErrorCircle20Regular,
    className: 'ring-1 ring-status-danger/40',
    iconClassName: 'text-status-danger',
  },
  warning: {
    icon: Warning20Regular,
    className: 'ring-1 ring-status-warning/40',
    iconClassName: 'text-status-warning',
  },
  info: {
    icon: Info20Regular,
    className: 'ring-1 ring-status-info/40',
    iconClassName: 'text-status-info',
  },
}

function ToastItem({ toast }: { toast: Toast }) {
  const { dismiss } = useToast()
  const config = toastConfig[toast.type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.5 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'mb-4 rounded-2xl border border-glass-border/70 bg-glass-surface p-5 shadow-lg backdrop-blur-elevated transition-shadow duration-base ease-out hover:shadow-glow',
        config.className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', config.iconClassName)} />
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold tracking-tight text-fg-default">
            {toast.title}
          </h4>
          {toast.description && (
            <p className="mt-1 text-sm text-fg-muted">
              {toast.description}
            </p>
          )}
        </div>
        
        <button
          onClick={() => dismiss(toast.id)}
          className="flex-shrink-0 rounded-full p-1.5 text-fg-subtle transition-colors duration-fast hover:bg-glass-hover hover:text-fg-default"
          aria-label="Dismiss notification"
        >
          <Dismiss20Regular className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}