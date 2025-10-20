# Vercel Deployment Guide

This guide walks you through deploying the Azure AI Search Knowledge Retrieval Demo to Vercel with automatic bearer token authentication for Azure AI Agent Service.

## Overview

When deployed to Vercel, your app will:
- ✅ Automatically authenticate with Azure AI Agent Service using Service Principal
- ✅ Handle bearer token refresh transparently in the backend
- ✅ Allow customers to query agents without any authentication prompts
- ✅ Keep all secrets secure server-side (never exposed to client)

## Prerequisites

- Azure subscription with access to Azure AI Agent Service
- Azure CLI installed (`az --version` to verify)
- Vercel account (free tier works)
- Vercel CLI installed: `npm i -g vercel`

---

## Step 1: Create Azure Service Principal

The Service Principal will authenticate your Vercel app to Azure AI Agent Service.

```bash
# 1. Login to Azure
az login

# 2. Set your subscription (replace with your subscription ID)
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# 3. Get your subscription ID (copy this for next step)
az account show --query id -o tsv

# 4. Get your resource group name
az group list --query "[].name" -o table

# 5. Create Service Principal with appropriate role
az ad sp create-for-rbac \
  --name "vercel-ai-agent-demo" \
  --role "Cognitive Services User" \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/YOUR_RESOURCE_GROUP
```

**Important**: Save the JSON output! You'll need these values:
- `appId` → This is your `AZURE_CLIENT_ID`
- `password` → This is your `AZURE_CLIENT_SECRET`
- `tenant` → This is your `AZURE_TENANT_ID`

**Example output:**
```json
{
  "appId": "12345678-1234-1234-1234-123456789abc",
  "displayName": "vercel-ai-agent-demo",
  "password": "abcdef123456~RANDOM_SECRET",
  "tenant": "87654321-4321-4321-4321-cba987654321"
}
```

---

## Step 2: Gather Azure Resource Information

You'll need these values from your Azure resources:

### Azure AI Search
```bash
# Get Search endpoint
az search service show --name YOUR_SEARCH_SERVICE --resource-group YOUR_RESOURCE_GROUP --query "hostName" -o tsv

# Get Search API key
az search admin-key show --resource-group YOUR_RESOURCE_GROUP --service-name YOUR_SEARCH_SERVICE --query "primaryKey" -o tsv
```

### Azure OpenAI
```bash
# Get OpenAI endpoint
az cognitiveservices account show --name YOUR_OPENAI_RESOURCE --resource-group YOUR_RESOURCE_GROUP --query "properties.endpoint" -o tsv

# Get OpenAI API key
az cognitiveservices account keys list --name YOUR_OPENAI_RESOURCE --resource-group YOUR_RESOURCE_GROUP --query "key1" -o tsv
```

### Foundry Project Endpoint
Find this in Azure AI Foundry Studio:
1. Navigate to https://ai.azure.com
2. Select your project
3. Go to **Settings** → **Project properties**
4. Copy the **Project API endpoint** (format: `https://YOUR-RESOURCE.services.ai.azure.com/api/projects/YOUR-PROJECT`)

---

## Step 3: Configure Vercel Environment Variables

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com
2. Navigate to your project → **Settings** → **Environment Variables**
3. Add the following variables (for **Production**, **Preview**, and **Development**):

| Variable Name | Value | Example |
|--------------|-------|---------|
| `AZURE_AUTH_METHOD` | `service-principal` | `service-principal` |
| `AZURE_TENANT_ID` | From Service Principal output | `87654321-4321-4321-4321-cba987654321` |
| `AZURE_CLIENT_ID` | From Service Principal output (appId) | `12345678-1234-1234-1234-123456789abc` |
| `AZURE_CLIENT_SECRET` | From Service Principal output (password) | `abcdef123456~RANDOM_SECRET` |
| `FOUNDRY_PROJECT_ENDPOINT` | Your Foundry project endpoint | `https://eastus.services.ai.azure.com/api/projects/my-project` |
| `FOUNDRY_API_VERSION` | `2025-05-01` | `2025-05-01` |
| `AZURE_SEARCH_ENDPOINT` | Your Search service endpoint | `https://my-search.search.windows.net` |
| `AZURE_SEARCH_API_KEY` | Your Search API key | `ABC123...` |
| `AZURE_SEARCH_API_VERSION` | `2025-11-01-preview` | `2025-11-01-preview` |
| `NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT` | Your OpenAI endpoint | `https://my-openai.openai.azure.com` |
| `AZURE_OPENAI_API_KEY` | Your OpenAI API key | `DEF456...` |
| `NEXT_PUBLIC_STANDALONE_AOAI_ENDPOINT` | (Optional) Standalone OpenAI endpoint | `https://my-standalone.openai.azure.com` |
| `NEXT_PUBLIC_STANDALONE_AOAI_KEY` | (Optional) Standalone OpenAI key | `GHI789...` |
| `NEXT_PUBLIC_SEARCH_ENDPOINT` | Same as `AZURE_SEARCH_ENDPOINT` | `https://my-search.search.windows.net` |

**Important Notes:**
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser (endpoints only)
- Never add `NEXT_PUBLIC_` to secrets like API keys or the Service Principal credentials
- Set variables for all environments (Production, Preview, Development) or select "All" when adding

### Option B: Via Vercel CLI

Create a `.env.production` file locally (DO NOT COMMIT):

```bash
# Copy the example
cp .env.example .env.production

# Edit with your real values
nano .env.production
```

