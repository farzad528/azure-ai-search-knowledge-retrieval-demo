'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { StatusPill } from '@/components/shared/status-pill'
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog'
import {
  Bot20Regular,
  Add20Regular,
  Play20Regular,
  Delete20Regular,
  Chat20Regular
} from '@fluentui/react-icons'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface Agent {
  id: string
  name: string
  instructions?: string
  model?: string
  tools?: any[]
  status: 'active' | 'inactive' | 'error'
  created_at?: string
  metadata?: any
}

interface Thread {
  id: string
  created_at?: string
  metadata?: any
}

export default function AgentsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('agents')
  const [deleteAgentDialog, setDeleteAgentDialog] = useState<{ open: boolean; agent: Agent | null }>({ open: false, agent: null })
  const [deleteThreadDialog, setDeleteThreadDialog] = useState<{ open: boolean; thread: Thread | null }>({ open: false, thread: null })
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [agentsRes, threadsRes] = await Promise.all([
        fetch('/api/foundry/assistants'),
        fetch('/api/foundry/threads')
      ])

      if (!agentsRes.ok) {
        throw new Error(`Failed to fetch agents: ${agentsRes.status}`)
      }

      const agentsData = await agentsRes.json()
      const threadsData = threadsRes.ok ? await threadsRes.json() : { data: [] }

      // Transform the data
      const transformedAgents = (agentsData.data || []).map((agent: any) => ({
        id: agent.id,
        name: agent.name || agent.id,
        instructions: agent.instructions,
        model: agent.model,
        tools: agent.tools || [],
        status: 'active' as const,
        created_at: agent.created_at,
        metadata: agent.metadata
      }))

      setAgents(transformedAgents)
      setThreads(threadsData.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
      console.error('Error fetching agents/threads:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAgent = async (agent: Agent) => {
    try {
      setDeleteLoading(true)
      const response = await fetch(`/api/foundry/assistants/${agent.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete agent')
      }

      setAgents(prev => prev.filter(a => a.id !== agent.id))
      if (selectedAgentId === agent.id) {
        setSelectedAgentId(null)
      }
    } catch (err: any) {
      console.error('Error deleting agent:', err)
      setError(err.message || 'Failed to delete agent')
    } finally {
      setDeleteLoading(false)
      setDeleteAgentDialog({ open: false, agent: null })
    }
  }

  const handleDeleteThread = async (thread: Thread) => {
    try {
      setDeleteLoading(true)
      const response = await fetch(`/api/foundry/threads/${thread.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete thread')
      }

      setThreads(prev => prev.filter(t => t.id !== thread.id))
    } catch (err: any) {
      console.error('Error deleting thread:', err)
      setError(err.message || 'Failed to delete thread')
    } finally {
      setDeleteLoading(false)
      setDeleteThreadDialog({ open: false, thread: null })
    }
  }

  const getKnowledgeBasesFromAgent = (agent: Agent): string[] => {
    const kbNames: string[] = []
    if (agent.tools) {
      agent.tools.forEach(tool => {
        if (tool.type === 'mcp' && tool.server_url) {
          const match = tool.server_url.match(/\/agents\/([^\/]+)\/mcp/)
          if (match) {
            kbNames.push(match[1])
          }
        }
      })
    }
    return kbNames
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Agents"
          description="Manage your Foundry agents and chat threads"
        />
        <LoadingSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Agents"
          description="Manage your Foundry agents and chat threads"
        />
        <ErrorState
          title="Error loading agents"
          description={error}
          action={{
            label: "Try again",
            onClick: fetchData
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agents"
        description="Manage your Foundry agents and chat threads"
        primaryAction={{
          label: "Create Agent",
          onClick: () => router.push('/agent-builder'),
          icon: Add20Regular
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="agents">My Agents</TabsTrigger>
          <TabsTrigger value="threads">My Threads</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          {agents.length === 0 ? (
            <EmptyState
              icon={Bot20Regular}
              title="No agents found"
              description="Create your first Foundry agent to get started"
              action={{
                label: "Create Agent",
                onClick: () => router.push('/agent-builder')
              }}
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent, index) => {
                const knowledgeBases = getKnowledgeBasesFromAgent(agent)

                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card
                      className={`h-[380px] flex flex-col cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-accent ${
                        selectedAgentId === agent.id ? 'ring-2 ring-accent bg-accent-subtle' : ''
                      }`}
                      onClick={() => setSelectedAgentId(agent.id === selectedAgentId ? null : agent.id)}
                    >
                      {/* Fixed Header */}
                      <CardHeader className="pb-3 flex-shrink-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-accent-subtle flex-shrink-0">
                              <Bot20Regular className="h-5 w-5 text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg truncate">{agent.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <StatusPill variant="success">{agent.status}</StatusPill>
                                {agent.model && (
                                  <span className="text-sm text-fg-muted">
                                    {agent.model}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteAgentDialog({ open: true, agent })
                            }}
                            className="h-8 w-8 text-fg-muted hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                            title="Delete agent"
                          >
                            <Delete20Regular className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>

                      {/* Flexible Content Area */}
                      <CardContent className="flex-1 flex flex-col min-h-0 space-y-3">
                        {/* Instructions */}
                        <div className="flex-1 min-h-0">
                          {agent.instructions && (
                            <div>
                              <div className="text-sm font-medium text-fg-default mb-2">Instructions</div>
                              <div className="text-sm text-fg-muted line-clamp-3 bg-bg-subtle p-3 rounded-md">
                                {agent.instructions}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Knowledge Bases */}
                        {knowledgeBases.length > 0 && (
                          <div className="flex-shrink-0">
                            <div className="text-sm font-medium text-fg-default mb-2">
                              Knowledge Bases ({knowledgeBases.length})
                            </div>
                            <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto">
                              {knowledgeBases.slice(0, 4).map(kb => (
                                <span
                                  key={kb}
                                  className="px-2 py-1 text-xs bg-accent-subtle text-accent rounded-md truncate max-w-[120px]"
                                  title={kb}
                                >
                                  {kb}
                                </span>
                              ))}
                              {knowledgeBases.length > 4 && (
                                <span className="px-2 py-1 text-xs bg-bg-subtle text-fg-muted rounded-md">
                                  +{knowledgeBases.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>

                      {/* Fixed Footer */}
                      <CardFooter className="pt-3 flex-shrink-0">
                        <div className="flex gap-2 w-full">
                          <Button variant="outline" size="sm" asChild className="flex-1">
                            <Link href={`/agent-builder?assistantId=${agent.id}&mode=playground`}>
                              <Play20Regular className="h-4 w-4 mr-2" />
                              Try in Playground
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Add view code functionality here
                            }}
                            className="px-3"
                          >
                            View Code
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="threads" className="space-y-6">
          {threads.length === 0 ? (
            <EmptyState
              icon={Chat20Regular}
              title="No threads found"
              description="Start a conversation with an agent to see threads here"
            />
          ) : (
            <div className="grid gap-4">
              {threads.map((thread, index) => (
                <motion.div
                  key={thread.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Thread {thread.id}</CardTitle>
                          {thread.created_at && (
                            <CardDescription>
                              Created: {new Date(thread.created_at).toLocaleDateString()}
                            </CardDescription>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteThreadDialog({ open: true, thread })}
                          className="h-8 w-8 text-fg-muted hover:text-destructive hover:bg-destructive/10"
                          title="Delete thread"
                        >
                          <Delete20Regular className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Agent Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteAgentDialog.open}
        onOpenChange={(open) => setDeleteAgentDialog({ open, agent: null })}
        title="Delete Agent"
        description={`Are you sure you want to delete "${deleteAgentDialog.agent?.name}"? This action cannot be undone.`}
        confirmText="Delete Agent"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={() => deleteAgentDialog.agent && handleDeleteAgent(deleteAgentDialog.agent)}
      />

      {/* Delete Thread Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteThreadDialog.open}
        onOpenChange={(open) => setDeleteThreadDialog({ open, thread: null })}
        title="Delete Thread"
        description={`Are you sure you want to delete thread "${deleteThreadDialog.thread?.id}"? This action cannot be undone and will delete all messages in this conversation.`}
        confirmText="Delete Thread"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={() => deleteThreadDialog.thread && handleDeleteThread(deleteThreadDialog.thread)}
      />
    </div>
  )
}