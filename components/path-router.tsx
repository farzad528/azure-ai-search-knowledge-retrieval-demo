'use client'

import { usePath } from '@/lib/path-context'
import { LandingPage } from '@/components/landing-page'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface PathRouterProps {
  initialKnowledgeBases: any[]
  initialKnowledgeSources: any[]
  initialError: string | null
}

export function PathRouter({ initialKnowledgeBases, initialKnowledgeSources, initialError }: PathRouterProps) {
  const { selectedPath } = usePath()
  const router = useRouter()

  // Show landing page if no path is selected
  if (!selectedPath) {
    return <LandingPage />
  }

  // For Foundry Agent AI Service path, redirect directly to agents page
  useEffect(() => {
    if (selectedPath === 'foundry-agent-service') {
      router.push('/agents')
    }
  }, [selectedPath, router])

  // For Azure AI Search path, redirect to knowledge-bases page
  useEffect(() => {
    if (selectedPath === 'azure-ai-search') {
      router.push('/knowledge-bases')
    }
  }, [selectedPath, router])

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}