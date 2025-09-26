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
  Play20Regular
} from '@fluentui/react-icons'
import Link from 'next/link'
import { motion } from 'framer-motion'

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
  const [agents, setAgents] = useState<Agent[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('my-agents')

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

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Agents"
          description="Manage your Foundry agents and chat threads"
          icon={Bot20Regular}
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
          icon={Bot20Regular}
        />
        <ErrorState message={error} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agents"
        description="Manage your Foundry agents and chat threads"
        icon={Bot20Regular}
        action={
          <Button>
            <Add20Regular className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        }
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
          />
        </TabsContent>

        <TabsContent value="my-threads" className="space-y-6">
          <MyThreadsTab threads={threads} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface MyAgentsTabProps {
  agents: Agent[]
  selectedAgentId: string | null
  onSelectAgent: (id: string | null) => void
}

function MyAgentsTab({ agents, selectedAgentId, onSelectAgent }: MyAgentsTabProps) {
  if (agents.length === 0) {
    return (
      <EmptyState
        icon={Bot20Regular}
        title="No agents found"
        description="Create your first Foundry agent to get started"
        action={
          <Button>
            <Add20Regular className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        }
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
}

function AgentCard({ agent, isSelected, onSelect }: AgentCardProps) {
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
          <StatusPill status={agent.status} />
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
            <Button variant="outline" size="sm" asChild>
              <Link href={`/agent-builder?id=${agent.id}`}>
                <Settings20Regular className="h-4 w-4 mr-2" />
                Configure
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/playground/${agent.id}`}>
                <Play20Regular className="h-4 w-4 mr-2" />
                Test
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
}

function MyThreadsTab({ threads }: MyThreadsTabProps) {
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
          <ThreadCard thread={thread} />
        </motion.div>
      ))}
    </div>
  )
}

interface ThreadCardProps {
  thread: Thread
}

function ThreadCard({ thread }: ThreadCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{thread.title}</CardTitle>
            <CardDescription>Agent: {thread.agentName}</CardDescription>
          </div>
          <div className="text-sm text-fg-muted">
            {thread.messageCount} messages
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