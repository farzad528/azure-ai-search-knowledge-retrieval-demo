'use client'

import { useState, useEffect } from 'react'
import { Search20Regular, Add20Regular } from '@fluentui/react-icons'
import { fetchKnowledgeSources } from '../../lib/api'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KnowledgeSourceCard } from '@/components/knowledge-source-card'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { ErrorState } from '@/components/shared/error-state'

type KnowledgeSource = {
  id: string
  name: string
  kind: 'searchIndex' | 'web' | 'azureBlob'
  docCount?: number
  lastUpdated?: string
  status?: string
}

export default function KnowledgeSourcesPage() {
  const [sources, setSources] = useState<KnowledgeSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const loadSources = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchKnowledgeSources()
      setSources(data.value || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load knowledge sources')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSources()
  }, [])

  const filteredSources = sources.filter(source =>
    source.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <KnowledgeSourcesSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load knowledge sources"
        description={error}
        action={{
          label: "Try again",
          onClick: loadSources
        }}
      />
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Knowledge sources"
        description="Unified indexes and repositories optimized for high-quality agent grounding."
        primaryAction={{
          label: "Connect source",
          onClick: () => console.log('Connect source clicked'),
          icon: Add20Regular
        }}
      />

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search20Regular className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg-muted" />
          <Input
            placeholder="Search knowledge sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Sources grid */}
      {filteredSources.length === 0 ? (
        sources.length === 0 ? (
          <EmptyState
            title="No knowledge sources"
            description="Connect your first data source to enable knowledge retrieval and chat experiences."
            action={{
              label: "Connect source",
              onClick: () => console.log('Connect source clicked')
            }}
          />
        ) : (
          <EmptyState
            title="No matching sources"
            description={`No knowledge sources match "${searchQuery}".`}
          />
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSources.map((source) => (
            <KnowledgeSourceCard key={source.id} source={source} />
          ))}
        </div>
      )}
    </div>
  )
}

function KnowledgeSourcesSkeleton() {
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  )
}