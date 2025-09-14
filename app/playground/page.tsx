'use client'

import { Suspense } from 'react'
import { PlaygroundView } from '@/components/playground-view'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<PlaygroundSkeleton />}>
      <PlaygroundView />
    </Suspense>
  )
}

function PlaygroundSkeleton() {
  return (
    <div className="h-[calc(100vh-6rem)] flex">
      <div className="w-80 border-r border-stroke-divider p-6 space-y-4">
        <LoadingSkeleton className="h-6 w-32" />
        <LoadingSkeleton className="h-32 w-full" />
        <LoadingSkeleton className="h-32 w-full" />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="border-b border-stroke-divider p-6">
          <LoadingSkeleton className="h-8 w-48" />
        </div>
        <div className="flex-1 p-6">
          <LoadingSkeleton className="h-full w-full" />
        </div>
        <div className="border-t border-stroke-divider p-6">
          <LoadingSkeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  )
}