'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft20Regular, Settings20Regular } from '@fluentui/react-icons'

interface KnowledgeBase {
  id: string
  name: string
  description?: string
  model?: string
  knowledgeSources: Array<{
    name: string
    kind: string
  }>
}

export default function EditKnowledgeBasePage() {
  const params = useParams()
  const router = useRouter()
  const [kb, setKb] = useState<KnowledgeBase | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const kbId = params.id as string

  useEffect(() => {
    const fetchKnowledgeBase = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch knowledge bases
        const response = await fetch('/api/agents')
        if (!response.ok) {
          throw new Error('Failed to fetch knowledge bases')
        }

        const data = await response.json()
        console.log('API Response:', data) // Debug log
        console.log('Looking for KB ID:', kbId) // Debug log

        // Try finding by id first, then by name as fallback
        let foundKb = data.value?.find((item: any) => item.id === kbId || item.name === kbId)

        if (!foundKb) {
          console.log('Available KBs:', data.value?.map((kb: any) => ({ id: kb.id, name: kb.name }))) // Debug log
          throw new Error(`Knowledge base not found. Searched for: ${kbId}`)
        }

        // Fetch knowledge sources to get the kinds
        const ksResponse = await fetch('/api/knowledge-sources')
        const ksData = ksResponse.ok ? await ksResponse.json() : { value: [] }

        // Create mapping of source name to kind
        const sourceKindMap = new Map(
          ksData.value?.map((ks: any) => [ks.name, ks.kind]) || []
        )

        // Map the knowledge base with sources using the same structure as the main page
        const knowledgeSources = (foundKb.knowledgeSources || []).map((ks: any) => ({
          name: ks.name,
          kind: sourceKindMap.get(ks.name) || 'unknown'
        }))

        setKb({
          id: foundKb.name, // Use name as ID to match main page
          name: foundKb.name,
          description: foundKb.description || foundKb.retrievalInstructions,
          model: foundKb.models?.[0]?.azureAIParameters?.modelName || foundKb.models?.[0]?.azureOpenAIParameters?.modelName || 'gpt-4o-mini',
          knowledgeSources
        })
      } catch (err) {
        console.error('Error fetching knowledge base:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (kbId) {
      fetchKnowledgeBase()
    }
  }, [kbId])

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Knowledge Base"
          description="Configure your knowledge base settings"
          backAction={{
            label: "Back to Knowledge",
            onClick: () => router.push('/knowledge')
          }}
        />
        <LoadingSkeleton />
      </div>
    )
  }

  if (error || !kb) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Knowledge Base"
          description="Configure your knowledge base settings"
          backAction={{
            label: "Back to Knowledge",
            onClick: () => router.push('/knowledge')
          }}
        />
        <ErrorState
          title="Knowledge base not found"
          description={error || "The requested knowledge base could not be found"}
          action={{
            label: "Back to Knowledge",
            onClick: () => router.push('/knowledge')
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${kb.name}`}
        description="Configure your knowledge base settings"
        backAction={{
          label: "Back to Knowledge",
          onClick: () => router.push('/knowledge')
        }}
      />

      <div className="max-w-4xl space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings20Regular className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              View and manage basic details for this knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-fg-default">Name</label>
              <div className="mt-1 p-3 bg-bg-subtle rounded-md border border-stroke-divider">
                {kb.name}
              </div>
            </div>

            {kb.description && (
              <div>
                <label className="text-sm font-medium text-fg-default">Description</label>
                <div className="mt-1 p-3 bg-bg-subtle rounded-md border border-stroke-divider">
                  {kb.description}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-fg-default">Model</label>
              <div className="mt-1 p-3 bg-bg-subtle rounded-md border border-stroke-divider">
                {kb.model || 'gpt-4o-mini'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Sources ({kb.knowledgeSources.length})</CardTitle>
            <CardDescription>
              Data sources that this knowledge base can access
            </CardDescription>
          </CardHeader>
          <CardContent>
            {kb.knowledgeSources.length > 0 ? (
              <div className="space-y-3">
                {kb.knowledgeSources.map((source, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-bg-subtle rounded-md border border-stroke-divider"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-fg-default">{source.name}</div>
                      <div className="text-sm text-fg-muted capitalize">{source.kind}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-fg-muted">
                No knowledge sources configured
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/knowledge')}
            className="flex-1"
          >
            <ArrowLeft20Regular className="h-4 w-4 mr-2" />
            Back to Knowledge
          </Button>
        </div>
      </div>
    </div>
  )
}