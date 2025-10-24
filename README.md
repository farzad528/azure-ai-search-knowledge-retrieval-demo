# Azure AI Search – Knowledge Retrieval Demo

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Ffarzad528%2Fazure-ai-search-knowledge-retrieval-demo%2Fmain%2Finfra%2Fmain.json)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/farzad528/azure-ai-search-knowledge-retrieval-demo&project-name=azure-ai-knowledge-demo&repository-name=azure-ai-knowledge-demo&env=AZURE_SEARCH_ENDPOINT,AZURE_SEARCH_API_KEY,AZURE_SEARCH_API_VERSION,NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT,AZURE_OPENAI_API_KEY,FOUNDRY_PROJECT_ENDPOINT,FOUNDRY_API_VERSION,AZURE_AUTH_METHOD,AZURE_TENANT_ID,AZURE_CLIENT_ID,AZURE_CLIENT_SECRET,NEXT_PUBLIC_SEARCH_ENDPOINT&envDescription=Copy%20values%20from%20Azure%20deployment%20outputs&envLink=https://github.com/farzad528/azure-ai-search-knowledge-retrieval-demo/blob/main/.env.example)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/farzad528/azure-ai-search-knowledge-retrieval-demo?quickstart=1)

**Deploys:** Azure AI Search + OpenAI (customizable chat & embedding models) + Storage + AI Foundry + Static Web App
**Default Models:** gpt-4o-mini + text-embedding-3-small | **Time:** 15-20 min | **Cost:** ~$80-120/month

A production-ready Next.js application showcasing **two powerful knowledge retrieval patterns**:

1. **Knowledge Bases** - Azure AI Search Agents with answer synthesis and multi-modal chat
2. **Foundry Agents** - Azure AI Foundry Assistant Service with MCP tool integration

