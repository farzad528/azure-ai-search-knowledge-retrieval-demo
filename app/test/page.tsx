'use client'

import { Suspense } from 'react'
import { KBPlaygroundView } from '@/components/kb-playground-view'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'

export default function TestPlaygroundPage() {
  return (
    <Suspense fallback={<PlaygroundSkeleton />}>
      <KBPlaygroundView />
    </Suspense>
  )
}

function PlaygroundSkeleton() {
  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <div className="border-b border-stroke-divider p-6">
        <LoadingSkeleton className="h-10 w-64" />
      </div>
      <div className="flex-1 p-6">
        <LoadingSkeleton className="h-full w-full" />
      </div>
      <div className="border-t border-stroke-divider p-6">
        <LoadingSkeleton className="h-12 w-full" />
      </div>
    </div>
  )
}
