'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { KBPlaygroundView } from '@/components/kb-playground-view'
import { IndustryKnowledgeSelector } from '@/components/industry-knowledge-selector'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'

function TestPlaygroundContent() {
  const searchParams = useSearchParams()
  const selectedAgent = searchParams.get('agent')

  // If no agent is selected, show the industry selector
  if (!selectedAgent) {
    return <IndustryKnowledgeSelector />
  }

  // Otherwise show the playground with the selected agent
  // Use key to force re-mount when agent changes
  return <KBPlaygroundView key={selectedAgent} preselectedAgent={selectedAgent} />
}

export default function TestPlaygroundPage() {
  return (
    <Suspense fallback={<PlaygroundSkeleton />}>
      <TestPlaygroundContent />
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
