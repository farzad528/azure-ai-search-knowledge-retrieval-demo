'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ChevronLeft20Regular,
  Add20Regular,
  Database20Regular,
  Bot20Regular,
  Settings20Regular,
  Code20Regular,
  BookInformation20Regular,
  CheckmarkCircle20Filled,
  Circle20Regular,
  Dismiss20Regular,
  CodeText20Regular,
  History20Regular,
  Delete20Regular
} from '@fluentui/react-icons'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { fetchAgents, createFoundryAgent } from '@/lib/api'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { AgentCodeModal } from '@/components/agent-code-modal'
import { cn } from '@/lib/utils'

interface KnowledgeBase {
  name: string
  description?: string
  knowledgeSources?: any[]
}

type Section = 'model' | 'tools' | 'instructions' | 'knowledge'
type AgentMode = 'foundry' | 'search'

const SECTIONS = [
  { id: 'model' as Section, label: 'Model', icon: Bot20Regular },
  { id: 'tools' as Section, label: 'Tools', icon: Code20Regular },
  { id: 'instructions' as Section, label: 'Instructions', icon: BookInformation20Regular },
  { id: 'knowledge' as Section, label: 'Knowledge', icon: Database20Regular },
]

function AgentBuilderPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')
  const existingAssistantId = searchParams.get('assistantId')
  const mode = searchParams.get('mode')

  const [agentMode, setAgentMode] = useState<AgentMode | null>('foundry')
  const [activeSection, setActiveSection] = useState<Section>('model')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Agent configuration
  const [agentName, setAgentName] = useState(`agent-${Date.now()}`)
  const [agentInstructions, setAgentInstructions] = useState('You are a helpful AI assistant. Answer questions clearly and accurately based on the available knowledge sources.')
  const [selectedModel, setSelectedModel] = useState('gpt-4.1')
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState<Set<string>>(new Set())
  const [enabledTools, setEnabledTools] = useState({
    codeInterpreter: false,
    fileSearch: false,
    webSearch: false
  })

  // Foundry agent state
  const [assistantId, setAssistantId] = useState<string | null>(existingAssistantId || null)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [runId, setRunId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  // Thread management
  const [threads, setThreads] = useState<any[]>([])
  const [showCodeModal, setShowCodeModal] = useState(false)

  useEffect(() => {
    loadKnowledgeBases()

    // If we have an existing assistant ID (playground mode), load assistant details and create a thread
    if (existingAssistantId && mode === 'playground') {
      loadExistingAssistantDetails()
      createThread().then(thread => {
        setThreadId(thread.id)
        setThreads([{
          id: thread.id,
          created_at: new Date().toISOString(),
          messages: []
        }])
      }).catch(err => {
        console.error('Failed to create thread for existing assistant:', err)
      })
    }
  }, [existingAssistantId, mode])

  const loadExistingAssistantDetails = async () => {
    if (!existingAssistantId) return

    try {
      const response = await fetch(`/api/foundry/assistants/${existingAssistantId}`)
      if (response.ok) {
        const assistant = await response.json()
        console.log('Loaded existing assistant:', assistant)

        // Update agent details
        if (assistant.name) setAgentName(assistant.name)
        if (assistant.instructions) setAgentInstructions(assistant.instructions)
        if (assistant.model) setSelectedModel(assistant.model)

        // Extract knowledge bases from MCP tools
        if (assistant.tools) {
          const mcpTools = assistant.tools.filter(tool => tool.type === 'mcp')
          const kbNames = mcpTools.map(tool => {
            // Extract knowledge base name from server_label or server_url
            if (tool.server_label) {
              return tool.server_label.replace(/_/g, '-')
            }
            // Fallback: extract from URL
            const urlMatch = tool.server_url?.match(/\/agents\/([^\/]+)\/mcp/)
            return urlMatch ? urlMatch[1] : null
          }).filter(Boolean)

          setSelectedKnowledgeBases(new Set(kbNames))
        }
      } else {
        console.error('Failed to load existing assistant details')
      }
    } catch (err) {
      console.error('Error loading existing assistant details:', err)
    }
  }

  const loadKnowledgeBases = async () => {
    try {
      setLoading(true)
      const data = await fetchAgents()
      setKnowledgeBases(data.value || [])
      // Start with no knowledge bases selected by default
      setSelectedKnowledgeBases(new Set())
    } catch (err) {
      console.error('Failed to load knowledge bases:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKnowledgeBaseToggle = (baseName: string) => {
    setSelectedKnowledgeBases(prev => {
      const newSet = new Set(prev)
      if (newSet.has(baseName)) {
        newSet.delete(baseName)
      } else {
        newSet.add(baseName)
      }
      return newSet
    })
  }

  const handleCreateNewKnowledgeBase = () => {
    const currentUrl = window.location.pathname + window.location.search
    router.push(`/knowledge-sources/quick-create?returnUrl=${encodeURIComponent(currentUrl)}`)
  }

  const handleSaveAgent = async () => {
    setSaving(true)
    try {
      // Build MCP tools from selected knowledge bases
      const mcpTools = Array.from(selectedKnowledgeBases).map(baseName => {
        // Replace dashes with underscores for server_label
        const serverLabel = baseName.replace(/-/g, '_')

        return {
          type: 'mcp',
          server_label: serverLabel,
          server_url: `${process.env.NEXT_PUBLIC_SEARCH_ENDPOINT}/agents/${baseName}/mcp?api-version=${process.env.NEXT_PUBLIC_AZURE_SEARCH_API_VERSION || '2025-08-01-preview'}`,
          allowed_tools: ['knowledge_agent_retrieve']
        }
      })

      // Create the Foundry assistant
      const assistantData = {
        name: agentName,
        instructions: agentInstructions,
        model: selectedModel,
        tools: mcpTools
      }

      console.log('Creating assistant with data:', assistantData)
      const assistant = await createFoundryAgent(assistantData)
      console.log('Created assistant:', assistant)

      setAssistantId(assistant.id)

      // Create a thread automatically
      const thread = await createThread()
      setThreadId(thread.id)

      // Add to threads list
      setThreads([{
        id: thread.id,
        created_at: new Date().toISOString(),
        messages: []
      }])

      console.log('Agent created successfully:', { assistantId: assistant.id, threadId: thread.id })

      // Automatically transition to playground mode by updating URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.set('assistantId', assistant.id)
      newUrl.searchParams.set('mode', 'playground')
      window.history.replaceState({}, '', newUrl.toString())

    } catch (err) {
      console.error('Failed to create agent:', err)
      alert(`Failed to create agent: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const createThread = async () => {
    const response = await fetch('/api/foundry/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    if (!response.ok) {
      throw new Error('Failed to create thread')
    }

    return response.json()
  }

  const sendMessage = async () => {
    if (!currentMessage.trim() || !assistantId || !threadId || isRunning) return

    setIsRunning(true)
    const userMessage = currentMessage.trim()
    setCurrentMessage('')

    // Add user message to display
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, newUserMessage])

    try {
      // Add message to thread
      await fetch('/api/foundry/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          threadId,
          role: 'user',
          content: userMessage
        })
      })

      // Create run with MCP tool resources
      const mcpResources = Array.from(selectedKnowledgeBases).map(baseName => {
        const serverLabel = baseName.replace(/-/g, '_')
        return {
          server_label: serverLabel,
          require_approval: 'never'
          // API key will be injected server-side
        }
      })

      const runResponse = await fetch('/api/foundry/runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          threadId,
          assistantId,
          tool_resources: {
            mcp: mcpResources
          }
        })
      })

      if (!runResponse.ok) {
        throw new Error('Failed to create run')
      }

      const run = await runResponse.json()
      setRunId(run.id)

      // Poll for completion
      await pollRunStatus(run.id)

    } catch (err) {
      console.error('Failed to send message:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`,
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsRunning(false)
    }
  }

  const pollRunStatus = async (runId: string) => {
    const maxAttempts = 30 // 30 seconds timeout
    let attempts = 0

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`/api/foundry/runs/${runId}?threadId=${threadId}`)
        if (!response.ok) break

        const run = await response.json()

        if (run.status === 'completed') {
          // Fetch messages to get the response
          const messagesResponse = await fetch(`/api/foundry/messages?threadId=${threadId}`)
          if (messagesResponse.ok) {
            const threadMessages = await messagesResponse.json()
            const latestMessages = threadMessages.data || []

            // Find the latest assistant message
            const assistantMessages = latestMessages
              .filter(msg => msg.role === 'assistant')
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

            if (assistantMessages.length > 0) {
              const latestAssistant = assistantMessages[0]
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: latestAssistant.content[0]?.text?.value || 'No response content',
                timestamp: new Date().toISOString(),
                toolCalls: run.tool_calls || [],
                runId: run.id
              }])
            }
          }
          break
        } else if (run.status === 'failed') {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Run failed: ${run.last_error?.message || 'Unknown error'}`,
            timestamp: new Date().toISOString()
          }])
          break
        }

        attempts++
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (err) {
        console.error('Error polling run status:', err)
        break
      }
    }
  }

  const createNewThread = async () => {
    if (!assistantId) return

    try {
      const thread = await createThread()
      setThreads(prev => [{
        id: thread.id,
        created_at: new Date().toISOString(),
        messages: []
      }, ...prev])

      // Switch to the new thread
      switchToThread(thread.id)
    } catch (err) {
      console.error('Failed to create new thread:', err)
    }
  }

  const switchToThread = (newThreadId: string) => {
    setThreadId(newThreadId)
    setMessages([])
    setCurrentMessage('')
    setRunId(null)
    setIsRunning(false)
  }

  const deleteThread = async (threadIdToDelete: string) => {
    try {
      // Remove from local state
      setThreads(prev => prev.filter(t => t.id !== threadIdToDelete))

      // If it was the active thread, switch to another or clear
      if (threadId === threadIdToDelete) {
        const remainingThreads = threads.filter(t => t.id !== threadIdToDelete)
        if (remainingThreads.length > 0) {
          switchToThread(remainingThreads[0].id)
        } else {
          setThreadId(null)
          setMessages([])
        }
      }
    } catch (err) {
      console.error('Failed to delete thread:', err)
    }
  }

  const updateAssistantDetails = async () => {
    if (!assistantId) return

    try {
      // Build MCP tools from selected knowledge bases
      const mcpTools = Array.from(selectedKnowledgeBases).map(baseName => {
        // Replace dashes with underscores for server_label
        const serverLabel = baseName.replace(/-/g, '_')

        return {
          type: 'mcp',
          server_label: serverLabel,
          server_url: `${process.env.NEXT_PUBLIC_SEARCH_ENDPOINT}/agents/${baseName}/mcp?api-version=${process.env.NEXT_PUBLIC_AZURE_SEARCH_API_VERSION || '2025-08-01-preview'}`,
          allowed_tools: ['knowledge_agent_retrieve']
        }
      })

      const response = await fetch(`/api/foundry/assistants/${assistantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: agentName,
          instructions: agentInstructions,
          tools: mcpTools
        })
      })

      if (response.ok) {
        console.log('Assistant details updated successfully')
      } else {
        console.error('Failed to update assistant details')
      }
    } catch (err) {
      console.error('Error updating assistant details:', err)
    }
  }

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'model':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Model Configuration</h2>
              <Select
                value={selectedModel}
                onValueChange={setSelectedModel}
              >
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4.1">GPT-4.1 (MCP Compatible)</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o (Latest)</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-bg-secondary rounded-lg max-w-2xl">
              <h3 className="text-sm font-medium mb-2">Model Capabilities</h3>
              <ul className="text-sm text-fg-muted space-y-1">
                <li>• 128K token context window</li>
                <li>• Optimized for conversation and reasoning</li>
                <li>• Supports function calling and JSON mode</li>
              </ul>
            </div>
          </div>
        )

      case 'tools':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold mb-4">Tools</h2>
            <div className="space-y-3 max-w-2xl">
              <label className="flex items-start gap-3 p-4 border border-stroke-card rounded-lg cursor-pointer hover:bg-bg-tertiary">
                <input
                  type="checkbox"
                  checked={enabledTools.codeInterpreter}
                  onChange={(e) => setEnabledTools({...enabledTools, codeInterpreter: e.target.checked})}
                  className="mt-0.5 h-4 w-4"
                />
                <div className="flex-1">
                  <div className="font-medium">Code Interpreter</div>
                  <div className="text-sm text-fg-muted mt-1">Execute Python code in a Jupyter notebook environment</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-stroke-card rounded-lg cursor-pointer hover:bg-bg-tertiary">
                <input
                  type="checkbox"
                  checked={enabledTools.fileSearch}
                  onChange={(e) => setEnabledTools({...enabledTools, fileSearch: e.target.checked})}
                  className="mt-0.5 h-4 w-4"
                />
                <div className="flex-1">
                  <div className="font-medium">File Search</div>
                  <div className="text-sm text-fg-muted mt-1">Search through uploaded files and documents</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-stroke-card rounded-lg cursor-pointer hover:bg-bg-tertiary">
                <input
                  type="checkbox"
                  checked={enabledTools.webSearch}
                  onChange={(e) => setEnabledTools({...enabledTools, webSearch: e.target.checked})}
                  className="mt-0.5 h-4 w-4"
                />
                <div className="flex-1">
                  <div className="font-medium">Web Search</div>
                  <div className="text-sm text-fg-muted mt-1">Search the web for real-time information</div>
                </div>
              </label>
            </div>
          </div>
        )

      case 'instructions':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold mb-4">Instructions</h2>
            <Card className="p-6 max-w-4xl">
              <Textarea
                value={agentInstructions}
                onChange={(e) => setAgentInstructions(e.target.value)}
                placeholder="Describe what this agent should do..."
                className="min-h-64 font-mono text-sm"
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-fg-muted">
                  {agentInstructions.length} characters
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary">Load template</Button>
                  <Button size="sm" variant="secondary">Clear</Button>
                </div>
              </div>
            </Card>
          </div>
        )

      case 'knowledge':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Knowledge</h2>
              <p className="text-sm text-fg-muted mt-1">Connect knowledge bases to ground your agent</p>
            </div>

            <div className="max-w-4xl space-y-4">
              {loading ? (
                <LoadingSkeleton className="h-12" />
              ) : (
                <>
                  {/* Dropdown for adding knowledge bases */}
                  <div className="relative">
                    <select
                      className="w-full p-3 pr-10 border border-stroke-card rounded-lg bg-bg-primary text-fg-primary appearance-none cursor-pointer hover:border-stroke-accent focus:outline-none focus:ring-2 focus:ring-stroke-focus"
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === 'create-new') {
                          handleCreateNewKnowledgeBase()
                        } else if (value && value !== '') {
                          handleKnowledgeBaseToggle(value)
                        }
                        // Reset dropdown to placeholder
                        setTimeout(() => {
                          e.target.value = ''
                        }, 100)
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        + Add knowledge base
                      </option>
                      {knowledgeBases
                        .filter(base => !selectedKnowledgeBases.has(base.name))
                        .map((base) => (
                          <option
                            key={base.name}
                            value={base.name}
                          >
                            {base.name}
                          </option>
                        ))}
                      {knowledgeBases.length > 0 && (
                        <>
                          <option value="" disabled>──────────</option>
                          <option value="create-new">
                            + Create new knowledge base
                          </option>
                        </>
                      )}
                      {knowledgeBases.length === 0 && (
                        <option value="create-new">
                          + Create new knowledge base
                        </option>
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Selected knowledge bases */}
                  {selectedKnowledgeBases.size > 0 ? (
                    <div className="space-y-2">
                      {Array.from(selectedKnowledgeBases).map((baseName) => {
                        const base = knowledgeBases.find(b => b.name === baseName)
                        if (!base) return null

                        const sourceCount = base.knowledgeSources?.length || 0
                        const sourceTypes = base.knowledgeSources?.map(ks => ks.kind || 'unknown').filter((v, i, a) => a.indexOf(v) === i) || []

                        return (
                          <div
                            key={base.name}
                            className="flex items-center gap-3 p-4 border border-stroke-card rounded-lg bg-bg-secondary"
                          >
                            <CheckmarkCircle20Filled className="h-5 w-5 text-fg-accent flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{base.name}</span>
                              </div>
                              <p className="text-sm text-fg-muted">
                                Knowledge Base • {sourceCount} source{sourceCount !== 1 ? 's' : ''}
                                {sourceTypes.length > 0 && ` • ${sourceTypes.join(', ')}`}
                              </p>
                              {base.description && (
                                <p className="text-xs text-fg-muted mt-1">{base.description}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => console.log('Settings', base.name)}
                              >
                                <Settings20Regular className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleKnowledgeBaseToggle(base.name)}
                              >
                                <Dismiss20Regular className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-stroke-card rounded-lg bg-bg-secondary">
                      <Database20Regular className="h-10 w-10 mx-auto text-fg-muted mb-3" />
                      <p className="text-sm text-fg-muted">No knowledge bases connected</p>
                      <p className="text-xs text-fg-muted mt-1">Use the dropdown above to add knowledge bases</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )
    }
  }

  // Show chat interface if agent is created
  if (assistantId) {
    return (
      <div className="flex h-screen bg-bg-primary">
        {/* Left Panel - Agent Info & Threads */}
        <div className="w-80 bg-bg-secondary border-r border-stroke-divider flex flex-col">
          <div className="p-4 border-b border-stroke-divider">
            <input
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="text-lg font-semibold bg-transparent border-0 focus:ring-1 focus:ring-stroke-focus rounded px-1 w-full"
              placeholder="Agent name"
            />
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-fg-muted">Assistant:</span>
                <code className="text-xs bg-bg-tertiary px-2 py-0.5 rounded font-mono">{assistantId}</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-fg-muted">Thread:</span>
                <code className="text-xs bg-bg-tertiary px-2 py-0.5 rounded font-mono">{threadId}</code>
              </div>
              {runId && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-fg-muted">Run:</span>
                  <code className="text-xs bg-bg-tertiary px-2 py-0.5 rounded font-mono">{runId}</code>
                </div>
              )}
            </div>
          </div>

          {/* Thread Management */}
          <div className="p-4 border-b border-stroke-divider">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Threads</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={createNewThread}
                className="gap-1"
              >
                <Add20Regular className="h-4 w-4" />
                New
              </Button>
            </div>

            <div className="space-y-1 max-h-48 overflow-auto">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded text-xs cursor-pointer hover:bg-bg-hover",
                    thread.id === threadId ? "bg-bg-accent-subtle text-fg-accent" : ""
                  )}
                  onClick={() => switchToThread(thread.id)}
                >
                  <History20Regular className="h-3 w-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">
                      Thread {thread.id.slice(-8)}
                    </div>
                    <div className="text-fg-muted">
                      {new Date(thread.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteThread(thread.id)
                    }}
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <Delete20Regular className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {threads.length === 0 && (
                <div className="text-xs text-fg-muted text-center py-4">
                  No threads yet
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-auto">
            <div>
              <h3 className="text-sm font-semibold mb-2">Knowledge Bases</h3>
              <div className="space-y-2">
                {/* Dropdown for adding knowledge bases */}
                <div className="relative">
                  <select
                    className="w-full text-xs p-2 pr-8 border border-stroke-card rounded bg-bg-tertiary text-fg-primary appearance-none cursor-pointer hover:border-stroke-accent focus:outline-none focus:ring-1 focus:ring-stroke-focus"
                    onChange={(e) => {
                      const value = e.target.value
                      if (value && value !== '') {
                        handleKnowledgeBaseToggle(value)
                      }
                      // Reset dropdown to placeholder
                      setTimeout(() => {
                        e.target.value = ''
                      }, 100)
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      + Add knowledge base
                    </option>
                    {knowledgeBases
                      .filter(base => !selectedKnowledgeBases.has(base.name))
                      .map((base) => (
                        <option
                          key={base.name}
                          value={base.name}
                        >
                          {base.name}
                        </option>
                      ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-3 w-3 text-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Selected knowledge bases */}
                {Array.from(selectedKnowledgeBases).map(baseName => (
                  <div key={baseName} className="flex items-center justify-between text-xs p-2 bg-bg-tertiary rounded">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{baseName}</div>
                      <div className="text-fg-muted">MCP Tool: {baseName.replace(/-/g, '_')}</div>
                    </div>
                    <button
                      onClick={() => handleKnowledgeBaseToggle(baseName)}
                      className="ml-2 p-1 hover:bg-bg-hover rounded text-fg-muted hover:text-fg-default"
                      title="Remove knowledge base"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {selectedKnowledgeBases.size === 0 && (
                  <div className="text-xs text-fg-muted text-center py-2">
                    No knowledge bases selected
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Model</h3>
              <p className="text-xs text-fg-muted">{selectedModel}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">System Instructions</h3>
              <div className="space-y-2">
                <textarea
                  value={agentInstructions}
                  onChange={(e) => setAgentInstructions(e.target.value)}
                  placeholder="Enter system instructions..."
                  className="w-full text-xs p-2 bg-bg-tertiary rounded resize-none border-0 focus:ring-1 focus:ring-stroke-focus"
                  rows={4}
                />
                <p className="text-xs text-fg-muted">
                  {agentInstructions.length} characters
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-stroke-divider">
            <Button
              variant="secondary"
              className="w-full"
              onClick={async () => {
                // Save agent details before going back
                await updateAssistantDetails()

                if (mode === 'playground') {
                  // If in playground mode, go back to agents
                  router.push('/agents')
                } else {
                  // If in builder mode, reset state
                  setAssistantId(null)
                  setThreadId(null)
                  setRunId(null)
                  setMessages([])
                  setThreads([])
                }
              }}
            >
              {mode === 'playground' ? 'Back to Agents' : 'Back to Builder'}
            </Button>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          <div className="border-b border-stroke-divider p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Test your agent</h2>
                <p className="text-sm text-fg-muted">Send messages to test the MCP knowledge integration</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowCodeModal(true)}
                className="gap-2"
              >
                <CodeText20Regular className="h-4 w-4" />
                View Code
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Bot20Regular className="h-12 w-12 mx-auto text-fg-muted mb-3" />
                <p className="text-sm text-fg-muted">Start a conversation to test your agent</p>
                <p className="text-xs text-fg-muted mt-1">Try asking about topics covered in your knowledge bases</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3 max-w-4xl",
                    message.role === 'user' ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    message.role === 'user'
                      ? "bg-bg-accent text-fg-on-accent"
                      : "bg-bg-secondary text-fg-secondary"
                  )}>
                    {message.role === 'user' ? 'U' : 'A'}
                  </div>
                  <div className={cn(
                    "p-3 rounded-lg",
                    message.role === 'user'
                      ? "bg-bg-accent text-fg-on-accent ml-12"
                      : "bg-bg-secondary mr-12"
                  )}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    {message.toolCalls && message.toolCalls.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-stroke-divider">
                        <div className="text-xs text-fg-muted">
                          🔧 Tools used: {message.toolCalls.map(tc => tc.type || 'MCP').join(', ')}
                        </div>
                      </div>
                    )}
                    {message.runId && (
                      <div className="text-xs text-fg-muted mt-1">Run ID: {message.runId}</div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isRunning && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-bg-secondary text-fg-secondary flex items-center justify-center">
                  A
                </div>
                <div className="bg-bg-secondary p-3 rounded-lg mr-12">
                  <div className="flex items-center gap-2 text-sm text-fg-muted">
                    <div className="animate-spin h-4 w-4 border-2 border-fg-muted border-t-transparent rounded-full"></div>
                    Thinking...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-stroke-divider p-4">
            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask your agent a question..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                disabled={isRunning}
              />
              <Button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isRunning}
              >
                Send
              </Button>
            </div>
            <p className="text-xs text-fg-muted mt-2">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* Code Modal */}
        <AgentCodeModal
          isOpen={showCodeModal}
          onClose={() => setShowCodeModal(false)}
          agentName={agentName}
          selectedKnowledgeBases={Array.from(selectedKnowledgeBases)}
          agentInstructions={agentInstructions}
          selectedModel={selectedModel}
          assistantId={assistantId}
          threadId={threadId}
        />
      </div>
    )
  }


  return (
    <div className="flex h-screen bg-bg-primary">
      {/* Left Navigation */}
      <div className="w-64 bg-bg-secondary border-r border-stroke-divider flex flex-col">
        <div className="p-4 border-b border-stroke-divider">
          <div className="flex items-center gap-2 mb-3">
            <h1 className="text-lg font-semibold">Agent Builder</h1>
            <div className="ml-auto">
              <span className="text-xs px-2 py-1 rounded bg-bg-accent-subtle text-fg-accent font-medium">
                {agentMode === 'foundry' ? 'Foundry' : 'Search'}
              </span>
            </div>
          </div>
          <Input
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="Agent name"
            className="mt-2"
          />
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {SECTIONS.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeSection === section.id
                      ? "bg-bg-accent-subtle text-fg-accent"
                      : "text-fg-default hover:bg-bg-hover"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{section.label}</span>
                  {(section.id === 'knowledge' && selectedKnowledgeBases.size > 0) && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-bg-accent text-fg-on-accent">
                      {selectedKnowledgeBases.size}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-stroke-divider space-y-2">
          {agentMode === 'foundry' ? (
            <>
              <Button
                className="w-full"
                onClick={handleSaveAgent}
                disabled={saving}
              >
                {saving ? 'Creating agent...' : 'Create Foundry Agent'}
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1">
                  Save as draft
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => setShowCodeModal(true)}
                >
                  <CodeText20Regular className="h-4 w-4" />
                  Code
                </Button>
              </div>
              <p className="text-xs text-fg-muted mt-2 text-center">
                You can add knowledge bases after creating the agent
              </p>
            </>
          ) : (
            <>
              <Button
                className="w-full"
                onClick={() => alert('Azure AI Search agent creation - Coming soon!')}
              >
                Create Search Agent
              </Button>
              <Button variant="secondary" className="w-full">
                Configure Index
              </Button>
              <p className="text-xs text-fg-muted mt-2 text-center">
                Direct search integration mode
              </p>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderSectionContent()}
        </div>
      </div>

      {/* Code Modal */}
      <AgentCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        agentName={agentName}
        selectedKnowledgeBases={Array.from(selectedKnowledgeBases)}
        agentInstructions={agentInstructions}
        selectedModel={selectedModel}
        assistantId={assistantId}
        threadId={threadId}
      />
    </div>
  )
}

export default function AgentBuilderPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div>Loading...</div></div>}>
      <AgentBuilderPageContent />
    </Suspense>
  )
}