'use client'

import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Send20Regular, Attach20Regular, Settings20Regular, Bot20Regular, Person20Regular, ChevronDown20Regular, ChevronUp20Regular, Options20Regular, Code20Regular, Dismiss20Regular } from '@fluentui/react-icons'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VoiceInput } from '@/components/ui/voice-input'
import { ImageInput } from '@/components/ui/image-input'
import { RuntimeSettingsPanel } from '@/components/runtime-settings-panel'
import { ViewCodeModal } from '@/components/view-code-modal'
import { fetchAgents, retrieveFromAgent } from '../lib/api'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'

type KnowledgeAgent = {
  id: string
  name: string
  model?: string
  sources: string[]
  status?: string
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
  
  console.log('=== PLAYGROUND DEBUG ===')
  console.log('URL searchParams:', Object.fromEntries(searchParams.entries()))
  console.log('agentId from URL:', agentId)
  
  // Add guard for empty/null agentId
  if (agentId === '') {
    console.warn('AgentId is empty string, treating as null')
  }
  
  const [agents, setAgents] = useState<KnowledgeAgent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<KnowledgeAgent | null>(null)
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
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [runtimeSettingsOpen, setRuntimeSettingsOpen] = useState(false)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [runtimeSettings, setRuntimeSettings] = useState({
    knowledgeSourceParams: []
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load agents and chat history
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const data = await fetchAgents()
        const rawAgents = data.value || []
        
        // Map agents with proper structure from actual Azure API
        const agentsList = rawAgents.map(agent => ({
          id: agent.name,
          name: agent.name,
          model: agent.models?.[0]?.azureOpenAIParameters?.modelName,
          sources: (agent.knowledgeSources || []).map(ks => ks.name),
          status: 'active',
          description: agent.description,
          outputConfiguration: agent.outputConfiguration
        }))
        
        setAgents(agentsList)
        
        console.log('Looking for agentId:', agentId)
        console.log('Available agents:', agentsList.map(a => ({ id: a.id, name: a.name })))
        
        if (agentId) {
          console.log('Searching for agent with ID:', agentId)
          const agent = agentsList.find(a => a.id === agentId || a.name === agentId)
          console.log('Found agent:', agent)
          if (agent) {
            setSelectedAgent(agent)
            console.log('Selected agent set:', agent.name)
          } else {
            console.error('Agent not found with ID:', agentId)
          }
        } else {
          console.log('No agentId provided, selecting first agent if available')
          if (agentsList.length > 0) {
            setSelectedAgent(agentsList[0])
            console.log('Selected first agent:', agentsList[0].name)
          }
        }
      } catch (err) {
        console.error('Failed to load agents:', err)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && !selectedImage) || !selectedAgent || isLoading) return

    // Build message content array
    const messageContent: MessageContent[] = []
    
    if (input.trim()) {
      messageContent.push({ type: 'text', text: input.trim() })
    }
    
    if (selectedImage && selectedImageFile) {
      messageContent.push({ 
        type: 'image', 
        image: { url: selectedImage, file: selectedImageFile } 
      })
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setSelectedImage('')
    setSelectedImageFile(null)
    setIsLoading(true)

    try {
      // Convert images to base64 if present
      const processedMessageContent = await Promise.all(
        messageContent.map(async (c) => {
          if (c.type === 'text') {
            return { type: 'text', text: c.text }
          } else if (c.image.file) {
            // Convert file to base64
            const base64 = await convertBlobToBase64(c.image.file)
            return { type: 'image', image: { url: base64 } }
          } else {
            return { type: 'image', image: { url: c.image.url } }
          }
        })
      )

      // Convert messages to Azure AI Search retrieve format (clean format for API)
      const azureMessages = [
        ...await Promise.all(messages.map(async (m) => ({
          role: m.role,
          content: await Promise.all(m.content.map(async (c) => {
            if (c.type === 'text') {
              return { type: 'text', text: c.text }
            } else if (c.type === 'image') {
              return { type: 'image', image: { url: c.image.url } }
            }
            return c // fallback for any other content types
          }))
        }))),
        {
          role: 'user',
          content: processedMessageContent
        }
      ]

      // Build request body in Azure format
      const requestBody = {
        messages: azureMessages
      }

      // Add runtime settings if provided
      if (runtimeSettings.knowledgeSourceParams && runtimeSettings.knowledgeSourceParams.length > 0) {
        (requestBody as any).knowledgeSourceParams = runtimeSettings.knowledgeSourceParams
      }

      console.log('Sending retrieve request:', JSON.stringify(requestBody, null, 2))

      const response = await retrieveFromAgent(selectedAgent.id, azureMessages, runtimeSettings)

      console.log('Received response:', response)

      // Parse the actual Azure response structure
      let assistantText = 'I apologize, but I was unable to generate a response.'
      
      if (response.response && response.response.length > 0) {
        const responseContent = response.response[0].content
        if (responseContent && responseContent.length > 0) {
          assistantText = responseContent[0].text || assistantText
        }
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
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: [{ type: 'text', text: 'I apologize, but I encountered an error while processing your request. Please try again.' }],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleVoiceInput = (transcript: string) => {
    setInput(prev => prev + (prev ? ' ' : '') + transcript)
    textareaRef.current?.focus()
  }

  const handleImageSelect = (imageUrl: string, file: File) => {
    setSelectedImage(imageUrl)
    setSelectedImageFile(file)
  }

  const handleImageRemove = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage)
    }
    setSelectedImage('')
    setSelectedImageFile(null)
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
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">No agent selected</h2>
          <p className="text-fg-muted">Please select or create a knowledge agent to start chatting.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex">
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
              <div className="p-2 rounded-md bg-accent-subtle">
                <Bot20Regular className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h1 className="font-semibold text-xl">{selectedAgent.name}</h1>
                <p className="text-sm text-fg-muted">
                  {selectedAgent.model || 'Default model'} • {selectedAgent.sources.length} knowledge sources
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
              <div className="p-4 rounded-full bg-accent-subtle inline-block mb-6">
                <Bot20Regular className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
              <p className="text-fg-muted max-w-md mx-auto mb-8">
                Ask me anything about your knowledge sources. I can search, analyze, and provide insights based on your data.
              </p>
              
              {/* Conversation Starters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <Card 
                  className="cursor-pointer hover:elevation-sm hover:scale-105 transition-all duration-fast bg-bg-card border border-stroke-divider active:scale-95"
                  onClick={() => {
                    setInput("What are the key insights from the latest reports?")
                    setTimeout(() => textareaRef.current?.focus(), 100)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="text-sm font-medium mb-2">📊 Analyze Reports</div>
                    <p className="text-xs text-fg-muted text-left">What are the key insights from the latest reports?</p>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:elevation-sm hover:scale-105 transition-all duration-fast bg-bg-card border border-stroke-divider active:scale-95"
                  onClick={() => {
                    setInput("Compare performance metrics across different time periods")
                    setTimeout(() => textareaRef.current?.focus(), 100)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="text-sm font-medium mb-2">📈 Compare Metrics</div>
                    <p className="text-xs text-fg-muted text-left">Compare performance metrics across different time periods</p>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:elevation-sm hover:scale-105 transition-all duration-fast bg-bg-card border border-stroke-divider active:scale-95"
                  onClick={() => {
                    setInput("What do you see in this image?");
                    // Create a sample image blob for demonstration
                    const canvas = document.createElement('canvas');
                    canvas.width = 200;
                    canvas.height = 150;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.fillStyle = '#f0f0f0';
                      ctx.fillRect(0, 0, 200, 150);
                      ctx.fillStyle = '#666';
                      ctx.font = '14px Arial';
                      ctx.textAlign = 'center';
                      ctx.fillText('Sample Chart', 100, 75);
                      ctx.fillText('📊', 100, 95);
                    }
                    canvas.toBlob((blob) => {
                      if (blob) {
                        const file = new File([blob], 'sample-chart.png', { type: 'image/png' });
                        const url = URL.createObjectURL(blob);
                        handleImageSelect(url, file);
                        textareaRef.current?.focus();
                      }
                    });
                  }}
                >
                  <CardContent className="p-4">
                    <div className="text-sm font-medium mb-2">🖼️ Analyze Image</div>
                    <p className="text-xs text-fg-muted text-left">What do you see in this image?</p>
                    <div className="mt-2 p-2 bg-bg-subtle rounded text-xs text-fg-muted">
                      Includes sample image
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
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
            {/* Image preview if selected */}
            {selectedImage && (
              <div className="flex justify-start">
                <ImageInput
                  onImageSelect={handleImageSelect}
                  onImageRemove={handleImageRemove}
                  selectedImage={selectedImage}
                  disabled={isLoading}
                />
              </div>
            )}
            
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
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
                  onImageRemove={handleImageRemove}
                  selectedImage={selectedImage}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-8 w-8"
                  disabled={(!input.trim() && !selectedImage) || isLoading}
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
        knowledgeSources={selectedAgent?.sources?.map(name => ({ name, kind: 'searchIndex' })) || []}
      />

      {/* View Code Modal */}
      <ViewCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        agentId={selectedAgent.id}
        agentName={selectedAgent.name}
        messages={messages}
      />
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const [expanded, setExpanded] = useState(false)
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
                    {content.text}
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
                    className="mt-3 space-y-3 overflow-hidden"
                  >
                    {/* References */}
                    {message.references && message.references.length > 0 && (
                      <div className="space-y-2">
                        <h6 className="text-xs font-medium text-fg-muted uppercase tracking-wide">References</h6>
                        {message.references.map((ref) => (
                          <div key={ref.id} className="p-3 bg-bg-subtle rounded-md">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-accent">{ref.type}</span>
                              {ref.rerankerScore && (
                                <span className="text-xs text-fg-muted">Score: {ref.rerankerScore.toFixed(2)}</span>
                              )}
                            </div>
                            <p className="text-xs text-fg-muted">Document: {ref.docKey || ref.id}</p>
                          </div>
                        ))}
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