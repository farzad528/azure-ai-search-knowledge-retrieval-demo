'use client'

import { useState, useEffect } from 'react'
import { fetchKnowledgeSources, fetchAgents } from '../lib/api'
import { DashboardView } from '@/components/dashboard-view'

type KnowledgeSource = {
  id: string
  name: string
  kind: 'searchIndex' | 'web' | 'azureBlob'
  docCount?: number
  lastUpdated?: string
  status?: string
}

type KnowledgeAgent = {
  id: string
  name: string
  model?: string
  sources: string[]
  status?: string
  lastRun?: string
  createdBy?: string
}

export default function HomePage() {
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([])
  const [agents, setAgents] = useState<KnowledgeAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [ksData, agentsData] = await Promise.all([
        fetchKnowledgeSources(),
        fetchAgents()
      ])
      
      console.log('Knowledge sources data:', ksData)
      console.log('Agents data:', agentsData)
      
      // Map knowledge sources with proper structure from actual Azure API
      const mappedSources = (ksData.value || []).map(source => ({
        id: source.name,
        name: source.name,
        kind: source.kind,
        docCount: 0, // Not provided in current API response
        lastUpdated: null, // Not provided in current API response  
        status: 'active',
        description: source.description
      }))
      
      // Map agents with proper structure from actual Azure API
      const mappedAgents = (agentsData.value || []).map(agent => {
        const mapped = {
          id: agent.name,
          name: agent.name,
          model: agent.models?.[0]?.azureOpenAIParameters?.modelName,
          sources: (agent.knowledgeSources || []).map(ks => ks.name),
          status: 'active',
          lastRun: null, // Not provided in current API response
          createdBy: null, // Not provided in current API response
          description: agent.description,
          outputConfiguration: agent.outputConfiguration
        }
        console.log('Mapping agent:', agent.name, '=> mapped ID:', mapped.id)
        return mapped
      })
      
      setKnowledgeSources(mappedSources)
      setAgents(mappedAgents)
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <DashboardView
      knowledgeSources={knowledgeSources}
      agents={agents}
      loading={loading}
      error={error}
      onRefresh={loadData}
    />
  )
}