'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { EditKnowledgeBaseForm } from '@/components/forms/edit-knowledge-base-form'

interface KnowledgeSource {
  name: string
  kind: string
}

interface KnowledgeBase {
  name: string
  description?: string
  knowledgeSources?: Array<{
    name: string
    includeReferences?: boolean
    includeReferenceSourceData?: boolean | null
    alwaysQuerySource?: boolean | null
    maxSubQueries?: number | null
    rerankerThreshold?: number | null
  }>
  models?: Array<{
    kind: string
    azureOpenAIParameters?: {
      resourceUri?: string
      deploymentId?: string
      modelName?: string
    }
  }>
  outputConfiguration?: {
    modality: 'extractiveData' | 'answerSynthesis'
    answerInstructions?: string | null
    includeActivity?: boolean | null
  }
  retrievalInstructions?: string | null
  requestLimits?: {
    maxRuntimeInSeconds?: number | null
    maxOutputSize?: number | null
  } | null
  ['@odata.etag']?: string
}

export default function EditKnowledgeBasePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams?.has('edit-mode') ?? false
  const [kb, setKb] = useState<KnowledgeBase | null>(null)
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const kbId = params.id as string

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch the specific knowledge base
        const kbResponse = await fetch(`/api/knowledge-bases/${kbId}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        })

        if (!kbResponse.ok) {
          throw new Error(`Failed to fetch knowledge base (${kbResponse.status})`)
        }

        const kbData = await kbResponse.json()

        // Fetch all knowledge sources
        const ksResponse = await fetch('/api/knowledge-sources', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        })

        const ksData = ksResponse.ok ? await ksResponse.json() : { value: [] }
        const sources = (ksData.value || []).map((ks: any) => ({
          name: ks.name,
          kind: ks.kind || 'unknown'
        }))

        setKb(kbData)
        setKnowledgeSources(sources)
      } catch (err) {
        console.error('Error fetching knowledge base:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (kbId) {
      fetchData()
    }
  }, [kbId])

  const handleSubmit = async (payload: Partial<KnowledgeBase>) => {
    const response = await fetch(`/api/knowledge-bases/${kbId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update knowledge base')
    }

    const toastQuery = isEditMode ? '?edit-mode&status=saved' : '?status=saved'
    router.push(`/knowledge${toastQuery}`)
  }

  const handleDelete = async () => {
    const response = await fetch(`/api/knowledge-bases/${kbId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete knowledge base')
    }

    router.push('/knowledge')
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0 space-y-6">
        <PageHeader
          title={isEditMode ? "Edit Knowledge Base" : "View Knowledge Base"}
          description={isEditMode ? "Configure your knowledge base settings" : "View your knowledge base configuration"}
          backButton={{
            label: "Back to Knowledge",
            href: '/knowledge'
          }}
        />
        <LoadingSkeleton />
      </div>
    )
  }

  if (error || !kb) {
    return (
      <div className="flex flex-col flex-1 min-h-0 space-y-6">
        <PageHeader
          title={isEditMode ? "Edit Knowledge Base" : "View Knowledge Base"}
          description={isEditMode ? "Configure your knowledge base settings" : "View your knowledge base configuration"}
          backButton={{
            label: "Back to Knowledge",
            href: '/knowledge'
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
    <div className="flex flex-col flex-1 min-h-0 space-y-6">
      <EditKnowledgeBaseForm
        knowledgeBase={kb}
        knowledgeSources={knowledgeSources}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/knowledge')}
        onDelete={isEditMode ? handleDelete : undefined}
        isEditMode={isEditMode}
      />
    </div>
  )
}