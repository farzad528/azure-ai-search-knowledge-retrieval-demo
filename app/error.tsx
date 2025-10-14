'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-canvas p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-status-danger/10 mb-4">
            <svg
              className="w-8 h-8 text-status-danger"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-fg-default mb-2">
            Something went wrong
          </h1>
          <p className="text-fg-muted mb-6">
            We apologize for the inconvenience. An error occurred while processing your request.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full"
            size="lg"
          >
            Try again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Go to home
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-6 p-4 bg-bg-card border border-stroke-divider rounded-lg text-left">
            <h3 className="text-sm font-semibold text-fg-default mb-2">
              Error details (development only):
            </h3>
            <p className="text-xs text-fg-muted font-mono break-all">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
