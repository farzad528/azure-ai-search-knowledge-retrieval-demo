'use client'

import { useState, useEffect } from 'react'
import { Search20Regular, Add20Regular } from '@fluentui/react-icons'
import { fetchAgents, fetchKnowledgeSources } from '../../lib/api'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KnowledgeAgentCard } from '@/components/knowledge-agent-card'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { CreateAgentForm } from '@/components/forms/create-agent-form'

type KnowledgeAgent = {
  id: string
  name: string
  model?: string
  sources: string[]
  status?: string
  lastRun?: string
  createdBy?: string
}

type KnowledgeSource = {
  id: string
  name: string
  kind: string
}

export default function KnowledgeAgentsPage() {
  const [agents, setAgents] = useState<KnowledgeAgent[]>([])
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateAgent, setShowCreateAgent] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [agentsData, sourcesData] = await Promise.all([
        fetchAgents(),
        fetchKnowledgeSources()
      ])
      setAgents(agentsData.value || [])
      setKnowledgeSources(sourcesData.value || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <KnowledgeAgentsSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load knowledge agents"
        description={error}
        action={{
          label: "Try again",
          onClick: loadData
        }}
      />
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Knowledge agents"
        description="Manage chat agents configured with knowledge sources and AI models."
        primaryAction={{
          label: "Create agent",
          onClick: () => setShowCreateAgent(true),
          icon: Add20Regular
        }}
      />

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search20Regular className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg-muted" />
          <Input
            placeholder="Search knowledge agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Create Agent Form */}
      {showCreateAgent && (
        <div className="mb-8">
          <CreateAgentForm
            knowledgeSources={knowledgeSources}
            onSubmit={async (data) => {
              console.log('Creating agent:', data)
              setShowCreateAgent(false)
              await loadData()
            }}
            onCancel={() => setShowCreateAgent(false)}
          />
        </div>
      )}

      {/* Agents grid */}
      {!showCreateAgent && (
        <>
          {filteredAgents.length === 0 ? (
            agents.length === 0 ? (
              <EmptyState
                title="No knowledge agents"
                description="Create your first agent to start chatting with your knowledge sources."
                action={{
                  label: "Create agent",
                  onClick: () => setShowCreateAgent(true)
                }}
              />
            ) : (
              <EmptyState
                title="No matching agents"
                description={`No knowledge agents match "${searchQuery}".`}
              />
            )
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAgents.map((agent) => (
                <KnowledgeAgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function KnowledgeAgentsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-stroke-divider">
        <LoadingSkeleton className="h-9 w-64 mb-2" />
        <LoadingSkeleton className="h-5 w-96" />
      </div>
      
      <div className="flex gap-4">
        <LoadingSkeleton className="h-10 flex-1" />
        <LoadingSkeleton className="h-10 w-24" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  )
}