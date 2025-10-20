'use client'

import { useState, useEffect } from 'react'
import { Search20Regular, Add20Regular } from '@fluentui/react-icons'
import { fetchKnowledgeBases, fetchKnowledgeSources } from '../../lib/api'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KnowledgeBaseCard, KnowledgeBaseSummary } from '@/components/knowledge-base-card'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { CreateKnowledgeBaseForm } from '@/components/forms/create-knowledge-base-form'

type KnowledgeSource = {
  id: string
  name: string
  kind: string
}

export default function KnowledgeAgentsPage() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseSummary[]>([])
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateKnowledgeBase, setShowCreateKnowledgeBase] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [agentsData, sourcesData] = await Promise.all([
        fetchKnowledgeBases(),
        fetchKnowledgeSources()
      ])

      // Map API response to KnowledgeAgent type
      const sourceKindMap = new Map<string, string>()
      ;(sourcesData.value || []).forEach((source: any) => {
        if (source?.name) {
          sourceKindMap.set(source.name, source.kind || 'unknown')
        }
      })

      const mappedKnowledgeBases = (agentsData.value || []).map((base: any) => {
        const sources = (base.knowledgeSources || []).map((ks: any) => ks.name)
        return {
          id: base.name,
          name: base.name,
          model: base.models?.[0]?.azureOpenAIParameters?.modelName,
          sources,
          sourceDetails: sources.map((name: string) => ({
            name,
            kind: sourceKindMap.get(name) || 'unknown'
          })),
          status: base.status || 'active',
          lastRun: base.lastUpdatedOn || base.lastModifiedOn || null,
          createdBy: base.createdBy || null
        }
      })

      setKnowledgeBases(mappedKnowledgeBases)
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

  const filteredKnowledgeBases = knowledgeBases.filter(base =>
    base.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <KnowledgeAgentsSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load knowledge bases"
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
        title="Knowledge Bases"
        description="Manage and configure knowledge bases for grounded retrieval across your enterprise knowledge."
        primaryAction={{
          label: "Create knowledge base",
          onClick: () => setShowCreateKnowledgeBase(true),
          icon: Add20Regular
        }}
      />

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search20Regular className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg-muted" />
          <Input
            placeholder="Search knowledge bases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Create Agent Form */}
      {showCreateKnowledgeBase && (
        <div className="mb-8">
          <CreateKnowledgeBaseForm
            knowledgeSources={knowledgeSources}
            onSubmit={async (data) => {
              console.log('Creating knowledge base:', data)
              setShowCreateKnowledgeBase(false)
              await loadData()
            }}
            onCancel={() => setShowCreateKnowledgeBase(false)}
          />
        </div>
      )}

      {/* Agents grid */}
      {!showCreateKnowledgeBase && (
        <>
          {filteredKnowledgeBases.length === 0 ? (
            knowledgeBases.length === 0 ? (
              <EmptyState
                title="No knowledge bases"
                description="Create your first knowledge base to start chatting with your knowledge sources."
                action={{
                  label: "Create knowledge base",
                  onClick: () => setShowCreateKnowledgeBase(true)
                }}
              />
            ) : (
              <EmptyState
                title="No matching knowledge bases"
                description={`No knowledge bases match "${searchQuery}".`}
              />
            )
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredKnowledgeBases.map((base) => (
                <KnowledgeBaseCard key={base.id} knowledgeBase={base} />
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