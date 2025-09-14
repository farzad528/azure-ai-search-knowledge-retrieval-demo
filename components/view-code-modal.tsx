'use client'

import * as React from 'react'
import { Dismiss20Regular, Copy20Regular, Checkmark20Regular, ChevronDown20Regular } from '@fluentui/react-icons'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

type MessageContent = 
  | { type: 'text'; text: string }
  | { type: 'image'; image: { url: string; file?: File } }

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: MessageContent[]
  timestamp: Date
  references?: any[]
  activity?: any[]
  reasoning?: string
}

interface ViewCodeModalProps {
  isOpen: boolean
  onClose: () => void
  agentId: string
  agentName: string
  messages: Message[]
}

export function ViewCodeModal({ isOpen, onClose, agentId, agentName, messages }: ViewCodeModalProps) {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = React.useState('curl')

  if (!isOpen) return null

  const copyCode = async (code: string, language: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(language)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Get actual environment variables (don't expose API key on client side)
  const endpoint = process.env.NEXT_PUBLIC_AZURE_SEARCH_ENDPOINT || '{AZURE_SEARCH_ENDPOINT}'
  const apiKey = '{AZURE_SEARCH_API_KEY}' // Replace with your actual API key

  // Convert current messages to Azure API format for code examples
  const formatMessagesForAPI = (messages: Message[]) => {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content.map(c => {
        if (c.type === 'text') {
          return { type: 'text', text: c.text }
        } else if (c.type === 'image') {
          return { type: 'image', image: { url: '[BASE64_IMAGE_DATA]' } }
        }
        return c
      })
    }))
  }

  // Get formatted messages or use fallback example
  const apiMessages = messages.length > 0 ? formatMessagesForAPI(messages) : [
    {
      role: 'user',
      content: [{ type: 'text', text: 'What is Azure AI Search?' }]
    },
    {
      role: 'assistant', 
      content: [{ type: 'text', text: 'Azure AI Search is a cloud search service with AI capabilities.' }]
    },
    {
      role: 'user',
      content: [{ type: 'text', text: 'How does it relate to Knowledge Retrieval?' }]
    }
  ]

  // Generate code examples
  const conversationTitle = messages.length > 0 ? `${messages.length} message${messages.length !== 1 ? 's' : ''} from current conversation` : 'example conversation'
  
  const curlCode = `# ${conversationTitle} with ${agentName} agent using Azure AI Search directly
curl -X POST "${endpoint}/agents/${agentId}/retrieve?api-version=2025-08-01-preview" \\
  -H "Content-Type: application/json" \\
  -H "api-key: ${apiKey}" \\
  -d '${JSON.stringify({ messages: apiMessages }, null, 2)}'`

  const pythonCode = `import requests
import json

# Configuration - replace with your actual values
ENDPOINT = "${endpoint}"
API_KEY = "${apiKey}"
AGENT_ID = "${agentId}"

def retrieve_from_agent(messages):
    """Retrieve from the ${agentName} agent using Azure AI Search directly with conversation history"""
    url = f"{endpoint}/agents/{agentId}/retrieve"
    
    payload = {
        "messages": messages
    }
    
    response = requests.post(
        url,
        headers={
            "Content-Type": "application/json",
            "api-key": API_KEY
        },
        params={"api-version": "2025-08-01-preview"},
        json=payload
    )
    
    response.raise_for_status()
    return response.json()

# ${conversationTitle} with ${agentName} agent
try:
    conversation = ${JSON.stringify(apiMessages, null, 4).replace(/^/gm, '    ')}
    
    result = retrieve_from_agent(conversation)
    
    # Parse response
    if result.get("response") and len(result["response"]) > 0:
        content = result["response"][0].get("content", [])
        if len(content) > 0:
            print("Response:", content[0].get("text", "No text found"))
    
    # Show references if available
    if result.get("references"):
        print(f"References: {len(result['references'])}")
        
    # Show activity if available  
    if result.get("activity"):
        print(f"Search activities: {len(result['activity'])}")
        
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
`

  const typescriptCode = `interface MessageContent {
  type: 'text'
  text: string
}

interface Message {
  role: 'user' | 'assistant'
  content: MessageContent[]
}

interface RetrieveRequest {
  messages: Message[]
}

interface Reference {
  type: string
  id: string
  activitySource: number
  rerankerScore?: number
  docKey?: string
}

interface Activity {
  type: string
  id: number
  knowledgeSourceName?: string
  count?: number
  elapsedMs?: number
  searchIndexArguments?: any
  azureBlobArguments?: any
}

interface RetrieveResponse {
  response: Array<{
    content: Array<{
      type: string
      text: string
    }>
  }>
  references?: Reference[]
  activity?: Activity[]
}

class ${agentName.replace(/[^a-zA-Z0-9]/g, '')}Agent {
  private readonly endpoint = '${endpoint}'
  private readonly apiKey = '${apiKey}'
  private readonly agentId = '${agentId}'

  async retrieve(messages: Message[]): Promise<RetrieveResponse> {
    const url = \`\${this.endpoint}/agents/\${this.agentId}/retrieve?api-version=2025-08-01-preview\`
    
    const payload: RetrieveRequest = {
      messages
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey
      },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`)
    }
    
    return response.json()
  }
}

// ${conversationTitle} with ${agentName} agent
const agent = new ${agentName.replace(/[^a-zA-Z0-9]/g, '')}Agent()

