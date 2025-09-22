'use client'

import * as React from 'react'
import { Dismiss20Regular, Copy20Regular, Checkmark20Regular } from '@fluentui/react-icons'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

  // Code snippets based on Microsoft documentation
  const curlCode = `# Retrieve from knowledge agent using REST API
curl -X POST "https://{search-service}.search.windows.net/agents/${agentId}/retrieve?api-version=2025-08-01-preview" \\
  -H "Content-Type: application/json" \\
  -H "api-key: {search-admin-api-key}" \\
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "What information is available about Azure AI Search?"
      }
    ]
  }'

# Response includes:
# - Generated answer from the agent
# - References to source documents
# - Activity details showing search operations`

  const pythonCode = `# pip install azure-search-documents==11.7.0b1

from azure.search.documents.agentic import SearchAgentClient
from azure.core.credentials import AzureKeyCredential

# Create client
endpoint = "https://{search-service}.search.windows.net"
api_key = "{search-admin-api-key}"
agent_id = "${agentId}"

client = SearchAgentClient(endpoint, AzureKeyCredential(api_key))

# Retrieve from agent
messages = [
    {
        "role": "user",
        "content": "What information is available about Azure AI Search?"
    }
]

response = client.agents.retrieve(
    agent_name=agent_id,
    body={
        "messages": messages
    }
)

# Access response
if response.response:
    print(f"Answer: {response.response[0].content[0].text}")

# Access references
if response.references:
    print(f"Found {len(response.references)} references")

# Access activity
if response.activity:
    print(f"Performed {len(response.activity)} search operations")`

  const typescriptCode = `// npm install @azure/search-documents@12.0.0-beta.9

import { SearchAgentClient, AzureKeyCredential } from "@azure/search-documents";

// Create client
const endpoint = "https://{search-service}.search.windows.net";
const apiKey = "{search-admin-api-key}";
const agentId = "${agentId}";

const client = new SearchAgentClient(endpoint, new AzureKeyCredential(apiKey));

// Retrieve from agent
async function retrieveFromAgent() {
  const messages = [
    {
      role: "user" as const,
      content: "What information is available about Azure AI Search?"
    }
  ];

  const response = await client.agents.retrieve(agentId, {
    messages
  });

  // Access response
  if (response.response && response.response.length > 0) {
    const answer = response.response[0].content[0].text;
    console.log(\`Answer: \${answer}\`);
  }

  // Access references
  if (response.references) {
    console.log(\`Found \${response.references.length} references\`);
  }

  // Access activity
  if (response.activity) {
    console.log(\`Performed \${response.activity.length} search operations\`);
  }
}

retrieveFromAgent().catch(console.error);`

  const javascriptCode = `// npm install @azure/search-documents@12.0.0-beta.9

const { SearchAgentClient, AzureKeyCredential } = require("@azure/search-documents");

// Create client
const endpoint = "https://{search-service}.search.windows.net";
const apiKey = "{search-admin-api-key}";
const agentId = "${agentId}";

const client = new SearchAgentClient(endpoint, new AzureKeyCredential(apiKey));

// Retrieve from agent
async function retrieveFromAgent() {
  const messages = [
    {
      role: "user",
      content: "What information is available about Azure AI Search?"
    }
  ];

  const response = await client.agents.retrieve(agentId, {
    messages
  });

  // Access response
  if (response.response && response.response.length > 0) {
    const answer = response.response[0].content[0].text;
    console.log(\`Answer: \${answer}\`);
  }

  // Access references
  if (response.references) {
    console.log(\`Found \${response.references.length} references\`);
  }

  // Access activity
  if (response.activity) {
    console.log(\`Performed \${response.activity.length} search operations\`);
  }
}

retrieveFromAgent().catch(console.error);`

  const javaCode = `// Maven: com.azure:azure-search-documents:11.8.0-beta.1

import com.azure.core.credential.AzureKeyCredential;
import com.azure.search.documents.SearchAgentClient;
import com.azure.search.documents.SearchAgentClientBuilder;
import com.azure.search.documents.models.*;

import java.util.Arrays;
import java.util.List;

public class KnowledgeAgentExample {
    public static void main(String[] args) {
        // Create client
        String endpoint = "https://{search-service}.search.windows.net";
        String apiKey = "{search-admin-api-key}";
        String agentId = "${agentId}";

        SearchAgentClient client = new SearchAgentClientBuilder()
            .endpoint(endpoint)
            .credential(new AzureKeyCredential(apiKey))
            .buildClient();

        // Build messages
        List<Message> messages = Arrays.asList(
            new Message()
                .setRole(MessageRole.USER)
                .setContent("What information is available about Azure AI Search?")
        );

        // Retrieve from agent
        RetrieveRequest request = new RetrieveRequest()
            .setMessages(messages);

        RetrieveResponse response = client.getAgents()
            .retrieve(agentId, request);

        // Access response
        if (response.getResponse() != null && !response.getResponse().isEmpty()) {
            String answer = response.getResponse().get(0)
                .getContent().get(0).getText();
            System.out.println("Answer: " + answer);
        }

        // Access references
        if (response.getReferences() != null) {
            System.out.println("Found " + response.getReferences().size() + " references");
        }

        // Access activity
        if (response.getActivity() != null) {
            System.out.println("Performed " + response.getActivity().size() + " search operations");
        }
    }
}`

  const dotnetCode = `// NuGet: Azure.Search.Documents -Version 12.0.0-beta.8

using Azure;
using Azure.Search.Documents;
using Azure.Search.Documents.Models.Agentic;

// Create client
string endpoint = "https://{search-service}.search.windows.net";
string apiKey = "{search-admin-api-key}";
string agentId = "${agentId}";

var credential = new AzureKeyCredential(apiKey);
var client = new SearchAgentClient(new Uri(endpoint), credential);

// Build messages
var messages = new List<Message>
{
    new Message
    {
        Role = MessageRole.User,
        Content = new[]
        {
            new MessageContent
            {
                Type = "text",
                Text = "What information is available about Azure AI Search?"
            }
        }
    }
};

// Retrieve from agent
var request = new RetrieveRequest
{
    Messages = messages
};

RetrieveResponse response = await client.Agents.RetrieveAsync(agentId, request);

// Access response
if (response.Response?.Any() == true)
{
    var answer = response.Response[0].Content[0].Text;
    Console.WriteLine($"Answer: {answer}");
}

// Access references
if (response.References != null)
{
    Console.WriteLine($"Found {response.References.Count} references");
}

// Access activity
if (response.Activity != null)
{
    Console.WriteLine($"Performed {response.Activity.Count} search operations");
}`

  const getCodeSnippet = (language: string) => {
    switch (language) {
      case 'curl': return curlCode
      case 'python': return pythonCode
      case 'typescript': return typescriptCode
      case 'javascript': return javascriptCode
      case 'java': return javaCode
      case 'dotnet': return dotnetCode
      default: return curlCode
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-canvas border border-stroke-divider rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stroke-divider">
          <div>
            <h2 className="text-lg font-semibold text-fg-default">Knowledge Agent Code Samples</h2>
            <p className="text-sm text-fg-muted">
              Minimal examples for retrieving from {agentName} agent
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Dismiss20Regular className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-4">
            {/* Language selector and copy button */}
            <div className="flex items-center justify-between">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="curl">cURL (REST API)</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="dotnet">.NET</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyCode(getCodeSnippet(selectedLanguage), selectedLanguage)}
                className="h-8"
              >
                {copiedCode === selectedLanguage ? (
                  <>
                    <Checkmark20Regular className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy20Regular className="h-4 w-4 mr-2" />
                    Copy code
                  </>
                )}
              </Button>
            </div>

            {/* SDK version info */}
            <div className="bg-bg-subtle border border-stroke-divider rounded-md p-3">
              <div className="text-xs text-fg-muted space-y-1">
                <div className="font-medium text-fg-default mb-1">SDK Versions:</div>
                {selectedLanguage === 'python' && <div>• Python: azure-search-documents==11.7.0b1</div>}
                {selectedLanguage === 'typescript' && <div>• TypeScript: @azure/search-documents@12.0.0-beta.9</div>}
                {selectedLanguage === 'javascript' && <div>• JavaScript: @azure/search-documents@12.0.0-beta.9</div>}
                {selectedLanguage === 'java' && <div>• Java: com.azure:azure-search-documents:11.8.0-beta.1</div>}
                {selectedLanguage === 'dotnet' && <div>• .NET: Azure.Search.Documents -Version 12.0.0-beta.8</div>}
                {selectedLanguage === 'curl' && <div>• REST API: 2025-08-01-preview</div>}
              </div>
            </div>

            {/* Code snippet */}
            <pre className="bg-bg-subtle border border-stroke-divider rounded-md p-4 text-xs text-fg-default overflow-x-auto">
              <code>{getCodeSnippet(selectedLanguage)}</code>
            </pre>

            {/* Documentation link */}
            <div className="bg-accent-subtle border border-accent rounded-md p-3">
              <div className="text-sm text-fg-default">
                <strong>📚 Documentation:</strong>
                <a
                  href="https://learn.microsoft.com/en-us/azure/search/search-get-started-agentic-retrieval"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-accent hover:underline"
                >
                  Quickstart: Agentic Retrieval in Azure AI Search
                </a>
              </div>
            </div>

            {/* Additional notes */}
            <div className="text-xs text-fg-muted space-y-1">
              <div className="font-medium">Remember to:</div>
              <div>• Replace {'{search-service}'} with your Azure AI Search service name</div>
              <div>• Replace {'{search-admin-api-key}'} with your API key</div>
              <div>• Ensure your agent ID is correct: <code className="bg-bg-subtle px-1">{agentId}</code></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}