'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Play20Regular } from '@fluentui/react-icons'
import { PageHeader } from '@/components/shared/page-header'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KeyValue } from '@/components/shared/key-value'
import { StatusPill } from '@/components/shared/status-pill'
import { EditKnowledgeBaseForm } from '@/components/forms/edit-knowledge-base-form'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { fetchKnowledgeBase, fetchKnowledgeSources, updateKnowledgeBase, deleteKnowledgeBase } from '../../../lib/api'
import { formatRelativeTime } from '@/lib/utils'
import { useEditMode } from '@/lib/edit-mode'

type KnowledgeBaseData = {
  name: string
  description?: string
  knowledgeSources?: Array<{
    name: string
    kind?: string
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
    attemptFastPath?: boolean | null
    includeActivity?: boolean | null
  }
  retrievalInstructions?: string | null
  requestLimits?: {
    maxRuntimeInSeconds?: number | null
    maxOutputSize?: number | null
  } | null
  status?: string
  lastRun?: string
  createdBy?: string
  ['@odata.etag']?: string
}

type KnowledgeSource = {
  name: string
  kind: string
}

export default function KnowledgeBaseDetailPage() {
  const { isEditMode } = useEditMode()
  const params = useParams()
  const router = useRouter()
  const knowledgeBaseId = params.id as string
  
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseData | null>(null)
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [knowledgeBaseData, sourcesData] = await Promise.all([
        fetchKnowledgeBase(knowledgeBaseId),
        fetchKnowledgeSources()
      ])
      
      console.log('Knowledge base detail:', knowledgeBaseData)
      console.log('Knowledge sources data:', sourcesData)
      
      setKnowledgeBase(knowledgeBaseData)
      setKnowledgeSources(sourcesData.value || [])
    } catch (err) {
      console.error('Error loading knowledge base:', err)
      setError(err instanceof Error ? err.message : 'Failed to load knowledge base')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (knowledgeBaseId) {
      loadData()
    }
  }, [knowledgeBaseId])

  const handleUpdateKnowledgeBase = async (data: Partial<KnowledgeBaseData>) => {
    if (!knowledgeBase) {
      return
    }

    // Ensure required fields are included
    const payload = {
      name: knowledgeBase.name,
      ...data,
      ['@odata.etag']: knowledgeBase?.['@odata.etag']
    }
    await updateKnowledgeBase(knowledgeBaseId, payload as any)
    await loadData() // Refresh data after update
  }

  const handleDeleteKnowledgeBase = async () => {
    await deleteKnowledgeBase(knowledgeBaseId)
    router.push('/knowledge-bases')
  }

  if (loading) {
    return <KnowledgeBaseDetailSkeleton />
  }

  if (error || !knowledgeBase) {
    return (
      <ErrorState
        title="Failed to load knowledge base"
        description={error || 'Knowledge base not found'}
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
        title={knowledgeBase.name}
        description={knowledgeBase.description || 'Knowledge base'}
        status={knowledgeBase.status ? {
          label: knowledgeBase.status,
          variant: knowledgeBase.status === 'active' ? 'success' : 'info'
        } : undefined}
        primaryAction={{
          label: "Try now",
          href: `/playground?knowledgeBase=${knowledgeBaseId}`,
          icon: Play20Regular
        }}
        backButton={{
          href: '/knowledge-bases',
          label: 'Back to knowledge bases'
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {isEditMode && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Knowledge base details */}
            <Card>
              <CardHeader>
                <CardTitle>Knowledge base details</CardTitle>
              </CardHeader>
              <CardContent>
                <KeyValue
                  items={[
                    {
                      key: 'Name',
                      value: knowledgeBase.name
                    },
                    {
                      key: 'Model',
                      value: knowledgeBase.models?.[0]?.azureOpenAIParameters?.modelName || 'Default'
                    },
                    {
                      key: 'Status',
                      value: knowledgeBase.status ? (
                        <StatusPill variant={knowledgeBase.status === 'active' ? 'success' : 'info'}>
                          {knowledgeBase.status}
                        </StatusPill>
                      ) : (
                        <StatusPill variant="info">Active</StatusPill>
                      )
                    },
                    {
                      key: 'Last run',
                      value: knowledgeBase.lastRun ? formatRelativeTime(knowledgeBase.lastRun) : 'Never run'
                    },
                    {
                      key: 'Created by',
                      value: knowledgeBase.createdBy || 'Unknown'
                    }
                  ]}
                />
              </CardContent>
            </Card>

            {/* Knowledge Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Knowledge sources</CardTitle>
              </CardHeader>
              <CardContent>
                {knowledgeBase.knowledgeSources?.length > 0 ? (
                  <div className="space-y-2">
                    {knowledgeBase.knowledgeSources.map((source, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-bg-subtle rounded-md"
                      >
                        <span className="text-sm font-medium">{source.name}</span>
                        <StatusPill variant="success" className="text-xs">
                          Connected
                        </StatusPill>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-fg-muted">No knowledge sources configured</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {isEditMode && (
          <TabsContent value="settings">
            <Card>
              <CardContent className="p-0">
                <EditKnowledgeBaseForm
                  knowledgeBase={knowledgeBase}
                  knowledgeSources={knowledgeSources}
                  onSubmit={handleUpdateKnowledgeBase}
                  onCancel={() => setActiveTab('overview')}
                  onDelete={handleDeleteKnowledgeBase}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

function KnowledgeBaseDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-stroke-divider">
        <LoadingSkeleton className="h-8 w-64 mb-2" />
        <LoadingSkeleton className="h-5 w-96" />
      </div>
      
      <div className="space-y-6">
        <LoadingSkeleton className="h-10 w-48" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <LoadingSkeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <LoadingSkeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}