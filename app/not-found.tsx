import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-canvas p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-accent mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-fg-default mb-2">
            Page not found
          </h2>
          <p className="text-fg-muted">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/" className="block">
            <Button className="w-full" size="lg">
              Go to home
            </Button>
          </Link>
          <Link href="/agents" className="block">
            <Button variant="outline" className="w-full" size="lg">
              View agents
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