Then push to Vercel:
```bash
vercel env pull  # Optional: pull existing vars
vercel env add AZURE_TENANT_ID production
# Repeat for each variable
```

---

## Step 4: Deploy to Vercel

### First-time Deployment

```bash
# 1. Install Vercel CLI if you haven't
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Link your project (run in project root)
vercel link

# 4. Deploy to production
vercel --prod
```

### Subsequent Deployments

```bash
# Deploy to production
vercel --prod

# Or deploy via Git (recommended)
git add .
git commit -m "Deploy to Vercel"
git push origin main  # Vercel will auto-deploy from GitHub
```

### GitHub Integration (Recommended)

1. Push your code to GitHub
2. In Vercel dashboard: **Add New** → **Project**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click **Deploy**

**Auto-deployment**: Vercel will automatically deploy when you push to your main branch.

---

## Step 5: Verify Deployment

### Check Build Logs

1. Go to Vercel dashboard → Your project → **Deployments**
2. Click on the latest deployment
3. Review **Build Logs** for any errors
4. Check **Function Logs** for runtime errors

### Test Authentication

```bash
# Replace YOUR_APP_URL with your Vercel deployment URL
curl https://YOUR_APP_URL.vercel.app/api/foundry/assistants \
  -H "Content-Type: application/json"
```

**Expected response**: JSON list of assistants (or empty array if none exist)

**Error response** (if authentication fails):
```json
{
  "error": "Invalid bearer token...",
  "status": 401
}
```

### Test in Browser

1. Navigate to `https://YOUR_APP_URL.vercel.app`
2. Go to the **Agent Builder** or **Playground** page
3. Create or select an agent
4. Send a query
5. Verify you receive a response without any authentication prompts

---

## Step 6: Test Customer Flow

Open an incognito/private browser window and:

1. Navigate to your Vercel URL: `https://YOUR_APP_URL.vercel.app`
2. No authentication prompt should appear
3. Navigate to an agent playground
4. Send a query like "What is in the knowledge base?"
5. Verify you get a response

**Success!** 🎉 Your app is now deployed with transparent backend authentication.

---

## Troubleshooting

### Error: "Invalid bearer token"

**Cause**: Service Principal doesn't have correct permissions

**Solution**:
```bash
# Grant the Service Principal access to your AI resource
az role assignment create \
  --assignee YOUR_CLIENT_ID \
  --role "Cognitive Services User" \
  --scope /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/YOUR_RESOURCE_GROUP/providers/Microsoft.CognitiveServices/accounts/YOUR_AI_RESOURCE
```

### Error: "Missing Foundry configuration"

**Cause**: Environment variables not set correctly in Vercel

**Solution**:
1. Check Vercel dashboard → Settings → Environment Variables
2. Ensure `FOUNDRY_PROJECT_ENDPOINT` is set
3. Redeploy: `vercel --prod`

### Error: "Failed to get Azure AD token"

**Cause**: Service Principal credentials are incorrect

**Solution**:
1. Verify `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` in Vercel
2. Recreate Service Principal if needed
3. Update Vercel environment variables
4. Redeploy

### Token refresh issues

**Symptom**: App works initially but fails after ~1 hour

**Cause**: Token manager not refreshing properly

**Solution**: Check Function Logs in Vercel for errors. The token manager should auto-refresh tokens 5 minutes before expiry.

### Build fails

**Common causes**:
- Missing dependencies: Run `npm install` locally first
- TypeScript errors: Run `npm run build` locally to identify issues
- Environment variables: Ensure all required variables are set in Vercel

---

## Security Best Practices

✅ **Do:**
- Use Service Principal for production
- Set Service Principal with minimum required permissions
- Rotate `AZURE_CLIENT_SECRET` periodically
- Monitor Vercel Function Logs for suspicious activity
- Use Vercel's environment variable encryption (automatic)

❌ **Don't:**
- Commit `.env.local` or `.env.production` to Git
- Use `NEXT_PUBLIC_` prefix for secrets
- Share Service Principal credentials
- Use manual bearer tokens in production (they expire)
- Store tokens in localStorage/sessionStorage on client

---

## Monitoring & Maintenance

### Check Token Refresh Logs

In Vercel dashboard → Your project → **Logs** (Runtime Logs):

Look for:
```
Using cached token
Fetching new token from Azure AD...
Token refreshed, expires at 2025-10-08T10:30:00Z
```

### Update Service Principal Credentials

If you need to rotate credentials:

```bash
# Reset Service Principal password
az ad sp credential reset --id YOUR_CLIENT_ID

# Update Vercel environment variables with new password
# Redeploy
vercel --prod
```

---

## Cost Considerations

- **Vercel**: Free tier includes 100GB bandwidth, sufficient for most demos
- **Azure AI Services**: Pay-per-use based on API calls
- **Service Principal**: No additional cost

---

## Next Steps

- Set up custom domain in Vercel
- Enable Vercel Analytics for usage tracking
- Configure CORS if needed for external integrations
- Set up monitoring alerts in Azure

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Azure AI Foundry**: https://ai.azure.com/docs
- **Issues**: Report bugs at your GitHub repository

---

## Summary

Your app is now deployed to Vercel with:
- ✅ Automatic Service Principal authentication
- ✅ Bearer token auto-refresh every hour
- ✅ No authentication prompts for end users
- ✅ All secrets secured server-side
- ✅ Production-ready deployment

Customers can now visit your Vercel URL and query agents without any authentication! 🚀
