'use client'

import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Send20Regular, Attach20Regular, Settings20Regular, Bot20Regular, Person20Regular, ChevronDown20Regular, ChevronUp20Regular, Options20Regular, Code20Regular, Dismiss20Regular } from '@fluentui/react-icons'
import { AgentAvatar } from '@/components/agent-avatar'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VoiceInput } from '@/components/ui/voice-input'
import { ImageInput } from '@/components/ui/image-input'
import { RuntimeSettingsPanel } from '@/components/runtime-settings-panel'
import { ViewCodeModal } from '@/components/view-code-modal'
import { DocumentViewerModal } from '@/components/document-viewer-modal'
import { SourceKindIcon } from '@/components/source-kind-icon'
import { aggregateKinds, SourceKind } from '@/lib/sourceKinds'
import { InlineCitationsText } from '@/components/inline-citations'
import { Tooltip } from '@/components/ui/tooltip'
import { fetchKnowledgeBases, retrieveFromKnowledgeBase } from '../lib/api'
import { processImageFile, ProcessedImageResult } from '@/lib/imageProcessing'
import { useConversationStarters } from '@/lib/conversationStarters'
import { cn, formatRelativeTime, cleanTextSnippet } from '@/lib/utils'

type KnowledgeAgent = {
  id: string
  name: string
  model?: string
  sources: string[]
  sourcesWithKinds?: Array<{
    name: string
    kind: 'indexedOneLake' | 'searchIndex' | 'azureBlob' | 'remoteSharePoint' | 'indexedSharePoint' | 'web'
  }>
  status?: string
  outputConfiguration?: { modality?: string; answerInstructions?: string }
  retrievalInstructions?: string
  knowledgeSources?: Array<{
    name: string
  }>
}

type MessageContent = 
  | { type: 'text'; text: string }
  | { type: 'image'; image: { url: string; file?: File } }

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: MessageContent[]
  timestamp: Date
  references?: Reference[]
  activity?: Activity[]
  reasoning?: string
}

type Reference = {
  type: string
  id: string
  activitySource: number
  sourceData?: any
  rerankerScore?: number
  docKey?: string
  blobUrl?: string
}

type Activity = {
  type: string
  id: number
  inputTokens?: number
  outputTokens?: number
  elapsedMs?: number
  knowledgeSourceName?: string
  queryTime?: string
  count?: number
  searchIndexArguments?: any
  azureBlobArguments?: any
}

