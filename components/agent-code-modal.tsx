'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy20Regular, Dismiss20Regular } from '@fluentui/react-icons'
import { cn } from '@/lib/utils'

interface AgentCodeModalProps {
  isOpen: boolean
  onClose: () => void
  agentName: string
  selectedKnowledgeBases: string[]
  agentInstructions: string
  selectedModel: string
  assistantId?: string
  threadId?: string
}

export function AgentCodeModal({
  isOpen,
  onClose,
  agentName,
  selectedKnowledgeBases,
  agentInstructions,
  selectedModel,
  assistantId,
  threadId
}: AgentCodeModalProps) {
  const [activeTab, setActiveTab] = useState<'curl' | 'python'>('curl')
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const foundryEndpoint = process.env.NEXT_PUBLIC_FOUNDRY_PROJECT_ENDPOINT || 'https://your-resource.services.ai.azure.com/api/projects/your-project'
  const searchEndpoint = process.env.NEXT_PUBLIC_SEARCH_ENDPOINT || 'https://your-search-resource.search.windows.net'

  const generateMcpTools = () => {
    return selectedKnowledgeBases.map(baseName => ({
      type: 'mcp',
      server_label: baseName.replace(/-/g, '_'),
      server_url: `${searchEndpoint}/knowledgebases/${baseName}/mcp?api-version=2025-11-01-preview`,
      allowed_tools: ['knowledge_base_retrieve']
    }))
  }

  const curlCreateAgent = `# Create Foundry Agent with MCP Tools
curl -X POST "${foundryEndpoint}/assistants?api-version=2025-05-01" \\
  -H "Authorization: Bearer $FOUNDRY_BEARER_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "${agentName}",
    "instructions": "${agentInstructions.replace(/"/g, '\\"')}",
    "model": "${selectedModel}",
    "tools": ${JSON.stringify(generateMcpTools(), null, 6).replace(/^/gm, '    ')}
  }'`

  const curlCreateThread = `# Create Thread
curl -X POST "${foundryEndpoint}/threads?api-version=2025-05-01" \\
  -H "Authorization: Bearer $FOUNDRY_BEARER_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{}'`

  const curlSendMessage = `# Send Message to Thread
curl -X POST "${foundryEndpoint}/threads/${threadId || '{thread_id}'}/messages?api-version=2025-05-01" \\
  -H "Authorization: Bearer $FOUNDRY_BEARER_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "role": "user",
    "content": "What are the drug interactions between metformin and common antibiotics?"
  }'`

  const curlCreateRun = `# Create Run with MCP Tools
curl -X POST "${foundryEndpoint}/threads/${threadId || '{thread_id}'}/runs?api-version=2025-05-01" \\
  -H "Authorization: Bearer $FOUNDRY_BEARER_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "assistant_id": "${assistantId || '{assistant_id}'}",
    "tool_resources": {
      "mcp": [${selectedKnowledgeBases.map(baseName => `
        {
          "server_label": "${baseName.replace(/-/g, '_')}",
          "require_approval": "never",
          "headers": {
            "api-key": "$AZURE_SEARCH_API_KEY"
          }
        }`).join(',')}
      ]
    }
  }'`

  const pythonCode = `# Azure AI Agents Python SDK Example
# pip install azure-ai-agents

import os
from azure.ai.agents import AgentsClient
from azure.core.credentials import AzureKeyCredential

# Initialize the client
client = AgentsClient(
    endpoint="${foundryEndpoint}",
    credential=AzureKeyCredential(os.getenv("FOUNDRY_BEARER_TOKEN"))
)

# Create agent with MCP tools
mcp_tools = [${selectedKnowledgeBases.map(baseName => `
    {
        "type": "mcp",
        "server_label": "${baseName.replace(/-/g, '_')}",
  "server_url": "${searchEndpoint}/knowledgebases/${baseName}/mcp?api-version=2025-11-01-preview",
  "allowed_tools": ["knowledge_base_retrieve"]
    }`).join(',')}
]

agent = client.create_agent(
    name="${agentName}",
    instructions="${agentInstructions.replace(/"/g, '\\"')}",
    model="${selectedModel}",
    tools=mcp_tools
)

print(f"Created agent: {agent.id}")

# Create thread
thread = client.create_thread()
print(f"Created thread: {thread.id}")

# Send message
message = client.create_message(
    thread_id=thread.id,
    role="user",
    content="What are the drug interactions between metformin and common antibiotics?"
)

# Create run with MCP tool resources
mcp_resources = [${selectedKnowledgeBases.map(baseName => `
    {
        "server_label": "${baseName.replace(/-/g, '_')}",
        "require_approval": "never",
        "headers": {
            "api-key": os.getenv("AZURE_SEARCH_API_KEY")
        }
    }`).join(',')}
]

run = client.create_run(
    thread_id=thread.id,
    assistant_id=agent.id,
    tool_resources={"mcp": mcp_resources}
)

# Wait for completion
import time
while run.status in ["queued", "in_progress"]:
    time.sleep(1)
    run = client.get_run(thread_id=thread.id, run_id=run.id)
    print(f"Run status: {run.status}")

# Get response
if run.status == "completed":
    messages = client.list_messages(thread_id=thread.id)
    for message in messages.data:
        if message.role == "assistant":
            print(f"Assistant: {message.content[0].text.value}")
            break
else:
    print(f"Run failed: {run.last_error}")
`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[1400px] h-[92vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Integration Code - {agentName}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <Dismiss20Regular className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-stroke-divider flex-shrink-0">
          <button
            onClick={() => setActiveTab('curl')}
            className={cn(
              "px-6 py-3 text-sm font-medium border-b-2 transition-colors relative",
              activeTab === 'curl'
                ? "border-stroke-accent text-fg-accent bg-bg-accent-subtle"
                : "border-transparent text-fg-muted hover:text-fg-default hover:bg-bg-hover"
            )}
          >
            cURL Commands
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={cn(
              "px-6 py-3 text-sm font-medium border-b-2 transition-colors relative",
              activeTab === 'python'
                ? "border-stroke-accent text-fg-accent bg-bg-accent-subtle"
                : "border-transparent text-fg-muted hover:text-fg-default hover:bg-bg-hover"
            )}
          >
            Python SDK
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-6 py-4">
            {activeTab === 'curl' && (
              <div className="space-y-8">
                <div className="bg-bg-info-subtle border border-stroke-info rounded-lg p-4">
                  <p className="text-sm text-fg-info">
                    <strong>Prerequisites:</strong> Set environment variables <code>FOUNDRY_BEARER_TOKEN</code> and <code>AZURE_SEARCH_API_KEY</code>
                  </p>
                </div>

                <CodeSection
                  title="1. Create Agent with MCP Tools"
                  description="Creates a new Foundry assistant with your selected knowledge bases as MCP tools"
                  code={curlCreateAgent}
                  onCopy={() => copyToClipboard(curlCreateAgent, 'create-agent')}
                  copied={copiedSection === 'create-agent'}
                />

                <CodeSection
                  title="2. Create Conversation Thread"
                  description="Initializes a new conversation thread for the agent"
                  code={curlCreateThread}
                  onCopy={() => copyToClipboard(curlCreateThread, 'create-thread')}
                  copied={copiedSection === 'create-thread'}
                />

                <CodeSection
                  title="3. Send Message to Thread"
                  description="Adds a user message to start the conversation"
                  code={curlSendMessage}
                  onCopy={() => copyToClipboard(curlSendMessage, 'send-message')}
                  copied={copiedSection === 'send-message'}
                />

                <CodeSection
                  title="4. Execute Run with Knowledge Tools"
                  description="Triggers agent processing with MCP tool access for knowledge retrieval"
                  code={curlCreateRun}
                  onCopy={() => copyToClipboard(curlCreateRun, 'create-run')}
                  copied={copiedSection === 'create-run'}
                />
              </div>
            )}

            {activeTab === 'python' && (
              <div className="space-y-6">
                <div className="bg-bg-info-subtle border border-stroke-info rounded-lg p-4">
                  <p className="text-sm text-fg-info">
                    <strong>Installation:</strong> <code>pip install azure-ai-agents</code>
                  </p>
                </div>

                <CodeSection
                  title="Complete Integration Example"
                  description="End-to-end Python implementation using the Azure AI Agents SDK"
                  code={pythonCode}
                  onCopy={() => copyToClipboard(pythonCode, 'python-complete')}
                  copied={copiedSection === 'python-complete'}
                  language="python"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-stroke-divider px-6 py-4 bg-bg-secondary">
          <div className="flex items-center justify-between">
            <p className="text-xs text-fg-muted">
              Ready to integrate? Copy the examples above and customize for your use case.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface CodeSectionProps {
  title: string
  description?: string
  code: string
  onCopy: () => void
  copied: boolean
  language?: string
}

function CodeSection({ title, description, code, onCopy, copied, language = 'bash' }: CodeSectionProps) {
  return (
    <div className="border border-stroke-divider rounded-lg overflow-hidden">
      <div className="bg-bg-tertiary px-4 py-3 border-b border-stroke-divider">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-fg-primary">{title}</h3>
            {description && (
              <p className="text-xs text-fg-muted mt-1">{description}</p>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCopy}
            className={cn(
              "gap-2 transition-colors",
              copied
                ? "text-fg-success hover:text-fg-success"
                : "text-fg-muted hover:text-fg-default"
            )}
          >
            <Copy20Regular className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>

      <div className="relative">
        <pre className="bg-bg-secondary p-4 overflow-x-auto text-sm max-h-64 scrollbar-thin">
          <code className={`language-${language} text-fg-primary`}>{code}</code>
        </pre>

        {/* Language badge */}
        <div className="absolute top-2 right-2">
          <span className="text-xs px-2 py-1 bg-bg-tertiary border border-stroke-divider rounded text-fg-muted font-mono">
            {language}
          </span>
        </div>
      </div>
    </div>
  )
}