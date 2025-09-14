## Azure AI Search – Knowledge Retrieval Demo

Minimal Next.js (App Router) UI to explore Azure AI Search knowledge sources and agents, then test grounded retrieval in a chat playground. 

### 1. What It Does
* Connect to your Azure AI Search service.
* Register "knowledge sources" (search index, blob, web).
* Create "knowledge agents" that orchestrate multi‑source retrieval.
* Chat in the Playground with citations & activity details.

### 2. Requirements
| Tool / Service | Purpose |
| -------------- | ------- |
| Node.js 18+    | Run/build the Next.js app |
| Azure AI Search| Index & retrieval backend |
| Azure OpenAI (optional) | Model inference for agents |

### 3. Environment Variables (`.env.local`)
```bash
AZURE_SEARCH_ENDPOINT=https://<your-search>.search.windows.net
AZURE_SEARCH_API_KEY=<admin-or-query-key>
AZURE_SEARCH_API_VERSION=2025-08-01-preview

# Optional (used when creating knowledge agents in this app)
NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT=https://<your-openai>.openai.azure.com
AZURE_OPENAI_API_KEY=<openai-key>
```
Notes:
* Only endpoints may be exposed with `NEXT_PUBLIC_`. Never expose keys.
* If OpenAI vars are omitted you can still manage sources; model features will be limited.

### 4. Quick Start
```bash
cp .env.example .env.local  # fill in values
npm install                 # or pnpm install / yarn
npm run dev                 # http://localhost:3000
```
Then:
1. Add knowledge sources.
2. Create an agent (select sources + model).
3. Open Playground → ask a question → inspect citations.

### 5. Production Build
```bash
npm run build
npm start
```
Outputs to `.next` with dynamic routes for retrieval APIs.

### 6. Deployment (Outline)
You can deploy to Azure (App Service, Static Web Apps + API, or Container Apps) or Vercel. Ensure env vars are set in the hosting platform and never commit secrets. A container-based deployment only needs: `npm ci && npm run build` then `npm start`.

### 7. Security & Privacy
* No secrets are hardcoded; all keys must come from env vars.
* Avoid putting PII in logs (currently only minimal console logging).
* Remove any unused demo data before production.

### 8. Troubleshooting
| Issue | Fix |
|-------|-----|
| Build shows `DYNAMIC_SERVER_USAGE` warnings | Occurs during prerender when live Search calls run; set `export const dynamic = 'force-dynamic'` on pages needing server evaluation or convert to client fetch on mount. |
| `403` / `401` from Search APIs | Verify `AZURE_SEARCH_API_KEY` and allowed network rules. |
| No agents returned | Ensure API version matches existing service preview features. |
| Chat not responding | Open dev tools, check `/api/agents/[id]/retrieve` response. |

### 9. Housekeeping
* Keep `.env.local` out of source control.
* Run `npm audit --production` periodically (currently: 0 vulnerabilities).
* Remove placeholder / unused assets as desired.

---
Minimal by design. Extend with auth, analytics, caching, or infra-as-code as your next step.
