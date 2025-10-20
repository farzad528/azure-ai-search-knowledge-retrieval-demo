## Azure AI Search – Knowledge Retrieval Demo

Next.js app for Azure AI Search knowledge sources, agents, and **Foundry Agent Service integration** with MCP tools. Create agents, chat with knowledge grounding, and export code snippets.

**🚀 Deploy to Vercel**: See [QUICK_START_VERCEL.md](./QUICK_START_VERCEL.md) for 5-minute deployment guide with automatic authentication.

### 1. What It Does
* **Knowledge Sources**: Connect Azure Blob, Search Index, or Web sources
* **Knowledge Agents**: Multi-source retrieval orchestration
* **Agent Builder**: Visual agent creation with MCP tool integration
* **Foundry Integration**: Deploy agents to Azure AI Foundry with chat threads
* **Code Export**: Generate cURL and Python SDK examples

### 2. Requirements
| Tool / Service | Purpose |
| -------------- | ------- |
| Node.js 18+    | Run/build the Next.js app |
| Azure AI Search| Knowledge sources & agents backend |
| Azure AI Foundry | Agent hosting with MCP tools |
| Azure CLI      | Generate bearer tokens |

### 3. Environment Setup

#### For Production (Vercel/Cloud)
Use **Service Principal** for automatic token refresh. See [QUICK_START_VERCEL.md](./QUICK_START_VERCEL.md) or [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md).

#### For Local Development
Copy `.env.example` to `.env.local` and configure:

```bash
# Azure AI Search
AZURE_SEARCH_ENDPOINT=https://your-search.search.windows.net
AZURE_SEARCH_API_KEY=your-search-admin-key
AZURE_SEARCH_API_VERSION=2025-11-01-preview

# Azure OpenAI (Standalone for higher rate limits)
NEXT_PUBLIC_STANDALONE_AOAI_ENDPOINT=https://your-openai.openai.azure.com
NEXT_PUBLIC_STANDALONE_AOAI_KEY=your-openai-key

# Foundry Project Integration
FOUNDRY_PROJECT_ENDPOINT=https://your-resource.services.ai.azure.com/api/projects/your-project

# Option 1: Service Principal (Recommended - auto-refresh)
AZURE_AUTH_METHOD=service-principal
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret

# Option 2: Manual Bearer Token (expires after 1 hour)
# FOUNDRY_BEARER_TOKEN=your-bearer-token

# Public endpoints (for MCP URLs)
NEXT_PUBLIC_SEARCH_ENDPOINT=https://your-search.search.windows.net
```

**Generate Manual Bearer Token (Option 2):**
```bash
az account get-access-token --resource https://ai.azure.com --query accessToken -o tsv
```

**Create Service Principal (Option 1 - Recommended):**
```bash
az ad sp create-for-rbac --name "ai-demo-local" --role "Cognitive Services User" --scopes /subscriptions/YOUR_SUB_ID/resourceGroups/YOUR_RG
```

### 4. Quick Start

#### Local Development
```bash
cp .env.example .env.local   # fill in your values
npm install
npm run dev                  # http://localhost:3000
```

#### Vercel Deployment
```bash
# See QUICK_START_VERCEL.md for detailed steps
npm run vercel-deploy
```

**Usage Flow:**
1. **Knowledge Sources**: Connect your data sources (Blob/Search/Web)
2. **Agent Builder**: Create agents with MCP tool integration
   - Select knowledge bases from dropdown
   - Choose model (gpt-4.1 for MCP support)
   - Click "Create agent" → auto-creates Foundry assistant
3. **Chat Interface**: Test with multiple threads and tool usage
4. **View Code**: Export cURL/Python examples anytime

### 5. Features

**🎯 Agent Builder**
- Visual agent configuration with Model, Tools, Instructions, Knowledge
- Multi-select knowledge bases with smart filtering
- MCP tool integration (server labels, URLs, headers)
- Real-time code export (cURL + Python SDK)

**🧵 Thread Management**
- Multiple conversation threads per agent
- Create new threads, switch between conversations
- Thread deletion and active thread highlighting

**💻 Code Export**
- **cURL**: Complete REST API examples with authentication
- **Python SDK**: Using `azure-ai-agents` with MCP integration
- Copy-to-clipboard functionality for each section

**🔧 MCP Integration**
- Automatic server URL generation: `{endpoint}/agents/{name}/mcp`
- Server labels with dash-to-underscore conversion
- API key injection for knowledge base authentication

### 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| **401 Unauthorized (Foundry)** | Regenerate bearer token: `az account get-access-token --resource https://ai.azure.com` |
| **Model not MCP compatible** | Use `gpt-4.1` - other models may not support MCP tools |
| **Knowledge bases not loading** | Check Azure Search endpoint and API key permissions |
| **Thread not responding** | Verify Foundry project endpoint and bearer token validity |

### 7. API Flow

The Foundry integration follows this pattern:
1. **Create Assistant** with MCP tools → `POST /assistants`
2. **Create Thread** for conversation → `POST /threads`
3. **Send Message** to thread → `POST /threads/{id}/messages`
4. **Create Run** with tool resources → `POST /threads/{id}/runs`
5. **Poll Status** until complete → `GET /threads/{id}/runs/{runId}`

---
**Ready for Azure AI Foundry integration with knowledge grounding via MCP!**
