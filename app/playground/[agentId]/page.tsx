'use client'

import { redirect } from 'next/navigation'
import { useEffect } from 'react'

interface PlaygroundPageProps {
  params: {
    agentId: string
  }
}

export default function PlaygroundPage({ params }: PlaygroundPageProps) {
  useEffect(() => {
    // Store the selected agent ID in localStorage for the playground to pick up
    if (params.agentId) {
      localStorage.setItem('selectedAgentId', params.agentId)
    }
  }, [params.agentId])

  // Redirect to the main playground page
  redirect('/playground')
}