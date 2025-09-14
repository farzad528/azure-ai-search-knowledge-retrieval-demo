'use client'
import { useState, useEffect } from 'react'
import { retrieveFromAgent } from '@/lib/api'
import { getConversations, saveConversation } from '@/lib/storage'
import ConversationSidebar from './ConversationSidebar'
import MessageBubble from './MessageBubble'
import SettingsDialog from './SettingsDialog'
import CodeViewer from './CodeViewer'
import AgentInfoViewer from './AgentInfoViewer'
import JsonViewer from './JsonViewer'

export default function Playground({ agentId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showCodeViewer, setShowCodeViewer] = useState(false)
  const [showAgentInfo, setShowAgentInfo] = useState(false)
  const [showJsonViewer, setShowJsonViewer] = useState(false)
  const [queryParams, setQueryParams] = useState({})
  const [lastQuery, setLastQuery] = useState('')
  const [agentData, setAgentData] = useState(null)
  const [lastRequestData, setLastRequestData] = useState(null)
  const [lastResponseData, setLastResponseData] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null)

  useEffect(() => {
    setConversations(getConversations())
    
    // Load agent data
    async function loadAgentData() {
      try {
        const response = await fetch(`/api/agents/${agentId}`)
        if (response.ok) {
          const data = await response.json()
          setAgentData(data)
        }
      } catch (error) {
        console.error('Failed to load agent data:', error)
      }
    }
    
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          console.log('Transcribed text:', transcript)
          setInput(prev => prev + transcript)
          setIsRecording(false)
        }
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsRecording(false)
        }
        
        recognition.onend = () => {
          setIsRecording(false)
        }
        
        setRecognition(recognition)
      }
    }
    
    loadAgentData()
  }, [agentId])

  const executeQuery = async (promptText, contentType = 'text', imageUrl = null) => {
    let content = []
    
    if (contentType === 'image' && imageUrl) {
      content = [
        { type: 'image', image: { url: imageUrl } },
        { type: 'text', text: promptText }
      ]
    } else {
      content = [{ type: 'text', text: promptText }]
    }
    
    const userMessage = { role: 'user', content }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setLoading(true)
    setLastQuery(promptText)

    try {
      // Clean messages for API call - remove extra fields from assistant messages
      const cleanMessages = newMessages.map(msg => {
        if (msg.role === 'assistant') {
          return {
            role: msg.role,
            content: msg.content
          }
        }
        return msg
      })
      
      // Capture request data for JSON viewer
      const requestPayload = { messages: cleanMessages, ...queryParams }
      setLastRequestData(requestPayload)
      
      const response = await retrieveFromAgent(agentId, cleanMessages, queryParams)
      
      // Capture response data for JSON viewer
      setLastResponseData(response)
      
      // Parse the actual response format
      const responseText = response.response?.[0]?.content?.[0]?.text || 'No response'
      let citations = []
      
      // Try to parse citations from the response text if it's JSON formatted
      try {
        const citationsData = JSON.parse(responseText)
        if (Array.isArray(citationsData)) {
          citations = citationsData
        }
      } catch {
        // If not JSON, treat as plain text
      }
      
      const assistantMessage = {
        role: 'assistant',
        content: [{ type: 'text', text: responseText }],
        citations: citations,
        activity: response.activity,
        references: response.references
      }
      
      const updatedMessages = [...newMessages, assistantMessage]
      setMessages(updatedMessages)

      // Save conversation
      const conversationId = currentConversationId || Date.now().toString()
      const conversation = {
        id: conversationId,
        title: promptText.slice(0, 50) + (promptText.length > 50 ? '...' : ''),
        agentName: agentId,
        messages: updatedMessages,
        updatedAt: new Date().toISOString()
      }
      saveConversation(conversation)
      setConversations(getConversations())
      setCurrentConversationId(conversationId)
    } catch (error) {
      console.error('Query failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if ((!input.trim() && !selectedImage) || loading) return

    // Clear input and image immediately when sending
    const currentInput = input
    const currentImage = imagePreviewUrl
    const hasImage = !!selectedImage
    
    setInput('')
    removeSelectedImage()

    if (hasImage) {
      // Send with image
      await executeQuery(currentInput || 'Please analyze this image', 'image', currentImage)
    } else {
      // Send text only
      await executeQuery(currentInput)
    }
  }

  const handleSuggestedPrompt = async (prompt) => {
    if (loading) return
    await executeQuery(prompt)
  }

  const handleSuggestedImagePrompt = async (imageUrl, prompt) => {
    if (loading) return
    await executeQuery(prompt, 'image', imageUrl)
  }

  const handleMicrophoneClick = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser')
      return
    }

    if (isRecording) {
      recognition.stop()
      setIsRecording(false)
    } else {
      try {
        recognition.start()
        setIsRecording(true)
      } catch (error) {
        console.error('Failed to start speech recognition:', error)
        setIsRecording(false)
      }
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviewUrl(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeSelectedImage = () => {
    setSelectedImage(null)
    setImagePreviewUrl(null)
  }

  const handlePaste = async (event) => {
    const items = event.clipboardData?.items
    if (!items) return

    // Look for images in clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      if (item.type.startsWith('image/')) {
        event.preventDefault() // Prevent default paste behavior for images
        
        const file = item.getAsFile()
        if (file) {
          console.log('Image pasted from clipboard:', file.type, file.size)
          setSelectedImage(file)
          
          // Create preview URL
          const reader = new FileReader()
          reader.onload = (e) => {
            setImagePreviewUrl(e.target.result)
          }
          reader.readAsDataURL(file)
        }
        break // Only handle the first image found
      }
    }
    
    // Text paste will be handled normally by the input field
  }

  const loadConversation = (conversation) => {
    setMessages(conversation.messages)
    setCurrentConversationId(conversation.id)
  }

  const newConversation = () => {
    setMessages([])
    setCurrentConversationId(null)
  }

  return (
    <div className="flex h-screen">
      <ConversationSidebar 
        conversations={conversations.filter(c => c.agentName === agentId)}
        onSelectConversation={loadConversation}
        onNewConversation={newConversation}
        agentName={agentId}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Chat with {agentId}</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAgentInfo(true)}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              ℹ️ Agent Info
            </button>
            <button 
              onClick={() => setShowCodeViewer(true)}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              {'</>'} View Code
            </button>
            <button 
              onClick={() => setShowJsonViewer(true)}
              disabled={!lastRequestData && !lastResponseData}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📋 JSON View
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              ⚙️
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="space-y-6">
              <div className="text-center text-gray-600 mb-6">
                <h3 className="text-lg font-medium mb-2">Get started with these example prompts</h3>
                <p className="text-sm">Click any card to automatically query the agent</p>
              </div>
              
              <div className="grid grid-cols-3 gap-6 max-w-6xl mx-auto">
                <div 
                  onClick={() => handleSuggestedPrompt("What are the key strategies for preventing heart disease?")}
                  className="prompt-card bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 cursor-pointer transition-all duration-200 min-h-[120px] flex flex-col justify-center"
                >
                  <h4 className="font-semibold text-blue-900 mb-2 text-center">💓 Heart Disease Prevention</h4>
                  <p className="text-blue-700 text-sm text-center">What are the key strategies for preventing heart disease?</p>
                </div>
                
                <div 
                  onClick={() => handleSuggestedPrompt("What lifestyle changes can reduce cardiovascular risk factors?")}
                  className="prompt-card bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 cursor-pointer transition-all duration-200 min-h-[120px] flex flex-col justify-center"
                >
                  <h4 className="font-semibold text-green-900 mb-2 text-center">🏃 Lifestyle Modifications</h4>
                  <p className="text-green-700 text-sm text-center">What lifestyle changes can reduce cardiovascular risk factors?</p>
                </div>
                
                <div 
                  onClick={() => handleSuggestedImagePrompt("https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", "Analyze this medical chart and explain the key findings")}
                  className="prompt-card bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6 cursor-pointer transition-all duration-200 min-h-[120px] flex flex-col justify-center"
                >
                  <h4 className="font-semibold text-orange-900 mb-2 text-center">📊 Image Analysis</h4>
                  <p className="text-orange-700 text-sm text-center">Analyze this medical chart and explain the key findings</p>
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message, i) => (
            <MessageBubble key={i} message={message} />
          ))}
          
          {loading && (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="spinner"></div>
              <span>thinking...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t p-4">
          {/* Image Preview */}
          {imagePreviewUrl && (
            <div className="mb-4 relative inline-block">
              <img 
                src={imagePreviewUrl} 
                alt="Upload preview" 
                className="max-h-32 rounded-lg border"
              />
              <button
                type="button"
                onClick={removeSelectedImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
          
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPaste={handlePaste}
                placeholder={selectedImage ? "Add a message about the image..." : "Ask a question..."}
                className="w-full p-3 pr-24 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="p-2 rounded-full transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-50"
                  title="Upload image"
                >
                  📎
                </label>
                <button
                  type="button"
                  onClick={handleMicrophoneClick}
                  disabled={loading}
                  className={`p-2 rounded-full transition-colors ${
                    isRecording 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  } disabled:opacity-50`}
                  title={isRecording ? 'Stop recording' : 'Start voice input'}
                >
                  🎤
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || (!input.trim() && !selectedImage)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {showSettings && (
        <SettingsDialog 
          params={queryParams}
          onChange={setQueryParams}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showCodeViewer && (
        <CodeViewer 
          agentId={agentId}
          lastQuery={lastQuery}
          onClose={() => setShowCodeViewer(false)}
        />
      )}

      {showAgentInfo && (
        <AgentInfoViewer
          agent={agentData}
          onClose={() => setShowAgentInfo(false)}
        />
      )}

      {showJsonViewer && (
        <JsonViewer
          requestData={lastRequestData}
          responseData={lastResponseData}
          onClose={() => setShowJsonViewer(false)}
        />
      )}
    </div>
  )
}