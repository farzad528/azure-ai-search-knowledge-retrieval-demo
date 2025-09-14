'use client'
import { useState } from 'react'

export default function CodeViewer({ agentId, lastQuery, onClose }) {
  const [activeTab, setActiveTab] = useState('curl')
  
  const ENDPOINT = '${AZURE_SEARCH_ENDPOINT}'
  const API_KEY = '${AZURE_SEARCH_API_KEY}'
  const API_VERSION = '${AZURE_SEARCH_API_VERSION}'

  const sampleMessage = lastQuery || "What are the key strategies for preventing heart disease?"

  const getCurlCode = () => {
    return `# Query Knowledge Agent - cURL
curl -X POST "\${AZURE_SEARCH_ENDPOINT}/agents/${agentId}/retrieve?api-version=\${AZURE_SEARCH_API_VERSION}" \\
  -H "api-key: \${AZURE_SEARCH_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "${sampleMessage}"
          }
        ]
      }
    ]
  }'

# Optional: Add runtime parameters
curl -X POST "\${AZURE_SEARCH_ENDPOINT}/agents/${agentId}/retrieve?api-version=\${AZURE_SEARCH_API_VERSION}" \\
  -H "api-key: \${AZURE_SEARCH_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "${sampleMessage}"
          }
        ]
      }
    ],
    "temperature": 0.7,
    "knowledgeSourceParams": [
      {
        "kind": "web",
        "knowledgeSourceName": "kr-ks-web",
        "freshness": "week"
      }
    ]
  }'`
  }

  const getPythonCode = () => {
    return `# Query Knowledge Agent - Python
import requests
import json
import os

# Configuration - Load from environment variables
ENDPOINT = os.getenv('AZURE_SEARCH_ENDPOINT')
API_KEY = os.getenv('AZURE_SEARCH_API_KEY')  
API_VERSION = os.getenv('AZURE_SEARCH_API_VERSION')

def query_knowledge_agent(agent_id, message, temperature=0.7):
    url = f"{ENDPOINT}/agents/{agent_id}/retrieve"
    
    headers = {
        "api-key": API_KEY,
        "Content-Type": "application/json"
    }
    
    params = {
        "api-version": API_VERSION
    }
    
    payload = {
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": message
                    }
                ]
            }
        ],
        "temperature": temperature,
        # Optional: Add knowledge source parameters
        "knowledgeSourceParams": [
            {
                "kind": "web",
                "knowledgeSourceName": "kr-ks-web",
                "freshness": "week"
            }
        ]
    }
    
    try:
        response = requests.post(url, headers=headers, params=params, json=payload)
        response.raise_for_status()
        
        result = response.json()
        
        # Parse response
        response_text = result.get("response", [{}])[0].get("content", [{}])[0].get("text", "")
        activity = result.get("activity", [])
        references = result.get("references", [])
        
        return {
            "response": response_text,
            "activity": activity,
            "references": references
        }
        
    except requests.exceptions.RequestException as e:
        print(f"Error querying agent: {e}")
        return None

# Example usage
if __name__ == "__main__":
    agent_id = "${agentId}"
    message = "${sampleMessage}"
    
    result = query_knowledge_agent(agent_id, message)
    
    if result:
        print("Response:", result["response"])
        print("Activity steps:", len(result["activity"]))
        print("References:", len(result["references"]))`
  }

  const getTypeScriptCode = () => {
    return `// Query Knowledge Agent - TypeScript
interface Message {
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

interface KnowledgeSourceParam {
  kind: string;
  knowledgeSourceName: string;
  freshness?: string;
}

interface QueryRequest {
  messages: Message[];
  temperature?: number;
  knowledgeSourceParams?: KnowledgeSourceParam[];
}

interface ActivityItem {
  type: string;
  knowledgeSourceName?: string;
  count?: number;
  elapsedMs?: number;
}

interface Reference {
  type: string;
  id: string;
  rerankerScore?: number;
  blobUrl?: string;
}

interface QueryResponse {
  response: Array<{
    content: Array<{
      type: string;
      text: string;
    }>;
  }>;
  activity: ActivityItem[];
  references: Reference[];
}

class KnowledgeAgent {
  private endpoint = process.env.AZURE_SEARCH_ENDPOINT!;
  private apiKey = process.env.AZURE_SEARCH_API_KEY!;
  private apiVersion = process.env.AZURE_SEARCH_API_VERSION!;

  async query(
    agentId: string, 
    message: string, 
    temperature: number = 0.7
  ): Promise<QueryResponse | null> {
    const url = \`\${this.endpoint}/agents/\${agentId}/retrieve\`;
    
    const payload: QueryRequest = {
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: message
            }
          ]
        }
      ],
      temperature,
      // Optional: Add knowledge source parameters
      knowledgeSourceParams: [
        {
          kind: 'web',
          knowledgeSourceName: 'kr-ks-web',
          freshness: 'week'
        }
      ]
    };

    try {
      const response = await fetch(\`\${url}?api-version=\${this.apiVersion}\`, {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      const result: QueryResponse = await response.json();
      return result;
      
    } catch (error) {
      console.error('Error querying agent:', error);
      return null;
    }
  }

  parseResponse(result: QueryResponse) {
    const responseText = result.response?.[0]?.content?.[0]?.text || '';
    const activity = result.activity || [];
    const references = result.references || [];
    
    // Try to parse citations if response is JSON
    let citations: any[] = [];
    try {
      const citationsData = JSON.parse(responseText);
      if (Array.isArray(citationsData)) {
        citations = citationsData;
      }
    } catch {
      // Response is plain text
    }
    
    return {
      text: responseText,
      citations,
      activity,
      references
    };
  }
}

// Example usage
async function example() {
  const agent = new KnowledgeAgent();
  const agentId = "${agentId}";
  const message = "${sampleMessage}";
  
  const result = await agent.query(agentId, message);
  
  if (result) {
    const parsed = agent.parseResponse(result);
    console.log('Response:', parsed.text);
    console.log('Citations:', parsed.citations.length);
    console.log('Activity steps:', parsed.activity.length);
    console.log('References:', parsed.references.length);
  }
}

example();`
  }

  const getCode = () => {
    switch (activeTab) {
      case 'curl': return getCurlCode()
      case 'python': return getPythonCode()
      case 'typescript': return getTypeScriptCode()
      default: return getCurlCode()
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getCode())
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h3 className="text-lg font-semibold">API Code Examples</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>
        
        <div className="flex border-b flex-shrink-0">
          {[
            { id: 'curl', label: 'cURL', icon: '🌐' },
            { id: 'python', label: 'Python', icon: '🐍' },
            { id: 'typescript', label: 'TypeScript', icon: '📘' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 relative min-h-0">
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={copyToClipboard}
              className="bg-gray-800 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors"
            >
              Copy
            </button>
          </div>
          
          <div className="h-full overflow-auto bg-gray-900">
            <pre className="p-4 text-gray-100 text-sm font-mono whitespace-pre-wrap">
              <code>{getCode()}</code>
            </pre>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <strong>Agent ID:</strong> {agentId}
              </div>
              <div>
                <strong>Environment Variables:</strong> AZURE_SEARCH_ENDPOINT, AZURE_SEARCH_API_KEY, AZURE_SEARCH_API_VERSION
              </div>
            </div>
            <p className="mt-2 text-xs">
              💡 <strong>Setup:</strong> Set your environment variables before running: <br/>
              <code className="bg-gray-200 px-1 rounded">AZURE_SEARCH_ENDPOINT</code>, 
              <code className="bg-gray-200 px-1 rounded">AZURE_SEARCH_API_KEY</code>, 
              <code className="bg-gray-200 px-1 rounded">AZURE_SEARCH_API_VERSION</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}