export function PlaygroundView() {
  const searchParams = useSearchParams()
  const agentId = searchParams.get('agent')
  
  const [agents, setAgents] = useState<KnowledgeAgent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<KnowledgeAgent | null>(null)
  const [agentsLoading, setAgentsLoading] = useState<boolean>(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string
    title: string
    timestamp: Date
    agentId: string
    messages: Message[]
  }>>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  // Multi-image attachments (id + dataUrl). Processing status ensures we don't send incomplete data URLs.
  const [images, setImages] = useState<Array<{ id: string; dataUrl: string; status: 'processing' | 'ready' }>>([])
  const [imageWarning, setImageWarning] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pendingQueue, setPendingQueue] = useState<Array<{ prompt: string; images: string[] }>>([])
  const [processing, setProcessing] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [runtimeSettingsOpen, setRuntimeSettingsOpen] = useState(false)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [runtimeSettings, setRuntimeSettings] = useState({
    knowledgeSourceParams: []
  })
  const [docViewerUrl, setDocViewerUrl] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load agents and chat history
  useEffect(() => {
    const loadAgents = async () => {
      try {
        setAgentsLoading(true)
  const data = await fetchKnowledgeBases()
        const rawAgents = data.value || []
        
        // Fetch knowledge sources to get their kinds
        const ksResponse = await fetch('/api/knowledge-sources', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        })
        const ksData = ksResponse.ok ? await ksResponse.json() : { value: [] }
        const sourceKindMap = new Map(
          (ksData.value || []).map((ks: any) => [ks.name, ks.kind])
        )

        // Map agents with proper structure from actual Azure API
        const agentsList: KnowledgeAgent[] = rawAgents.map(agent => ({
          id: agent.name,
          name: agent.name,
          model: agent.models?.[0]?.azureOpenAIParameters?.modelName,
          sources: (agent.knowledgeSources || []).map((ks: any) => ks.name),
          sourcesWithKinds: (agent.knowledgeSources || []).map((ks: any) => ({
            name: ks.name,
            kind: (sourceKindMap.get(ks.name) || 'searchIndex') as 'indexedOneLake' | 'searchIndex' | 'azureBlob' | 'remoteSharePoint' | 'indexedSharePoint' | 'web'
          })),
          status: 'active',
          description: agent.description,
          outputConfiguration: agent.outputConfiguration,
          retrievalInstructions: agent.retrievalInstructions,
          knowledgeSources: (agent.knowledgeSources || []).map((ks: any) => ({ name: ks.name }))
        }))
        
        setAgents(agentsList)

        if (agentId) {
          const agent = agentsList.find(a => a.id === agentId || a.name === agentId)
          if (agent) {
            setSelectedAgent(agent)
          }
        } else {
          if (agentsList.length > 0) {
            setSelectedAgent(agentsList[0])
          }
        }
      } catch (err) {
        console.error('Failed to load agents:', err)
      }
      finally {
        setAgentsLoading(false)
      }
    }
    
    // Load chat history from localStorage
    const loadChatHistory = () => {
      try {
        const stored = localStorage.getItem('chatHistory')
        if (stored) {
          const parsed = JSON.parse(stored)
          const historyWithDates = parsed.map((chat: any) => ({
            ...chat,
            timestamp: new Date(chat.timestamp),
            messages: chat.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }))
          setChatHistory(historyWithDates)
        }
      } catch (err) {
        console.error('Failed to load chat history:', err)
      }
    }
    
    loadAgents()
    loadChatHistory()
  }, [agentId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Save chat history to localStorage
  const saveChatHistory = (history: typeof chatHistory) => {
    try {
      localStorage.setItem('chatHistory', JSON.stringify(history))
    } catch (err) {
      console.error('Failed to save chat history:', err)
    }
  }

  // Start new chat
  const startNewChat = () => {
    if (messages.length > 0 && selectedAgent) {
      // Save current chat if it has messages
      const title = messages[0]?.content.find(c => c.type === 'text')?.text?.slice(0, 50) || 'New conversation'
      const newChat = {
        id: Date.now().toString(),
        title: title + (title.length > 50 ? '...' : ''),
        timestamp: new Date(),
        agentId: selectedAgent.id,
        messages: messages
      }
      
      const updatedHistory = [newChat, ...chatHistory]
      setChatHistory(updatedHistory)
      saveChatHistory(updatedHistory)
    }
    
    setMessages([])
    setCurrentChatId(null)
  }

  // Load existing chat
  const loadChat = (chat: typeof chatHistory[0]) => {
    setMessages(chat.messages)
    setCurrentChatId(chat.id)
  }

  // Update current chat when messages change
  useEffect(() => {
    if (messages.length > 0 && selectedAgent) {
      const title = messages[0]?.content.find(c => c.type === 'text')?.text?.slice(0, 50) || 'New conversation'
      
      if (currentChatId) {
        // Update existing chat
        const updatedHistory = chatHistory.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages, timestamp: new Date() }
            : chat
        )
        setChatHistory(updatedHistory)
        saveChatHistory(updatedHistory)
      }
    }
  }, [messages, currentChatId, selectedAgent, chatHistory])

  // Unified processing function
  const processRequest = async (job: { prompt: string; images: string[] }) => {
    if (!selectedAgent) return
    const contentParts: MessageContent[] = []
    for (const url of job.images) {
      contentParts.push({ type: 'image', image: { url } })
    }
    if (job.prompt) contentParts.push({ type: 'text', text: job.prompt })
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: contentParts,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    const convertContent = async (c: MessageContent) => {
      if (c.type === 'text') return { type: 'text', text: c.text }
      if (c.type === 'image') {
        // Ensure data URL format (starts with data:)
        return { type: 'image', image: { url: c.image.url } } // drop any legacy fields like detail
      }
      return c as any
    }
    const azureMessages = [
      ...await Promise.all(messages.map(async (m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: await Promise.all(m.content.map(convertContent))
      })) ),
      { role: 'user' as const, content: await Promise.all(contentParts.map(convertContent)) }
    ]
    try {
  const response = await retrieveFromKnowledgeBase(selectedAgent.id, azureMessages, runtimeSettings)
      let assistantText = 'I apologize, but I was unable to generate a response.'
      if (response.response && response.response.length > 0) {
        const rc = response.response[0].content
        if (rc && rc.length > 0) assistantText = rc[0].text || assistantText
      }
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: [{ type: 'text', text: assistantText }],
        timestamp: new Date(),
        references: response.references || [],
        activity: response.activity || []
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: [{ type: 'text', text: 'Error processing request. Please try again.' }],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  useEffect(() => {
    if (pendingQueue.length === 0 || processing) return
    let cancelled = false
    const run = async () => {
      setProcessing(true)
      setIsLoading(true)
      while (pendingQueue.length > 0 && !cancelled) {
        const [next, ...rest] = pendingQueue
        setPendingQueue(rest)
        await processRequest(next)
      }
      setIsLoading(false)
      setProcessing(false)
    }
    run()
    return () => { cancelled = true }
  }, [pendingQueue, processing, selectedAgent])

  const enqueuePrompt = (prompt: string, imageUrls: string[]) => {
    const text = prompt.trim()
    if (!text && imageUrls.length === 0) return
    setPendingQueue(prev => [...prev, { prompt: text, images: imageUrls }])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && images.length === 0) || !selectedAgent) return
    if (images.some(i => i.status === 'processing')) {
      setImageWarning('Please wait for image processing to finish')
      return
    }
    enqueuePrompt(input, images.map(i => i.dataUrl))
    setInput('')
    setImages([])
    setImageWarning('')
  }

  const sendPrompt = (prompt: string) => enqueuePrompt(prompt, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (isLoading) return
    const items = e.clipboardData?.items
    if (!items) return
    let added = 0
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        if (images.length + added >= 10) { setImageWarning('Maximum of 10 images reached'); break }
        const file = item.getAsFile()
        if (file) {
          const url = URL.createObjectURL(file)
          await handleImageSelect(url, file)
          added++
          e.preventDefault()
        }
      }
    }
  }

  const handleVoiceInput = (transcript: string) => {
    setInput(prev => prev + (prev ? ' ' : '') + transcript)
    textareaRef.current?.focus()
  }

  const handleImageSelect = async (imageUrl: string, file: File) => {
    // imageUrl is a blob URL for quick preview.
    // We optimistically process immediately so user sees optimized dimensions & size before sending.
    // Rationale for processing (aligned with vision model internal scaling):
    //  - Long side >2048px yields no extra model detail (will be downscaled internally).
    //  - Ensuring short side >= ~768px (without upscaling beyond original) preserves high-detail tiling ceiling.
    //  - Compression targets <=4MB to avoid unnecessary bandwidth while safely under platform limits.
  //  - No 'detail' property is sent (API version 2025-11-01-preview does not support it); we just provide a data URL.
    if (images.length >= 10) { setImageWarning('Maximum of 10 images reached'); return }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setImages(prev => [...prev, { id, dataUrl: imageUrl, status: 'processing' }])
    try {
      const processed = await processImageFile(file, {
        maxLongSide: 2048,
        targetMinShortSide: 768,
        maxBytes: 4 * 1024 * 1024
      })
      setImages(prev => prev.map(img => img.id === id ? { ...img, dataUrl: processed.dataUrl, status: 'ready' } : img))
    } catch (err) {
      console.warn('Processing failed; converting to base64 fallback.', err)
      try {
        const fallback = await convertBlobToBase64(file)
        setImages(prev => prev.map(img => img.id === id ? { ...img, dataUrl: fallback, status: 'ready' } : img))
      } catch (inner) {
        console.error('Fallback failed; removing image.', inner)
        setImages(prev => prev.filter(img => img.id !== id))
      }
    }
  }

  const handleImageRemove = (id: string) => {
    setImages(prev => prev.filter(img => {
      if (img.id === id && img.dataUrl.startsWith('blob:')) {
        URL.revokeObjectURL(img.dataUrl)
      }
      return img.id !== id
    }))
    setImageWarning('')
  }

  // Convert blob URL to base64 data URL
  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  if (!selectedAgent) {
    return (
      <div className="h-[calc(100vh-7rem)] flex items-center justify-center">
        <div className="text-center">
          {agentsLoading ? (
            <>
              <div className="flex items-center justify-center mb-3">
                <div className="h-8 w-8 border-2 border-fg-muted border-t-transparent rounded-full animate-spin" aria-label="Loading agents" />
              </div>
              <p className="text-sm text-fg-muted">Loading agents…</p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-2">No agent selected</h2>
              <p className="text-fg-muted">Please select or create a knowledge agent to start chatting.</p>
            </>
          )}
        </div>
      </div>
    )
  }

  // Reusable hook for conversation starters
  const { starters, isGeneralFallback: isGeneral } = useConversationStarters(selectedAgent?.id)


  return (
    <div className="h-[calc(100vh-7rem)] flex">
      {/* Left Sidebar - Thread History */}
      <div className="w-80 border-r border-stroke-divider flex flex-col">
        <div className="p-6 border-b border-stroke-divider">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-lg">Conversations</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={startNewChat}
              className="text-xs"
            >
              New Chat
            </Button>
          </div>
          <p className="text-sm text-fg-muted">Chat history with {selectedAgent?.name}</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatHistory
            .filter(chat => chat.agentId === selectedAgent?.id)
            .map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "p-4 border-b border-stroke-divider cursor-pointer hover:bg-bg-hover transition-colors",
                  currentChatId === chat.id && "bg-bg-subtle"
                )}
                onClick={() => loadChat(chat)}
              >
                <div className="font-medium text-sm truncate mb-1">
                  {chat.title}
                </div>
                <div className="text-xs text-fg-muted">
                  {formatRelativeTime(chat.timestamp)}
                </div>
                <div className="text-xs text-fg-muted mt-1">
                  {chat.messages.length} messages
                </div>
              </div>
            ))}
          
          {chatHistory.filter(chat => chat.agentId === selectedAgent?.id).length === 0 && (
            <div className="text-center py-8 text-fg-muted text-sm">
              No previous conversations
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-stroke-divider p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AgentAvatar size={44} iconSize={22} variant="subtle" title={selectedAgent.name} />
              <div>
                <h1 className="font-semibold text-xl flex items-center gap-2">
                  {selectedAgent.name}
                  <span className={cn(
                    'text-[10px] uppercase tracking-wide px-2 py-0.5 rounded font-medium',
                    selectedAgent.outputConfiguration?.modality === 'answerSynthesis' && 'bg-accent-subtle text-accent',
                    selectedAgent.outputConfiguration?.modality === 'extractiveData' && 'bg-purple-100/50 text-purple-600 dark:text-purple-300'
                  )}>
                    {selectedAgent.outputConfiguration?.modality === 'answerSynthesis' && 'Answer'}
                    {selectedAgent.outputConfiguration?.modality === 'extractiveData' && 'Extract'}
                    {!selectedAgent.outputConfiguration?.modality && 'Default'}
                  </span>
                </h1>
                <p className="text-sm text-fg-muted flex items-center gap-3 flex-wrap">
                  <span>{selectedAgent.model || 'Default model'}</span>
                  <span className="text-fg-muted">•</span>
                  <span>{selectedAgent.sources.length} source{selectedAgent.sources.length !== 1 && 's'}</span>
                  {selectedAgent && (selectedAgent as any).sourceDetails && (
                    <span className="flex items-center gap-1 ml-1">
                      {Object.entries(aggregateKinds((selectedAgent as any).sourceDetails))
                        .filter(([_, count]) => count > 0)
                        .map(([kind, count]) => (
                          <Tooltip key={kind} content={`${count} ${kind} source${count>1?'s':''}`}>
                            <SourceKindIcon kind={kind as SourceKind} size={16} boxSize={30} />
                          </Tooltip>
                        ))}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCodeModal(true)}
                aria-label="View code"
              >
                <Code20Regular className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRuntimeSettingsOpen(!runtimeSettingsOpen)}
                aria-label="Runtime settings"
              >
                <Options20Regular className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(true)}
                aria-label="Agent settings"
              >
                <Settings20Regular className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block mb-6">
                <AgentAvatar size={64} iconSize={32} variant="subtle" title={selectedAgent.name} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
              <p className="text-fg-muted max-w-md mx-auto mb-3">
                {isGeneral
                  ? 'General suggestions'
                  : 'Ask me anything about your domain. These starters illustrate increasing complexity.'}
              </p>
              {/* Complexity helper text removed */}

              {/* Dynamic Conversation Starters */}
              {isGeneral ? (
                <div className="max-w-xl mx-auto mt-6">
                  <Card className="bg-bg-subtle border-dashed border-stroke-divider">
                    <CardContent className="p-6 text-left">
                      <div className="text-sm font-medium mb-2">No domain-specific starters yet</div>
                      <p className="text-xs text-fg-muted mb-4">Create or configure a knowledge agent with domain sources to see tailored prompts here.</p>
                      <div className="space-y-2">
                        {["Summarize key themes across the most recent documents.", "What gaps or missing details should I clarify next?"].map((g, i) => (
                          <button
                            key={i}
                            onClick={() => sendPrompt(g)}
                            disabled={isLoading}
                            className="w-full text-left p-3 rounded-md bg-bg-card hover:bg-bg-hover transition text-xs border border-stroke-divider disabled:opacity-60"
                          >{g}</button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                  {starters.map((s, idx) => {
                    const isFirstActive = idx === 0 && isLoading
                    const requiresImage = s.prompt.toLowerCase().includes('upload')
                    return (
                      <Card
                        key={idx}
                        className={cn('relative cursor-pointer hover:elevation-sm hover:scale-105 transition-all duration-150 bg-bg-card border border-stroke-divider active:scale-95', isFirstActive && 'opacity-75')}
                        onClick={() => sendPrompt(s.prompt)}
                      >
                        {isFirstActive && (
                          <div className="absolute inset-0 overflow-hidden rounded-md pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-bg-subtle/70 to-transparent animate-pulse" />
                            <div className="absolute bottom-1 right-2 text-[10px] font-medium text-fg-muted">Running…</div>
                          </div>
                        )}
                        {pendingQueue.length > 0 && idx === 0 && !isLoading && (
                          <div className="absolute top-1 right-2 text-[10px] px-1.5 py-0.5 rounded bg-accent-subtle text-accent">Queued: {pendingQueue.length}</div>
                        )}
                        <CardContent className="p-4 text-left space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-[11px] uppercase tracking-wide text-fg-muted font-medium">{s.complexity}</div>
                            <div className="flex items-center gap-1">
                              {requiresImage && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100/50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 flex items-center gap-1">
                                  <Attach20Regular className="h-3 w-3" />
                                  Image
                                </span>
                              )}
                              {s.complexity === 'Advanced' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-subtle text-accent">Multi-source</span>}
                            </div>
                          </div>
                          <div className="text-sm font-medium leading-snug">{s.label}</div>
                          <p className="text-xs text-fg-muted leading-snug">{s.prompt}</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} onOpenDocument={(url) => setDocViewerUrl(url)} agent={selectedAgent} />
            ))
          )}
          
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-accent-subtle">
                <Bot20Regular className="h-4 w-4 text-accent" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-stroke-divider p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Multi-image thumbnails */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {images.map(img => (
                  <div key={img.id} className="relative">
                    <img
                      src={img.dataUrl}
                      alt="attachment"
                      className={cn('h-20 w-20 object-cover rounded border border-stroke-divider', img.status==='processing' && 'opacity-60 animate-pulse')}
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(img.id)}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-bg-card border border-stroke-divider flex items-center justify-center text-fg-muted hover:text-fg-default"
                      aria-label="Remove image"
                    >
                      <Dismiss20Regular className="h-3 w-3" />
                    </button>
                    {img.status === 'processing' && (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-fg-muted bg-bg-card/40 backdrop-blur-sm rounded">…</div>
                    )}
                  </div>
                ))}
                {imageWarning && (
                  <div className="text-[10px] text-status-warning font-medium self-end pb-1">{imageWarning}</div>
                )}
              </div>
            )}
            
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="Ask me anything about your knowledge sources..."
                className="min-h-[60px] max-h-[200px] resize-none pr-32"
                disabled={isLoading}
              />
              <div className="absolute bottom-3 right-3 flex gap-1">
                <VoiceInput
                  onTranscript={handleVoiceInput}
                  disabled={isLoading}
                />
                <ImageInput
                  onImageSelect={handleImageSelect}
                  disabled={isLoading || images.length >= 10}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-8 w-8"
                  disabled={(!input.trim() && images.length === 0) || isLoading || images.some(i => i.status==='processing')}
                >
                  <Send20Regular className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-fg-muted">
              Press Enter to send, Shift+Enter for new line. Click mic for voice input or image icon to add images.
            </p>
          </form>
        </div>
      </div>

      {/* Right Drawer - Agent Settings */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="border-l border-stroke-divider bg-bg-card overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">Agent settings</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSettingsOpen(false)}
                >
                  <Dismiss20Regular className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Knowledge sources</h4>
                  <div className="space-y-2">
                    {selectedAgent.sources.map((source, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-bg-subtle rounded-md">
                        <div className="w-2 h-2 bg-status-success rounded-full" />
                        <span className="text-sm">{source}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-3">Model</h4>
                  <div className="p-3 bg-bg-subtle rounded-md">
                    <span className="text-sm">{selectedAgent.model || 'Default model'}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Mode & Instructions</h4>
                  <div className="p-3 bg-bg-subtle rounded-md space-y-3">
                    <div className="text-sm font-medium">
                      {selectedAgent.outputConfiguration?.modality === 'answerSynthesis' && 'Answer Synthesis'}
                      {selectedAgent.outputConfiguration?.modality === 'extractiveData' && 'Extractive Data'}
                      {!selectedAgent.outputConfiguration?.modality && '—'}
                    </div>
                    {selectedAgent.outputConfiguration?.answerInstructions && (
                      <div className="text-xs text-fg-muted whitespace-pre-wrap">
                        <div className="uppercase tracking-wide font-semibold mb-1 text-[10px] text-fg-muted">Answer Instructions</div>
                        {selectedAgent.outputConfiguration.answerInstructions}
                      </div>
                    )}
                    {selectedAgent.retrievalInstructions && (
                      <div className="text-xs text-fg-muted whitespace-pre-wrap">
                        <div className="uppercase tracking-wide font-semibold mb-1 text-[10px] text-fg-muted">Retrieval Instructions</div>
                        {selectedAgent.retrievalInstructions}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Runtime Settings Panel */}
      <RuntimeSettingsPanel
        isOpen={runtimeSettingsOpen}
        onClose={() => setRuntimeSettingsOpen(false)}
        settings={runtimeSettings}
        onSettingsChange={(settings) => setRuntimeSettings(settings as any)}
        knowledgeSources={selectedAgent?.sourcesWithKinds || []}
      />

      {/* View Code Modal */}
      <ViewCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        agentId={selectedAgent.id}
        agentName={selectedAgent.name}
        messages={messages}
      />
      <DocumentViewerModal
        url={docViewerUrl}
        onClose={() => setDocViewerUrl(null)}
      />
    </div>
  )
}

function MessageBubble({ message, onOpenDocument, agent }: { message: Message, onOpenDocument?: (url: string) => void, agent?: KnowledgeAgent }) {
  const [expanded, setExpanded] = useState(false)
  
  // Always show snippets if available (includeReferenceSourceData removed in November API)
  const shouldShowSnippets = true
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex items-start gap-4', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'p-2 rounded-full',
        isUser ? 'bg-bg-subtle' : 'bg-accent-subtle'
      )}>
        {isUser ? (
          <Person20Regular className="h-4 w-4" />
        ) : (
          <Bot20Regular className="h-4 w-4 text-accent" />
        )}
      </div>
      
      <div className={cn('flex-1 max-w-[80%]', isUser && 'flex justify-end')}>
        <div className={cn(
          'rounded-lg p-4',
          isUser 
            ? 'bg-accent text-fg-on-accent ml-12' 
            : 'bg-bg-card border border-stroke-divider'
        )}>
          <div className="prose prose-sm max-w-none space-y-3">
            {message.content.map((content, index) => {
              if (content.type === 'text') {
                return (
                  <p key={index} className="whitespace-pre-wrap">
                    <InlineCitationsText 
                      text={content.text}
                      references={message.references}
                      activity={message.activity}
                      messageId={message.id}
                      onActivate={() => setExpanded(true)}
                    />
                  </p>
                )
              } else if (content.type === 'image') {
                return (
                  <div key={index} className="max-w-xs">
                    <img 
                      src={content.image.url} 
                      alt="User uploaded content" 
                      className="rounded border border-stroke-divider max-w-full h-auto"
                    />
                  </div>
                )
              }
              return null
            })}
          </div>
          
          {((message.references && message.references.length > 0) || (message.activity && message.activity.length > 0)) && (
            <div className="mt-4 pt-4 border-t border-stroke-divider">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-sm font-medium text-fg-muted hover:text-fg-default"
              >
                <span>
                  {message.references && message.references.length > 0 
                    ? `${message.references.length} reference${message.references.length > 1 ? 's' : ''}`
                    : `${message.activity?.length || 0} search${(message.activity?.length || 0) > 1 ? 'es' : ''}`
                  }
                </span>
                {expanded ? (
                  <ChevronUp20Regular className="h-3 w-3" />
                ) : (
                  <ChevronDown20Regular className="h-3 w-3" />
                )}
              </button>
              
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 space-y-3 overflow-hidden w-full"
                  >
                    {/* References */}
                    {message.references && message.references.length > 0 && (
                      <div className="space-y-2 w-full">
                        <h6 className="text-xs font-medium text-fg-muted uppercase tracking-wide">References</h6>
                        {Array.from(new Map(message.references.map((r, idx) => [r.blobUrl || r.id, { r, idx }])).values()).map(({ r: ref, idx }) => {
                          const fileName = ref.blobUrl ? decodeURIComponent(ref.blobUrl.split('/').pop() || ref.id) : (ref.docKey || ref.id)
                          const activity = message.activity?.find(a => a.id === ref.activitySource)
                          const label = activity?.knowledgeSourceName || fileName
                          
                          return (
                            <div id={`ref-${message.id}-${idx}`} key={ref.id + (ref.blobUrl || '')} className="p-3 bg-bg-subtle rounded-md group border border-transparent hover:border-accent/40 transition w-full">
                              <div className="flex items-center justify-between mb-2">
                                <span className="flex items-center gap-1 text-xs font-medium text-accent">
                                  <SourceKindIcon kind={ref.type} size={14} variant="plain" />
                                  {label || ref.type}
                                </span>
                                <div className="flex items-center gap-2">
                                  {ref.rerankerScore && (
                                    <span className="text-xs text-fg-muted">{ref.rerankerScore.toFixed(2)}</span>
                                  )}
                                  {ref.blobUrl && onOpenDocument && (
                                    <button
                                      onClick={() => onOpenDocument(ref.blobUrl!)}
                                      className="text-[10px] px-2 py-0.5 rounded bg-accent-subtle text-accent hover:bg-accent/20 transition flex items-center gap-1"
                                      aria-label={`Open source document ${fileName}`}
                                      title={`Open ${fileName}`}
                                    >
                                      <span className="inline-block w-3 h-3">↗</span>
                                      Open
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-fg-muted break-all" title={fileName}>
                                <span className="font-medium inline-flex items-center gap-1 max-w-full">
                                  <span className="truncate max-w-[240px] inline-block align-bottom">{fileName}</span>
                                </span>
                              </p>
                              
                              {/* Show snippet if includeReferenceSourceData is enabled and snippet is available */}
                              {shouldShowSnippets && ref.sourceData?.snippet && (
                                <div className="mt-3 pt-3 border-t border-stroke-divider w-full">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="text-[10px] font-medium text-fg-muted uppercase tracking-wide">
                                      Source snippet
                                    </div>
                                    <div className="flex-1 h-px bg-stroke-divider"></div>
                                  </div>
                                  <div className="text-xs text-fg-default bg-bg-default/30 border border-stroke-divider rounded p-4 max-h-64 overflow-y-auto w-full">
                                    <div className="leading-relaxed text-fg-muted break-words">
                                      {cleanTextSnippet(ref.sourceData.snippet)}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Show hint if snippets are available but feature is not enabled */}
                              {!shouldShowSnippets && ref.sourceData?.snippet && (
                                <div className="mt-2 text-[10px] text-fg-muted/60 italic">
                                  💡 Enable "Include source data" in agent settings to show snippets
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                    
                    {/* Activity */}
                    {message.activity && message.activity.length > 0 && (
                      <div className="space-y-2">
                        <h6 className="text-xs font-medium text-fg-muted uppercase tracking-wide">Search Activity</h6>
                        {message.activity.filter(act => act.type === 'searchIndex' || act.type === 'azureBlob').map((activity) => (
                          <div key={activity.id} className="p-3 bg-bg-subtle rounded-md">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-accent">{activity.type}</span>
                              <div className="text-xs text-fg-muted space-x-2">
                                {activity.count !== undefined && <span>{activity.count} results</span>}
                                {activity.elapsedMs && <span>{activity.elapsedMs}ms</span>}
                              </div>
                            </div>
                            {activity.knowledgeSourceName && (
                              <p className="text-xs text-fg-muted mb-1">Source: {activity.knowledgeSourceName}</p>
                            )}
                            {activity.searchIndexArguments?.search && (
                              <p className="text-xs text-fg-muted">Query: "{activity.searchIndexArguments.search}"</p>
                            )}
                            {activity.azureBlobArguments?.search && (
                              <p className="text-xs text-fg-muted">Query: "{activity.azureBlobArguments.search}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          <div className="mt-3 flex items-center justify-between text-xs text-fg-muted">
            <span>{formatRelativeTime(message.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}