try {
  const conversation: Message[] = ${JSON.stringify(apiMessages, null, 2).replace(/^/gm, '  ')}

  const result = await agent.retrieve(conversation)
  
  // Parse response
  if (result.response && result.response.length > 0) {
    const content = result.response[0].content
    if (content && content.length > 0) {
      console.log('Response:', content[0].text)
    }
  }
  
  // Show references and activity
  console.log('References:', result.references?.length || 0)
  console.log('Search activities:', result.activity?.length || 0)
  
} catch (error) {
  console.error('Error:', error)
}`

  const dotnetCode = `using System.Text;
using System.Text.Json;

public class MessageContent
{
    public string Type { get; set; } = "";
    public string Text { get; set; } = "";
}

public class Message
{
    public string Role { get; set; } = "";
    public MessageContent[] Content { get; set; } = Array.Empty<MessageContent>();
}

public class RetrieveRequest
{
    public Message[] Messages { get; set; } = Array.Empty<Message>();
}

public class Reference
{
    public string Type { get; set; } = "";
    public string Id { get; set; } = "";
    public int ActivitySource { get; set; }
    public double? RerankerScore { get; set; }
    public string? DocKey { get; set; }
}

public class Activity
{
    public string Type { get; set; } = "";
    public int Id { get; set; }
    public string? KnowledgeSourceName { get; set; }
    public int? Count { get; set; }
    public int? ElapsedMs { get; set; }
    public JsonElement? SearchIndexArguments { get; set; }
    public JsonElement? AzureBlobArguments { get; set; }
}

public class RetrieveResponse
{
    public ResponseContent[] Response { get; set; } = Array.Empty<ResponseContent>();
    public Reference[]? References { get; set; }
    public Activity[]? Activity { get; set; }
}

public class ResponseContent
{
    public ContentItem[] Content { get; set; } = Array.Empty<ContentItem>();
}

public class ContentItem
{
    public string Type { get; set; } = "";
    public string Text { get; set; } = "";
}

public class ${agentName.replace(/[^a-zA-Z0-9]/g, "")}Agent
{
    private readonly HttpClient _httpClient;
    private readonly string _apiBase = "${window.location.origin}/api";
    private readonly string _agentId = "${agentId}";

    public ${agentName.replace(/[^a-zA-Z0-9]/g, "")}Agent(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<RetrieveResponse> RetrieveAsync(Message[] messages)
    {
        var url = $"{_apiBase}/agents/{_agentId}/retrieve";
        
        var request = new RetrieveRequest
        {
            Messages = messages
        };

        var json = JsonSerializer.Serialize(request, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var response = await _httpClient.PostAsync(url, content);
        response.EnsureSuccessStatusCode();
        
        var responseJson = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<RetrieveResponse>(responseJson, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        }) ?? new RetrieveResponse();
    }
}

// Example usage
var httpClient = new HttpClient();
var agent = new ${agentName.replace(/[^a-zA-Z0-9]/g, "")}Agent(httpClient);

try
{
    // ${conversationTitle} with ${agentName} agent
    var conversation = new[]
    {${apiMessages.map(msg => `
        new Message
        {
            Role = "${msg.role}",
            Content = new[] { ${msg.content.map(c => `new MessageContent { Type = "${c.type}", Text = ${JSON.stringify(c.type === 'text' ? c.text : '[BASE64_IMAGE_DATA]')} }`).join(', ')} }
        }`).join(',')}
    };

    var result = await agent.RetrieveAsync(conversation);
    
    // Parse response
    if (result.Response?.Length > 0 && result.Response[0].Content?.Length > 0)
    {
        Console.WriteLine($"Response: {result.Response[0].Content[0].Text}");
    }
    
    // Show references and activity
    Console.WriteLine($"References: {result.References?.Length ?? 0}");
    Console.WriteLine($"Search activities: {result.Activity?.Length ?? 0}");
}
catch (Exception ex)
{
    Console.WriteLine($"Error: {ex.Message}");
}`

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-canvas border border-stroke-divider rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stroke-divider">
          <div>
            <h2 className="text-lg font-semibold text-fg-default">View Code</h2>
            <p className="text-sm text-fg-muted">
              {messages.length > 0 
                ? `${conversationTitle} with ${agentName} agent`
                : `Code examples for ${agentName} agent`
              }
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Dismiss20Regular className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="curl">cURL</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="dotnet">.NET</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyCode(
                  selectedLanguage === 'curl' ? curlCode :
                  selectedLanguage === 'python' ? pythonCode :
                  selectedLanguage === 'typescript' ? typescriptCode :
                  dotnetCode, 
                  selectedLanguage
                )}
                className="h-8"
              >
                {copiedCode === selectedLanguage ? (
                  <Checkmark20Regular className="h-3 w-3" />
                ) : (
                  <Copy20Regular className="h-3 w-3" />
                )}
              </Button>
            </div>
            
            <pre className="bg-bg-subtle border border-stroke-divider rounded-md p-4 text-xs text-fg-default overflow-x-auto">
              <code>
                {selectedLanguage === 'curl' && curlCode}
                {selectedLanguage === 'python' && pythonCode}
                {selectedLanguage === 'typescript' && typescriptCode}
                {selectedLanguage === 'dotnet' && dotnetCode}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}