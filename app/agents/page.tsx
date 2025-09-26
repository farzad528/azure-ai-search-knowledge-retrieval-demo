'use client'

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { StatusPill } from '@/components/shared/status-pill'
import {
  Bot20Regular,
  Add20Regular,
  Chat20Regular,
  Settings20Regular,
  Play20Regular,
  Delete20Regular
} from '@fluentui/react-icons'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog'

interface Agent {
  id: string
  name: string
  description?: string
  status: 'active' | 'inactive' | 'error'
  lastRun?: Date
  model?: string
  knowledgeBases?: string[]
}

interface Thread {
  id: string
  agentId: string
  agentName: string
  title: string
  lastMessage?: string
  lastActivity?: Date | string
  messageCount: number
}

export default function AgentsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('my-agents')
  const [deleteAgentDialog, setDeleteAgentDialog] = useState<{ open: boolean; agent: Agent | null }>({ open: false, agent: null })
  const [deleteThreadDialog, setDeleteThreadDialog] = useState<{ open: boolean; thread: Thread | null }>({ open: false, thread: null })
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch agents and threads from Foundry API
  useEffect(() => {
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
        if (!threadsRes.ok) {
          throw new Error(`Failed to fetch threads: ${threadsRes.status}`)
        }

        const agentsData = await agentsRes.json()
        const threadsData = await threadsRes.json()

        setAgents(agentsData.data || [])
        setThreads(threadsData.data || [])
      } catch (err: any) {
        setError(err.message || 'Failed to load data')
        console.error('Error fetching agents/threads:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDeleteAgent = async (agent: Agent) => {
    try {
      setDeleteLoading(true)
      const response = await fetch(`/api/foundry/assistants/${agent.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete agent')
      }

      // Remove agent from local state
      setAgents(prev => prev.filter(a => a.id !== agent.id))
      // Clear selection if deleted agent was selected
      if (selectedAgentId === agent.id) {
        setSelectedAgentId(null)
      }
    } catch (err: any) {
      console.error('Error deleting agent:', err)
      setError(err.message || 'Failed to delete agent')
    } finally {
      setDeleteLoading(false)
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

      // Remove thread from local state
      setThreads(prev => prev.filter(t => t.id !== thread.id))
    } catch (err: any) {
      console.error('Error deleting thread:', err)
      setError(err.message || 'Failed to delete thread')
    } finally {
      setDeleteLoading(false)
    }
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
        <ErrorState title="Error loading agents" description={error} />
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
          href: "/agent-builder",
          icon: Add20Regular
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-agents">My Agents</TabsTrigger>
          <TabsTrigger value="my-threads">My Threads</TabsTrigger>
        </TabsList>

        <TabsContent value="my-agents" className="space-y-6">
          <MyAgentsTab
            agents={agents}
            selectedAgentId={selectedAgentId}
            onSelectAgent={setSelectedAgentId}
            onDeleteAgent={(agent) => setDeleteAgentDialog({ open: true, agent })}
            router={router}
          />
        </TabsContent>

        <TabsContent value="my-threads" className="space-y-6">
          <MyThreadsTab
            threads={threads}
            onDeleteThread={(thread) => setDeleteThreadDialog({ open: true, thread })}
          />
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
        description={`Are you sure you want to delete the thread "${deleteThreadDialog.thread?.title}"? This action cannot be undone and will delete all messages in this conversation.`}
        confirmText="Delete Thread"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={() => deleteThreadDialog.thread && handleDeleteThread(deleteThreadDialog.thread)}
      />
    </div>
  )
}

interface MyAgentsTabProps {
  agents: Agent[]
  selectedAgentId: string | null
  onSelectAgent: (id: string | null) => void
  onDeleteAgent: (agent: Agent) => void
  router: any
}

function MyAgentsTab({ agents, selectedAgentId, onSelectAgent, onDeleteAgent, router }: MyAgentsTabProps) {
  if (agents.length === 0) {
    return (
      <EmptyState
        icon={Bot20Regular}
        title="No agents found"
        description="Create your first Foundry agent to get started"
        action={{
          label: "Create Agent",
          onClick: () => router.push('/agent-builder')
        }}
      />
    )
  }

  return (
    <div className="grid gap-4">
      {agents.map((agent, index) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <AgentCard
            agent={agent}
            isSelected={selectedAgentId === agent.id}
            onSelect={() => onSelectAgent(agent.id === selectedAgentId ? null : agent.id)}
            onDelete={() => onDeleteAgent(agent)}
          />
        </motion.div>
      ))}
    </div>
  )
}

interface AgentCardProps {
  agent: Agent
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}

function AgentCard({ agent, isSelected, onSelect, onDelete }: AgentCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-accent bg-accent-subtle' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-subtle">
              <Bot20Regular className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              {agent.description && (
                <CardDescription className="mt-1">{agent.description}</CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill variant={agent.status === 'active' ? 'success' : agent.status === 'error' ? 'danger' : 'neutral'}>
              {agent.status}
            </StatusPill>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="h-8 w-8 text-fg-muted hover:text-destructive hover:bg-destructive/10"
              title="Delete agent"
            >
              <Delete20Regular className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm text-fg-muted">
          <span>Model: {agent.model || 'Not configured'}</span>
          {agent.lastRun && (
            <span>Last run: {agent.lastRun.toLocaleDateString()}</span>
          )}
        </div>

        {agent.knowledgeBases && agent.knowledgeBases.length > 0 && (
          <div className="text-sm text-fg-muted">
            Knowledge bases: {agent.knowledgeBases.join(', ')}
          </div>
        )}

        {isSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
            className="flex gap-2 pt-3 border-t border-stroke-divider"
          >
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link href={`/agent-builder?assistantId=${agent.id}&mode=playground`}>
                <Play20Regular className="h-4 w-4 mr-2" />
                Try in Playground
              </Link>
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

interface MyThreadsTabProps {
  threads: Thread[]
  onDeleteThread: (thread: Thread) => void
}

function MyThreadsTab({ threads, onDeleteThread }: MyThreadsTabProps) {
  if (threads.length === 0) {
    return (
      <EmptyState
        icon={Chat20Regular}
        title="No chat threads found"
        description="Start a conversation with an agent to see threads here"
      />
    )
  }

  return (
    <div className="grid gap-4">
      {threads.map((thread, index) => (
        <motion.div
          key={thread.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <ThreadCard thread={thread} onDelete={() => onDeleteThread(thread)} />
        </motion.div>
      ))}
    </div>
  )
}

interface ThreadCardProps {
  thread: Thread
  onDelete: () => void
}

function ThreadCard({ thread, onDelete }: ThreadCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{thread.title}</CardTitle>
            <CardDescription>Agent: {thread.agentName}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-fg-muted">
              {thread.messageCount} messages
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="h-8 w-8 text-fg-muted hover:text-destructive hover:bg-destructive/10"
              title="Delete thread"
            >
              <Delete20Regular className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          {thread.lastMessage && (
            <p className="text-sm text-fg-muted truncate max-w-md">
              {thread.lastMessage}
            </p>
          )}
          <span className="text-sm text-fg-muted ml-4">
            {thread.lastActivity ?
              (thread.lastActivity instanceof Date ?
                thread.lastActivity.toLocaleDateString() :
                new Date(thread.lastActivity).toLocaleDateString()
              ) :
              'No activity'
            }
          </span>
        </div>
      </CardContent>
    </Card>
  )
}