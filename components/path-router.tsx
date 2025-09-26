'use client'

import { usePath } from '@/lib/path-context'
import { LandingPage } from '@/components/landing-page'
import { DashboardContainer } from '@/components/dashboard-container'
import React from 'react'

interface PathRouterProps {
  initialAgents: any[]
  initialKnowledgeSources: any[]
  initialError: string | null
}

export function PathRouter({ initialAgents, initialKnowledgeSources, initialError }: PathRouterProps) {
  const { selectedPath } = usePath()

  // Show landing page if no path is selected
  if (!selectedPath) {
    return <LandingPage />
  }

  // Show the dashboard for both paths (routing will be handled by navigation)
  return (
    <DashboardContainer
      initialAgents={initialAgents}
      initialKnowledgeSources={initialKnowledgeSources}
      initialError={initialError}
    />
  )
}