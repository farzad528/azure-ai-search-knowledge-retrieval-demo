'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Play20Regular, Settings20Regular } from '@fluentui/react-icons'
import { PageHeader } from '@/components/shared/page-header'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KeyValue } from '@/components/shared/key-value'
import { StatusPill } from '@/components/shared/status-pill'
import { EditAgentForm } from '@/components/forms/edit-agent-form'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { fetchAgent, fetchKnowledgeSources, updateAgent, deleteAgent } from '../../../lib/api'
import { formatRelativeTime } from '@/lib/utils'

type AgentData = {
  name: string
  description?: string
  knowledgeSources: Array<{
    name: string
    includeReferences: boolean
  }>
  models: Array<{
    kind: string
    azureOpenAIParameters?: {
      resourceUri: string
      deploymentId: string
      modelName: string
    }
  }>
  outputConfiguration?: {
    modality: string
  }
  status?: string
  lastRun?: string
  createdBy?: string
}

type KnowledgeSource = {
  name: string
  kind: string
}

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const agentId = params.id as string
  
  const [agent, setAgent] = useState<AgentData | null>(null)
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [agentData, sourcesData] = await Promise.all([
        fetchAgent(agentId),
        fetchKnowledgeSources()
      ])
      
      console.log('Agent detail data:', agentData)
      console.log('Knowledge sources data:', sourcesData)
      
      setAgent(agentData)
      setKnowledgeSources(sourcesData.value || [])
    } catch (err) {
      console.error('Error loading agent:', err)
      setError(err instanceof Error ? err.message : 'Failed to load agent')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (agentId) {
      loadData()
    }
  }, [agentId])

  const handleUpdateAgent = async (data: Partial<AgentData>) => {
    await updateAgent(agentId, data)
    await loadData() // Refresh data after update
  }

  const handleDeleteAgent = async () => {
    await deleteAgent(agentId)
    router.push('/knowledge-agents')
  }

  if (loading) {
    return <AgentDetailSkeleton />
  }

  if (error || !agent) {
    return (
      <ErrorState
        title="Failed to load agent"
        description={error || 'Agent not found'}
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
        title={agent.name}
        description={agent.description || 'Knowledge agent'}
        status={agent.status ? {
          label: agent.status,
          variant: agent.status === 'active' ? 'success' : 'info'
        } : undefined}
        primaryAction={{
          label: "Try now",
          href: `/playground?agent=${agentId}`,
          icon: Play20Regular
        }}
        backButton={{
          href: '/knowledge-agents',
          label: 'Back to agents'
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent Details */}
            <Card>
              <CardHeader>
                <CardTitle>Agent details</CardTitle>
              </CardHeader>
              <CardContent>
                <KeyValue
                  items={[
                    {
                      key: 'Name',
                      value: agent.name
                    },
                    {
                      key: 'Model',
                      value: agent.models?.[0]?.azureOpenAIParameters?.modelName || 'Default'
                    },
                    {
                      key: 'Status',
                      value: agent.status ? (
                        <StatusPill variant={agent.status === 'active' ? 'success' : 'info'}>
                          {agent.status}
                        </StatusPill>
                      ) : (
                        <StatusPill variant="info">Active</StatusPill>
                      )
                    },
                    {
                      key: 'Last run',
                      value: agent.lastRun ? formatRelativeTime(agent.lastRun) : 'Never run'
                    },
                    {
                      key: 'Created by',
                      value: agent.createdBy || 'Unknown'
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
                {agent.knowledgeSources?.length > 0 ? (
                  <div className="space-y-2">
                    {agent.knowledgeSources.map((source, index) => (
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

        <TabsContent value="settings">
          <Card>
            <CardContent className="p-0">
              <EditAgentForm
                agent={agent}
                knowledgeSources={knowledgeSources}
                onSubmit={handleUpdateAgent}
                onCancel={() => setActiveTab('overview')}
                onDelete={handleDeleteAgent}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AgentDetailSkeleton() {
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