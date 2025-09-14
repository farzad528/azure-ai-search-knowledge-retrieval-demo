# Azure AI Search Knowledge Retrieval Demo

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/farzad528/azure-ai-search-knowledge-retrieval-demo)
[![Dev Containers](https://img.shields.io/badge/Dev%20Container-Open%20in%20VS%20Code-blue?logo=visualstudiocode&logoColor=white)](https://code.visualstudio.com/docs/devcontainers/containers)

A minimal Next.js UI to explore Azure AI Search "knowledge agents" and retrieval with your own data. You supply your Azure AI Search endpoint & key plus (optionally) Azure OpenAI endpoint & key; then create Knowledge Sources and Agents, and test retrieval in the playground.

## 1. Setup
Prerequisites:
- Node.js 18+ (LTS recommended)
- An Azure AI Search service (endpoint + admin/query key)
- Azure OpenAI resource (endpoint + key) for creating a new knowledge agent

Install & configure:
```bash
pnpm install   # or npm install / yarn install
cp .env.example .env.local  # then edit values
pnpm dev       # or npm run dev
```

## 2. Environment Variables
Add these to `.env.local` (never commit real values):
```bash
AZURE_SEARCH_ENDPOINT=https://<your-search>.search.windows.net
AZURE_SEARCH_API_KEY=<your-search-key>
AZURE_SEARCH_API_VERSION=2025-08-01-preview
NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT=https://<your-openai>.openai.azure.com   # optional
AZURE_OPENAI_API_KEY=<your-openai-key>                                    # optional (server-side only)
```
Notes:
- Only expose values with `NEXT_PUBLIC_` if safe for the client (endpoints are fine; keys are not).
- Do NOT prefix secret keys with `NEXT_PUBLIC_`.

## 3. Bring Your Own Data
1. Start the app and open `http://localhost:3000`.
2. Create Knowledge Sources (e.g., pointing to your search index or other supported types). No keys are stored in code—calls use your env vars.
3. Create a Knowledge Agent: pick model (Azure OpenAI) and select sources.
4. Use the Playground to send messages; view generated code snippets (replace placeholders with your env values if copying externally).

## 4. Run & Next Steps
Run dev:
```bash
pnpm dev
```
Build & start production:
```bash
pnpm build
pnpm start
```
Next ideas: add authentication, connect additional source types, or deploy (e.g., Azure Static Web Apps + managed API). Keep `.env.local` out of git.

Security: No API keys are hardcoded in this repository. All sensitive values must come from your environment.

---
Minimal by design—extend as needed.

### Dev Container / Codespaces
You can launch this repo instantly in a cloud dev environment via **GitHub Codespaces** or locally in VS Code using **Dev Containers**. The provided `.devcontainer/devcontainer.json` sets up Node 20 and recommended extensions. After opening:
```bash
npm install
npm run dev
```
Add your `.env.local` values first (Codespaces secret store recommended for keys).