Perfect for building customer-facing knowledge assistants, internal chatbots, and agentic workflows with enterprise data.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start - Local Development](#-quick-start---local-development)
- [Industry Demo Scenarios](#-industry-demo-scenarios)
- [Deployment Options](#-deployment-options)
- [Configuration Guide](#-configuration-guide)
- [Security Best Practices](#-security-best-practices)
- [Troubleshooting](#-troubleshooting)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)

---

## ✨ Features

### Knowledge Bases Playground (`/test`)

Built on Azure AI Search Knowledge Agents API:

* **Answer Synthesis** - GPT-powered responses with inline citations
* **Multi-Modal Chat** - Text + image inputs (vision models)
* **Source Grounding** - References from Blob Storage, Search Indexes, Web
* **Runtime Controls** - Adjust retrieval parameters per query (reranker threshold, max sub-queries)
* **Conversation Starters** - Domain-specific prompt suggestions
* **Source Snippets** - View exact text chunks from knowledge sources
* **Activity Tracking** - See search queries, token usage, and response times

### Foundry Agents Playground (`/agents`)

Built on Azure AI Foundry Assistant Service:

* **MCP Tool Integration** - Model Context Protocol for knowledge retrieval
* **Thread Management** - Server-side conversation history with multiple threads per agent
* **Model Selection** - GPT-4.1, GPT-4o, GPT-4o-mini, GPT-3.5-turbo
* **Code Export** - Generate cURL and Python SDK examples for production use
* **Multi-Agent Support** - Create and manage multiple specialized agents
* **Tool Resources** - Dynamic knowledge base selection per conversation
* **System Instructions** - Customize agent behavior and personality

### Shared Features

* **Visual Agent Builder** - No-code agent creation with knowledge base selection
* **Dark Mode** - System-aware theming
* **Responsive Design** - Mobile-first UI with collapsible sidebar
* **Error Handling** - Graceful degradation and user-friendly error messages
* **Auto-Authentication** - Service Principal with auto-refresh tokens

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                        │
│  ┌────────────────┐           ┌────────────────┐          │
│  │ Knowledge Base │           │ Foundry Agent  │          │
│  │  Playground    │           │  Playground    │          │
│  │   (/test)      │           │   (/agents)    │          │
│  └────────┬───────┘           └────────┬───────┘          │
│           │                             │                   │
└───────────┼─────────────────────────────┼──────────────────┘
            │                             │
            ▼                             ▼
   ┌─────────────────┐          ┌─────────────────┐
   │  Azure AI Search│          │ Azure AI Foundry│
   │ Knowledge Bases │          │ Assistant API   │
   │(2025-11-01-prev)│          │  (2025-05-01)   │
   └────────┬────────┘          └────────┬────────┘
            │                             │
            │    ┌──────────────────┐    │
            └────►  Knowledge       ◄────┘
                 │  Sources:        │
                 │  • Blob Storage  │
                 │  • Search Index  │
                 │  • Web Crawl     │
                 └──────────────────┘
```

### Key Differences

| Aspect | Knowledge Bases (`/test`) | Foundry Agents (`/agents`) |
|--------|---------------------------|----------------------------|
| **API Endpoint** | `/agents/{name}/retrieve` | `/assistants/{id}/threads/{thread}/runs` |
| **Protocol** | Direct REST | MCP Tools + Assistants |
| **State** | Stateless (client-side history) | Stateful (server-side threads) |
| **Citations** | Inline with source snippets | Tool call tracking |
| **Use Case** | Q&A, summarization, synthesis | Agentic workflows, multi-step tasks |
| **Auth** | API Key | Bearer Token (Service Principal) |
| **Best For** | Customer-facing knowledge assistants | Internal automation, complex reasoning |

---

## 🚀 Quick Start - Local Development

### Prerequisites

| Tool / Service | Purpose | Required |
|----------------|---------|----------|
| **Node.js 18+** | Run/build the Next.js app | ✅ Always |
| **Azure AI Search** | Knowledge sources & agents backend | ✅ Always |
| **Azure OpenAI** | Embeddings and completions | ✅ Always |
| **Azure AI Foundry** | Agent hosting with MCP tools | ⚠️ Optional (only for `/agents`) |
| **Azure CLI** | Generate bearer tokens | ⚠️ Optional (alternative to Service Principal) |

### 1. Clone & Install

```bash
# Azure AI Search
AZURE_SEARCH_ENDPOINT=https://your-search.search.windows.net
AZURE_SEARCH_API_KEY=your-search-admin-key
AZURE_SEARCH_API_VERSION=2025-11-01-preview
git clone https://github.com/farzad528/azure-ai-search-knowledge-retrieval-demo.git
cd azure-ai-search-knowledge-retrieval-demo
npm install
```

### 2. Set Up Azure Resources

#### Option A: Use Existing Resources

If you already have Azure AI Search and Azure OpenAI resources, skip to [Step 3](#3-configure-environment-variables).

#### Option B: Create New Resources

```bash
# Set variables
RESOURCE_GROUP="rg-knowledge-demo"
LOCATION="eastus"
SEARCH_SERVICE="search-knowledge-demo-$(date +%s)"
OPENAI_SERVICE="openai-knowledge-demo-$(date +%s)"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Azure AI Search
az search service create \
  --name $SEARCH_SERVICE \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku standard \
  --partition-count 1 \
  --replica-count 1

# Get Search admin key
SEARCH_KEY=$(az search admin-key show \
  --resource-group $RESOURCE_GROUP \
  --service-name $SEARCH_SERVICE \
  --query primaryKey -o tsv)

# Create Azure OpenAI
az cognitiveservices account create \
  --name $OPENAI_SERVICE \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --kind OpenAI \
  --sku S0 \
  --yes

# Get OpenAI key
OPENAI_KEY=$(az cognitiveservices account keys list \
  --resource-group $RESOURCE_GROUP \
  --name $OPENAI_SERVICE \
  --query key1 -o tsv)

# Deploy models (adjust as needed)
az cognitiveservices account deployment create \
  --resource-group $RESOURCE_GROUP \
  --name $OPENAI_SERVICE \
  --deployment-name text-embedding-3-large \
  --model-name text-embedding-3-large \
  --model-version "1" \
  --model-format OpenAI \
  --sku-capacity 120 \
  --sku-name Standard

az cognitiveservices account deployment create \
  --resource-group $RESOURCE_GROUP \
  --name $OPENAI_SERVICE \
  --deployment-name gpt-4o \
  --model-name gpt-4o \
  --model-version "2024-08-06" \
  --model-format OpenAI \
  --sku-capacity 50 \
  --sku-name Standard

echo "Search Endpoint: https://$SEARCH_SERVICE.search.windows.net"
echo "Search Key: $SEARCH_KEY"
echo "OpenAI Endpoint: https://$OPENAI_SERVICE.openai.azure.com"
echo "OpenAI Key: $OPENAI_KEY"
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Azure resource details:

```bash
# Azure AI Search (REQUIRED)
AZURE_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_SEARCH_API_KEY=your-admin-key-from-azure-portal
AZURE_SEARCH_API_VERSION=2025-11-01-preview

# Azure OpenAI (REQUIRED)
NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT=https://your-openai.openai.azure.com
AZURE_OPENAI_API_KEY=your-openai-key

# Standalone Azure OpenAI (OPTIONAL - for higher rate limits)
NEXT_PUBLIC_STANDALONE_AOAI_ENDPOINT=https://your-standalone-openai.openai.azure.com
NEXT_PUBLIC_STANDALONE_AOAI_KEY=your-standalone-key

# Azure AI Foundry (OPTIONAL - only needed for /agents playground)
FOUNDRY_PROJECT_ENDPOINT=https://your-resource.services.ai.azure.com/api/projects/your-project
FOUNDRY_API_VERSION=2025-05-01

# Authentication Method 1: Service Principal (RECOMMENDED - auto-refresh)
AZURE_AUTH_METHOD=service-principal
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret

# Authentication Method 2: Manual Bearer Token (DEV ONLY - expires hourly)
# FOUNDRY_BEARER_TOKEN=your-token-from-az-cli

# Public Endpoints (for MCP URLs)
NEXT_PUBLIC_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
```

#### How to Get Service Principal Credentials

**For auto-refreshing tokens (recommended):**

```bash
# Create service principal
az ad sp create-for-rbac \
  --name "ai-demo-local" \
  --role "Cognitive Services User" \
  --scopes /subscriptions/YOUR_SUB_ID/resourceGroups/YOUR_RG

# Output will look like:
# {
#   "appId": "xxx",           ← Use as AZURE_CLIENT_ID
#   "password": "xxx",        ← Use as AZURE_CLIENT_SECRET
#   "tenant": "xxx"           ← Use as AZURE_TENANT_ID
# }
```

**For manual bearer tokens (dev only, expires hourly):**

```bash
az account get-access-token \
  --resource https://ai.azure.com \
  --query accessToken -o tsv
```

### 4. Upload Sample Data (Optional)

To test with sample data:

```bash
# Create a storage account and container
STORAGE_ACCOUNT="storage$(date +%s)"
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS

az storage container create \
  --name sample-docs \
  --account-name $STORAGE_ACCOUNT

# Upload sample PDFs (replace with your own files)
az storage blob upload-batch \
  --account-name $STORAGE_ACCOUNT \
  --destination sample-docs \
  --source ./sample-data \
  --pattern "*.pdf"

# Get storage connection string
az storage account show-connection-string \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Your First Knowledge Base

1. Navigate to `/knowledge` in the app
2. Click **"Create Knowledge Base"**
3. Add knowledge sources:
   - **Azure Blob**: Connect your storage container
   - **Search Index**: Link an existing search index
   - **Web Crawl**: Add URLs to crawl
4. Configure output settings:
   - **Answer Synthesis**: GPT generates natural language responses
   - **Extractive Data**: Return raw source chunks
5. Click **"Create"** and wait for provisioning (~30 seconds)
6. Test in the Playground (`/test`)

---

## 🏭 Industry Demo Scenarios

This section provides relatable industry-specific scenarios to help you adapt this demo for your own use cases.

### 🏦 Financial Services - Investment Research Assistant

**Use Case**: Enable analysts to query across earnings reports, SEC filings, and market research.

**Data Sources**:
- Azure Blob Storage: Quarterly earnings PDFs, analyst reports
- Azure AI Search Index: SEC filings (10-K, 10-Q, 8-K)
- Web Crawl: Financial news (Yahoo Finance, Bloomberg)

**Knowledge Base Configuration**:
```json
{
  "name": "financial-research-kb",
  "description": "Comprehensive financial data for investment analysis",
  "knowledgeSources": [
    {
      "name": "earnings-reports",
      "kind": "azureBlob",
      "containerName": "earnings-pdfs",
      "includeReferences": true,
      "includeReferenceSourceData": true
    },
    {
      "name": "sec-filings-index",
      "kind": "searchIndex",
      "indexName": "sec-filings",
      "alwaysQuerySource": true,
      "maxSubQueries": 5
    }
  ],
  "outputConfiguration": {
    "modality": "answerSynthesis",
    "answerInstructions": "Provide investment analysis with specific citations. Always include financial metrics, dates, and confidence levels."
  }
}
```

**Sample Prompts**:
- "What are the key revenue drivers for MSFT based on their latest 10-K?"
- "Compare AAPL and GOOGL gross margins over the last 3 quarters"
- "Summarize analyst sentiment on Tesla stock in the past week"

**Implementation Steps**:
1. Upload earnings PDFs to Blob Storage container `earnings-pdfs`
2. Create search index with SEC filings using Azure AI Search
3. Configure knowledge base in the app: `/knowledge/create`
4. Test in playground: `/test`

---

### 🏥 Healthcare & Life Sciences - Clinical Research Knowledge Base

**Use Case**: Help researchers quickly find relevant clinical trials and research papers.

**Data Sources**:
- Azure Blob Storage: Clinical trial protocols (PDF/DOCX)
- Azure AI Search Index: PubMed abstracts, medical journals
- SharePoint: Internal research documentation

**Knowledge Base Configuration**:
```json
{
  "name": "clinical-research-kb",
  "description": "Medical research literature and clinical trial data",
  "knowledgeSources": [
    {
      "name": "clinical-trials",
      "kind": "azureBlob",
      "containerName": "clinical-protocols",
      "includeReferences": true,
      "rerankerThreshold": 0.7
    },
    {
      "name": "pubmed-index",
      "kind": "searchIndex",
      "indexName": "pubmed-research",
      "semanticConfiguration": "medical-semantic-config"
    }
  ],
  "outputConfiguration": {
    "modality": "answerSynthesis",
    "answerInstructions": "Cite all medical claims with sources. Include publication dates and study sample sizes. Flag conflicting evidence."
  },
  "retrievalInstructions": "Prioritize recent publications (last 5 years). For drug information, always check FDA approval status."
}
```

**Sample Prompts**:
- "What are the latest Phase III trials for Alzheimer's treatment?"
- "Summarize side effects reported for [drug name] across clinical studies"
- "Find protocols for CAR-T cell therapy in pediatric patients"

**Compliance Note**: Ensure HIPAA compliance. Use de-identified data only.

---

### 🏭 Manufacturing & Supply Chain - Equipment Maintenance Assistant

**Use Case**: Empower technicians with instant access to equipment manuals and troubleshooting guides.

**Data Sources**:
- Azure Blob Storage: Equipment manuals (PDF), CAD drawings, maintenance photos
- Azure AI Search Index: Historical maintenance tickets, parts inventory
- Web Crawl: Manufacturer support sites

**Knowledge Base Configuration**:
```json
{
  "name": "equipment-maintenance-kb",
  "description": "Equipment documentation and maintenance history",
  "knowledgeSources": [
    {
      "name": "equipment-manuals",
      "kind": "azureBlob",
      "containerName": "equipment-docs",
      "includeReferences": true,
      "includeReferenceSourceData": true
    },
    {
      "name": "maintenance-history",
      "kind": "searchIndex",
      "indexName": "maintenance-tickets",
      "alwaysQuerySource": true
    }
  ],
  "outputConfiguration": {
    "modality": "answerSynthesis",
    "answerInstructions": "Provide step-by-step troubleshooting. Include safety warnings prominently. Reference specific manual page numbers."
  }
}
```

**Sample Prompts**:
- "How do I replace the hydraulic pump on Model X-2000?"
- "What are common causes of bearing failure in this equipment?"
- "Show me the maintenance schedule for conveyor belt system"

**Multi-modal**: Enable image upload for technicians to share photos of issues for visual diagnosis.

---

### ⚖️ Legal & Compliance - Contract Analysis Assistant

**Use Case**: Enable legal teams to search contracts and case law for precedents.

**Data Sources**:
- Azure Blob Storage: Contract repository (PDF/DOCX)
- Azure AI Search Index: Case law database, regulatory filings
- SharePoint: Internal legal memos

**Knowledge Base Configuration**:
```json
{
  "name": "legal-research-kb",
  "description": "Contracts, case law, and regulatory documents",
  "knowledgeSources": [
    {
      "name": "contract-repository",
      "kind": "azureBlob",
      "containerName": "contracts",
      "includeReferences": true,
      "includeReferenceSourceData": true,
      "rerankerThreshold": 0.75
    },
    {
      "name": "case-law-index",
      "kind": "searchIndex",
      "indexName": "legal-cases",
      "semanticConfiguration": "legal-semantic-config",
      "maxSubQueries": 10
    }
  ],
  "outputConfiguration": {
    "modality": "answerSynthesis",
    "answerInstructions": "Cite specific clauses, case numbers, and statutes. Include jurisdiction and dates. Distinguish between binding precedent and persuasive authority."
  }
}
```

**Sample Prompts**:
- "Find all force majeure clauses in our vendor contracts from 2022-2024"
- "What are the precedents for [legal issue] in California?"
- "Summarize compliance requirements for GDPR Article 17"

**Security**: Implement row-level security for sensitive contracts.

---

### 🛍️ Retail & E-Commerce - Product Knowledge Assistant

**Use Case**: Help customer service teams quickly answer product questions.

**Data Sources**:
- Azure Blob Storage: Product manuals, spec sheets, images
- Azure AI Search Index: Product catalog, customer reviews, FAQ
- Dynamics 365: Customer service tickets

**Knowledge Base Configuration**:
```json
{
  "name": "product-knowledge-kb",
  "description": "Product information and customer service data",
  "knowledgeSources": [
    {
      "name": "product-catalog",
      "kind": "searchIndex",
      "indexName": "products",
      "includeReferences": true,
      "alwaysQuerySource": true
    },
    {
      "name": "product-manuals",
      "kind": "azureBlob",
      "containerName": "manuals",
      "includeReferenceSourceData": true
    },
    {
      "name": "customer-reviews",
      "kind": "searchIndex",
      "indexName": "reviews",
      "semanticConfiguration": "review-sentiment-config"
    }
  ],
  "outputConfiguration": {
    "modality": "answerSynthesis",
    "answerInstructions": "Provide accurate product information with SKU numbers. For troubleshooting, give step-by-step guidance."
  }
}
```

**Sample Prompts**:
- "What are the dimensions and weight capacity of SKU-12345?"
- "How do customers rate the battery life on [product name]?"
- "Walk me through pairing this Bluetooth speaker with an iPhone"

---

### 🏗️ Architecture, Engineering & Construction - Building Code Reference

**Use Case**: Help architects and engineers quickly find building codes and standards.

**Data Sources**:
- Azure Blob Storage: Building codes (PDF), technical specifications
- Azure AI Search Index: Project documentation, design standards
- Web Crawl: ASHRAE standards, LEED documentation

**Knowledge Base Configuration**:
```json
{
  "name": "building-codes-kb",
  "description": "Building codes, standards, and technical specifications",
  "knowledgeSources": [
    {
      "name": "building-codes",
      "kind": "azureBlob",
      "containerName": "codes-and-standards",
      "includeReferences": true,
      "includeReferenceSourceData": true
    },
    {
      "name": "project-specs",
      "kind": "searchIndex",
      "indexName": "technical-specs",
      "semanticConfiguration": "engineering-semantic-config"
    }
  ],
  "outputConfiguration": {
    "modality": "answerSynthesis",
    "answerInstructions": "Cite specific code sections and edition years. Highlight jurisdiction-specific variations."
  }
}
```

**Sample Prompts**:
- "What are the egress requirements for a 10-story office building in California?"
- "Show me HVAC efficiency standards for LEED Gold certification"
- "What fire rating is required for this partition type?"

---

## 📦 Deployment Options

### Vercel Deployment (Recommended)

**Best for**: Global edge deployment, automatic SSL, serverless scaling

#### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Azure Service Principal**: For auto-refreshing tokens

#### Steps

1. **Create Service Principal**:

```bash
az ad sp create-for-rbac \
  --name "vercel-ai-agent-demo" \
  --role "Cognitive Services User" \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/YOUR_RESOURCE_GROUP
```

Save the output (`appId`, `password`, `tenant`) for step 3.

2. **Deploy to Vercel**:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (will prompt for account login)
vercel --prod
```

3. **Configure Environment Variables**:

Go to your Vercel project settings → Environment Variables and add:

```bash
# Azure AI Search
AZURE_SEARCH_ENDPOINT=https://your-search.search.windows.net
AZURE_SEARCH_API_KEY=your-admin-key
AZURE_SEARCH_API_VERSION=2025-11-01-preview

# Azure OpenAI
NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT=https://your-openai.openai.azure.com
AZURE_OPENAI_API_KEY=your-key

# Standalone OpenAI (optional)
NEXT_PUBLIC_STANDALONE_AOAI_ENDPOINT=https://your-standalone-openai.openai.azure.com
NEXT_PUBLIC_STANDALONE_AOAI_KEY=your-key

# Foundry Project
FOUNDRY_PROJECT_ENDPOINT=https://your-resource.services.ai.azure.com/api/projects/your-project
FOUNDRY_API_VERSION=2025-05-01

# Service Principal (from step 1)
AZURE_AUTH_METHOD=service-principal
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-app-id
AZURE_CLIENT_SECRET=your-password

# Public Endpoints
NEXT_PUBLIC_SEARCH_ENDPOINT=https://your-search.search.windows.net
```

4. **Redeploy** to pick up environment variables:

```bash
vercel --prod
```

**Your app is live!** Visit `https://your-project.vercel.app`

---

### Azure App Service Deployment

**Best for**: Private network deployments, Managed Identity, Azure-native integrations

#### Prerequisites

- Azure CLI installed
- Azure subscription with App Service quota

#### Steps

1. **Create App Service**:

```bash
RESOURCE_GROUP="rg-knowledge-demo"
APP_NAME="knowledge-demo-$(date +%s)"
LOCATION="eastus"

# Create App Service Plan (Linux)
az appservice plan create \
  --name "$APP_NAME-plan" \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --is-linux \
  --sku B1

# Create Web App
az webapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan "$APP_NAME-plan" \
  --runtime "NODE:18-lts"
```

2. **Enable Managed Identity**:

```bash
# Enable system-assigned managed identity
az webapp identity assign \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP

# Get the managed identity principal ID
PRINCIPAL_ID=$(az webapp identity show \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query principalId -o tsv)

# Grant access to Azure AI services
az role assignment create \
  --assignee $PRINCIPAL_ID \
  --role "Cognitive Services User" \
  --scope /subscriptions/YOUR_SUB_ID/resourceGroups/$RESOURCE_GROUP
```

3. **Configure Application Settings**:

```bash
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    AZURE_SEARCH_ENDPOINT="https://your-search.search.windows.net" \
    AZURE_SEARCH_API_KEY="your-admin-key" \
    AZURE_SEARCH_API_VERSION="2025-11-01-preview" \
    NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT="https://your-openai.openai.azure.com" \
    AZURE_OPENAI_API_KEY="your-key" \
    FOUNDRY_PROJECT_ENDPOINT="https://your-resource.services.ai.azure.com/api/projects/your-project" \
    FOUNDRY_API_VERSION="2025-05-01" \
    AZURE_AUTH_METHOD="managed-identity" \
    NEXT_PUBLIC_SEARCH_ENDPOINT="https://your-search.search.windows.net"
```

4. **Deploy Application**:

```bash
# Build the app
npm run build

# Create deployment ZIP
zip -r deploy.zip .next package.json package-lock.json node_modules

# Deploy to App Service
az webapp deployment source config-zip \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --src deploy.zip
```

5. **Configure Startup Command**:

```bash
az webapp config set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --startup-file "npm start"
```

**Your app is live!** Visit `https://$APP_NAME.azurewebsites.net`

---

### Docker Deployment

**Best for**: Kubernetes, Azure Container Instances, on-premises

#### Dockerfile

Create `Dockerfile` in the project root:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

#### Build & Run

```bash
# Build image
docker build -t knowledge-demo:latest .

# Run locally with environment variables
docker run -p 3000:3000 \
  -e AZURE_SEARCH_ENDPOINT="https://your-search.search.windows.net" \
  -e AZURE_SEARCH_API_KEY="your-key" \
  -e AZURE_SEARCH_API_VERSION="2025-11-01-preview" \
  -e NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT="https://your-openai.openai.azure.com" \
  -e AZURE_OPENAI_API_KEY="your-key" \
  -e FOUNDRY_PROJECT_ENDPOINT="https://your-resource.services.ai.azure.com/api/projects/your-project" \
  -e AZURE_TENANT_ID="your-tenant" \
  -e AZURE_CLIENT_ID="your-client-id" \
  -e AZURE_CLIENT_SECRET="your-secret" \
  -e AZURE_AUTH_METHOD="service-principal" \
  -e NEXT_PUBLIC_SEARCH_ENDPOINT="https://your-search.search.windows.net" \
  knowledge-demo:latest
```

#### Deploy to Azure Container Instances

```bash
CONTAINER_NAME="knowledge-demo"
RESOURCE_GROUP="rg-knowledge-demo"

az container create \
  --name $CONTAINER_NAME \
  --resource-group $RESOURCE_GROUP \
  --image knowledge-demo:latest \
  --cpu 2 \
  --memory 4 \
  --dns-name-label $CONTAINER_NAME \
  --ports 3000 \
  --environment-variables \
    AZURE_SEARCH_ENDPOINT="https://your-search.search.windows.net" \
    AZURE_SEARCH_API_VERSION="2025-11-01-preview" \
    NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT="https://your-openai.openai.azure.com" \
    FOUNDRY_PROJECT_ENDPOINT="https://your-resource.services.ai.azure.com/api/projects/your-project" \
    AZURE_AUTH_METHOD="service-principal" \
    NEXT_PUBLIC_SEARCH_ENDPOINT="https://your-search.search.windows.net" \
  --secure-environment-variables \
    AZURE_SEARCH_API_KEY="your-admin-key" \
    AZURE_OPENAI_API_KEY="your-key" \
    AZURE_TENANT_ID="your-tenant" \
    AZURE_CLIENT_ID="your-client-id" \
    AZURE_CLIENT_SECRET="your-secret"
```

---

## 🔐 Security Best Practices

### 1. Authentication

**Service Principal (Recommended)**:
- Auto-refreshing tokens (expires in 1 hour, refreshes 5 minutes before expiry)
- Works on all platforms (Vercel, Azure, local)
- Implementation: [lib/token-manager.ts](lib/token-manager.ts)

**Managed Identity (Azure Only)**:
- No secrets to manage
- Automatic Azure AD authentication
- Best for Azure App Service or Container Apps

**Never use manual bearer tokens in production** - they expire hourly.

### 2. Secrets Management

**Environment Variables**:
- Local: `.env.local` (gitignored)
- Vercel: Project Settings → Environment Variables
- Azure: Application Settings (encrypted at rest)

**Secret Rotation**:

```bash
# Rotate Service Principal secret
az ad sp credential reset --id YOUR_CLIENT_ID

# Rotate Azure AI Search admin key
az search admin-key renew \
  --resource-group YOUR_RG \
  --service-name YOUR_SEARCH_SERVICE \
  --key-kind primary
```

### 3. Network Security

**Enable Private Endpoints** for Azure resources:

```bash
# Azure AI Search
az search private-endpoint-connection approve \
  --resource-group YOUR_RG \
  --service-name YOUR_SEARCH_SERVICE \
  --name YOUR_CONNECTION_NAME

# Azure OpenAI
az cognitiveservices account update \
  --name YOUR_OPENAI_ACCOUNT \
  --resource-group YOUR_RG \
  --public-network-access Disabled
```

**Configure IP Firewall**:

```bash
# Allow only specific IPs for Azure AI Search
az search service update \
  --name YOUR_SEARCH_SERVICE \
  --resource-group YOUR_RG \
  --ip-rules "203.0.113.0/24"
```

### 4. Data Protection

**Enable Soft Delete** for Blob Storage:

```bash
az storage blob service-properties delete-policy update \
  --account-name YOUR_STORAGE_ACCOUNT \
  --enable true \
  --days-retained 30
```

**Restrict Public Access**:

```bash
az storage account update \
  --name YOUR_STORAGE_ACCOUNT \
  --resource-group YOUR_RG \
  --allow-blob-public-access false
```

### 5. Content Safety

**Azure AI Content Safety Integration** (recommended for production):

```bash
# Create Content Safety resource
az cognitiveservices account create \
  --name YOUR_CONTENT_SAFETY \
  --resource-group YOUR_RG \
  --location eastus \
  --kind ContentSafety \
  --sku S0
```

Add to `.env.local`:

```bash
CONTENT_SAFETY_ENDPOINT=https://YOUR_CONTENT_SAFETY.cognitiveservices.azure.com
CONTENT_SAFETY_KEY=your-key
```

### 6. Rate Limiting

Implement rate limiting to prevent abuse (see [SECURITY_HARDENING.md](./SECURITY_HARDENING.md) for full implementation).

### 7. Input Validation

All API routes validate input using Zod schemas (see [lib/validations.ts](lib/validations.ts)).

### 8. Monitoring & Auditing

**Enable Diagnostic Logging**:

```bash
# Azure AI Search
az monitor diagnostic-settings create \
  --name search-diagnostics \
  --resource /subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Search/searchServices/{name} \
  --logs '[{"category":"OperationLogs","enabled":true}]' \
  --workspace /subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.OperationalInsights/workspaces/{workspace}
```

**Application Insights** (optional):

```bash
# Create Application Insights
az monitor app-insights component create \
  --app YOUR_APP_NAME \
  --location eastus \
  --resource-group YOUR_RG \
  --workspace /subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.OperationalInsights/workspaces/{workspace}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. 401 Unauthorized (Foundry)

**Symptom**: Foundry API calls fail with 401 error

**Solutions**:
- **Manual token expired**: Regenerate with `az account get-access-token --resource https://ai.azure.com --query accessToken -o tsv`
- **Service Principal misconfigured**: Verify `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`
- **Insufficient permissions**: Grant "Cognitive Services User" role to Service Principal
  ```bash
  az role assignment create \
    --assignee YOUR_CLIENT_ID \
    --role "Cognitive Services User" \
    --scope /subscriptions/YOUR_SUB_ID
  ```

#### 2. Knowledge bases not loading

**Symptom**: Empty list on `/knowledge` page

**Solutions**:
- Verify `AZURE_SEARCH_ENDPOINT` and `AZURE_SEARCH_API_KEY`
- Check Azure AI Search service is running: `az search service show --name YOUR_SERVICE --resource-group YOUR_RG`
- Ensure API version `2025-11-01-preview` is set correctly

#### 3. Model not MCP compatible

**Symptom**: Error when creating Foundry agent

**Solutions**:
- Use `gpt-4.1` model (required for MCP tools)
- Other models may not support MCP integration yet

#### 4. CORS errors in browser console

**Symptom**: `Access-Control-Allow-Origin` errors

**Solutions**:
- Verify `NEXT_PUBLIC_SEARCH_ENDPOINT` matches actual search endpoint
- Ensure Azure AI Search allows requests from your domain (Vercel adds CORS headers automatically)

#### 5. Thread not responding

**Symptom**: Messages sent but no response

**Solutions**:
- Check Foundry project endpoint is correct
- Verify bearer token validity (regenerate if expired)
- Review browser console for API errors

#### 6. Port already in use

**Symptom**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or run on different port
PORT=3001 npm run dev
```

### Debug Mode

Enable verbose logging:

```bash
# In .env.local
NODE_ENV=development
DEBUG=true
```

Check browser console and terminal for detailed error messages.

---

## 📚 API Reference

### Knowledge Bases API

**Base URL**: `https://YOUR_SEARCH_SERVICE.search.windows.net`

#### List Agents

```bash
GET /agents?api-version=2025-11-01-preview
Headers:
  api-key: YOUR_ADMIN_KEY
```

#### Create Agent

```bash
PUT /agents/{agentName}?api-version=2025-11-01-preview
Headers:
  api-key: YOUR_ADMIN_KEY
  Content-Type: application/json

Body:
{
  "name": "my-agent",
  "description": "Agent description",
  "knowledgeSources": [
    {
      "name": "my-blob-source",
      "kind": "azureBlob",
      "containerName": "documents",
      "includeReferences": true
    }
  ],
  "models": [
    {
      "azureOpenAIParameters": {
        "resourceUrl": "https://your-openai.openai.azure.com",
        "deploymentName": "gpt-4o",
        "apiKey": "your-key",
        "modelName": "gpt-4o"
      }
    }
  ],
  "outputConfiguration": {
    "modality": "answerSynthesis",
    "answerInstructions": "Provide clear answers with citations."
  }
}
```

#### Query Agent

```bash
POST /agents/{agentName}/retrieve?api-version=2025-11-01-preview
Headers:
  api-key: YOUR_ADMIN_KEY
  Content-Type: application/json

Body:
{
  "messages": [
    {
      "role": "user",
      "content": "What is the summary of recent earnings?"
    }
  ]
}
```

### Foundry Assistants API

**Base URL**: `https://YOUR_RESOURCE.services.ai.azure.com/api/projects/YOUR_PROJECT`

#### List Assistants

```bash
GET /assistants?api-version=2025-05-01
Headers:
  Authorization: Bearer YOUR_TOKEN
```

#### Create Assistant

```bash
POST /assistants?api-version=2025-05-01
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json

Body:
{
  "name": "my-assistant",
  "instructions": "You are a helpful assistant.",
  "model": "gpt-4.1",
  "tools": [
    {
      "type": "mcp",
      "server_label": "knowledge_base_1",
      "server_url": "https://YOUR_SEARCH.search.windows.net/agents/my-agent/mcp?api-version=2025-11-01-preview",
      "allowed_tools": ["knowledge_agent_retrieve"]
    }
  ]
}
```

#### Create Thread

```bash
POST /threads?api-version=2025-05-01
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json

Body: {}
```

#### Send Message & Create Run

```bash
# 1. Add message to thread
POST /threads/{threadId}/messages?api-version=2025-05-01
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json

Body:
{
  "role": "user",
  "content": "What is the summary?"
}

# 2. Create run
POST /threads/{threadId}/runs?api-version=2025-05-01
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json

Body:
{
  "assistant_id": "{assistantId}",
  "tool_resources": {
    "mcp": [
      {
        "server_label": "knowledge_base_1",
        "api_key": "YOUR_SEARCH_KEY",
        "require_approval": "never"
      }
    ]
  }
}

# 3. Poll run status
GET /threads/{threadId}/runs/{runId}?api-version=2025-05-01
Headers:
  Authorization: Bearer YOUR_TOKEN
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Reporting Issues

1. Check existing [GitHub Issues](https://github.com/farzad528/azure-ai-search-knowledge-retrieval-demo/issues)
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs. actual behavior
   - Environment details (OS, Node.js version, Azure regions)

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `npm run build` (ensure no errors)
5. Commit with clear messages: `git commit -m "Add feature X"`
6. Push to your fork: `git push origin feature/my-feature`
7. Open a Pull Request with:
   - Description of changes
   - Screenshots (if UI changes)
   - Reference to related issues

### Code Style

- Use TypeScript for all new code
- Follow existing code conventions
- Add comments for complex logic
- Update documentation for new features

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built by the **Azure AI Search Product Group** with contributions from the community.

### Technology Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS, Fluent UI Icons
- **Authentication**: Azure Identity SDK, Service Principal
- **APIs**: Azure AI Search, Azure AI Foundry, Azure OpenAI
- **Deployment**: Vercel, Azure App Service, Docker

### Resources

- [Azure AI Search Docs](https://learn.microsoft.com/azure/search/)
- [Azure AI Foundry Docs](https://learn.microsoft.com/azure/ai-services/agents/)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Next.js Documentation](https://nextjs.org/docs)

---

## 📧 Support

- **Questions**: [GitHub Discussions](https://github.com/farzad528/azure-ai-search-knowledge-retrieval-demo/discussions)
- **Bugs**: [GitHub Issues](https://github.com/farzad528/azure-ai-search-knowledge-retrieval-demo/issues)
- **Azure Support**: [Azure Portal Support](https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade/overview)

---

**⭐ Star this repo** if you find it useful!

**🔗 Share** with your team to accelerate knowledge retrieval projects!

**💬 Join the conversation** on [GitHub Discussions](https://github.com/farzad528/azure-ai-search-knowledge-retrieval-demo/discussions)
