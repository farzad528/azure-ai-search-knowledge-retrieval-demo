# Quick Start: Deploy to Vercel in 5 Minutes

## Prerequisites
- Azure subscription
- Azure CLI installed
- Vercel account

## Step 1: Create Service Principal (2 min)

```bash
az login
az account set --subscription "YOUR_SUBSCRIPTION_ID"

az ad sp create-for-rbac \
  --name "vercel-ai-agent-demo" \
  --role "Cognitive Services User" \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/YOUR_RESOURCE_GROUP
```

**Save the output:**
- `appId` = `AZURE_CLIENT_ID`
- `password` = `AZURE_CLIENT_SECRET`
- `tenant` = `AZURE_TENANT_ID`

## Step 2: Deploy to Vercel (1 min)

### Option A: Via GitHub (Recommended)
1. Push code to GitHub
2. Visit https://vercel.com → **New Project**
3. Import your repository
4. Click **Deploy** (don't add env vars yet)

### Option B: Via CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

## Step 3: Add Environment Variables (2 min)

In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**, add:

**Required:**
```
AZURE_AUTH_METHOD=service-principal
AZURE_TENANT_ID=<from step 1>
AZURE_CLIENT_ID=<from step 1>
AZURE_CLIENT_SECRET=<from step 1>
FOUNDRY_PROJECT_ENDPOINT=https://YOUR-RESOURCE.services.ai.azure.com/api/projects/YOUR-PROJECT
FOUNDRY_API_VERSION=2025-05-01
AZURE_SEARCH_ENDPOINT=https://YOUR-SEARCH.search.windows.net
AZURE_SEARCH_API_KEY=<your-search-key>
AZURE_SEARCH_API_VERSION=2025-08-01-preview
NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT=https://YOUR-OPENAI.openai.azure.com
AZURE_OPENAI_API_KEY=<your-openai-key>
NEXT_PUBLIC_SEARCH_ENDPOINT=https://YOUR-SEARCH.search.windows.net
```

**Optional:**
```
NEXT_PUBLIC_STANDALONE_AOAI_ENDPOINT=<your-standalone-openai-endpoint>
NEXT_PUBLIC_STANDALONE_AOAI_KEY=<your-standalone-key>
```

Select **All Environments** for each variable.

## Step 4: Redeploy

Click **Redeploy** in Vercel dashboard or:
```bash
vercel --prod
```

## Step 5: Test

Visit `https://your-app.vercel.app` and verify:
- ✅ No authentication prompt
- ✅ Can query agents
- ✅ Receive responses

## Done! 🎉

For detailed troubleshooting and best practices, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md).

---

## Common Issues

**"Invalid bearer token"** → Check Service Principal has correct role:
```bash
az role assignment create \
  --assignee YOUR_CLIENT_ID \
  --role "Cognitive Services User" \
  --scope /subscriptions/SUB_ID/resourceGroups/RG_NAME
```

**"Missing Foundry configuration"** → Verify `FOUNDRY_PROJECT_ENDPOINT` is set in Vercel

**Build fails** → Check build logs in Vercel dashboard
