# Deploy to Azure Static Web Apps with Managed Identity

This guide will help you deploy the Knowledge Retrieval Demo to Azure Static Web Apps using Managed Identity for automatic bearer token refresh.

## Why Azure Static Web Apps?

✅ **Managed Identity** - No secrets, certificates, or expired tokens  
✅ **Automatic token refresh** - No manual intervention needed  
✅ **Free SSL/HTTPS** - Custom domain support  
✅ **Global CDN** - Fast performance worldwide  
✅ **GitHub integration** - Automatic deployments on push  

---

## Prerequisites

- Azure CLI installed and logged in: `az login`
- GitHub repository with your code
- Azure subscription access

---

## Step 1: Run the Deployment Script

Run the PowerShell deployment script:

```powershell
cd C:\Dev\azure-ai-search-knowledge-retrieval-demo-main
.\deploy-to-azure.ps1
```

This script will:
1. ✅ Create Azure Static Web App
2. ✅ Enable Managed Identity
3. ✅ Assign permissions to Azure AI Search
4. ✅ Assign permissions to AI Foundry
5. ✅ Assign permissions to Storage Account
6. ✅ Generate deployment token

**Save the deployment token** - you'll need it for GitHub!

---

## Step 2: Add Deployment Token to GitHub

1. Go to your GitHub repository: `https://github.com/farzad528/azure-ai-search-knowledge-retrieval-demo`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
5. Value: Paste the deployment token from Step 1
6. Click **Add secret**

---

## Step 3: Configure Environment Variables in Azure Portal

1. Go to **Azure Portal** → Find your Static Web App (`foundry-knowledge-demo-swa`)
2. Click **Configuration** in the left menu
3. Click **Application settings** tab
4. Add each variable from `.env.azure-swa` file:

### Required Variables:

| Name | Value |
|------|-------|
| `AZURE_SEARCH_ENDPOINT` | `https://fsunavala-canary.search.windows.net` |
| `AZURE_SEARCH_API_KEY` | Your search API key |
| `AZURE_SEARCH_API_VERSION` | `2025-11-01-preview` |
| `NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT` | `https://fsunavala-openai-swecen.openai.azure.com` |
| `AZURE_OPENAI_API_KEY` | Your OpenAI API key |
| `NEXT_PUBLIC_STANDALONE_AOAI_ENDPOINT` | `https://fsunavala-standalone.openai.azure.com` |
| `NEXT_PUBLIC_STANDALONE_AOAI_KEY` | Your standalone OpenAI key |
| `AZURE_STORAGE_ACCOUNT_NAME` | `fsunavalast` |
| `AZURE_STORAGE_ACCOUNT_KEY` | Your storage key |
| `FOUNDRY_PROJECT_ENDPOINT` | `https://fsunavala-2228-resource.services.ai.azure.com/api/projects/fsunavala-2228` |
| `FOUNDRY_API_VERSION` | `2025-05-15-preview` |
| `AZURE_AUTH_METHOD` | `managed-identity` |
| `NEXT_PUBLIC_SEARCH_ENDPOINT` | `https://fsunavala-canary.search.windows.net` |
| `NEXT_PUBLIC_AZURE_SEARCH_API_VERSION` | `2025-11-01-preview` |

Click **Save** after adding all variables.

---

## Step 4: Push to GitHub to Deploy

The GitHub Actions workflow is already set up. Just push your code:

```powershell
git add .
git commit -m "Add Azure Static Web Apps deployment"
git push origin main
```

GitHub Actions will automatically:
1. Build your Next.js app
2. Deploy to Azure Static Web Apps
3. Make it available at your custom URL

---

## Step 5: Monitor Deployment

1. Go to **GitHub** → **Actions** tab
2. Watch the deployment progress
3. Once complete, your app will be live!

Or monitor in Azure Portal:
1. Go to your Static Web App
2. Click **Environments** → **Production**
3. See deployment status and URL

---

## Step 6: Test Your Deployed App

1. Get your app URL from Azure Portal or deployment script output
2. Visit: `https://[your-swa-name].azurestaticapps.net`
3. Test the Knowledge Base playground
4. Bearer tokens will **automatically refresh** via Managed Identity! 🎉

---

## Troubleshooting

### Issue: 401 Unauthorized errors

**Solution:** Verify Managed Identity permissions:

```powershell
# Check role assignments
az role assignment list --assignee [managed-identity-principal-id] --output table
```

Make sure the Managed Identity has:
- ✅ **Cognitive Services User** on Azure AI Search
- ✅ **Cognitive Services User** on AI Foundry project
- ✅ **Storage Blob Data Reader** on Storage Account

### Issue: Environment variables not working

**Solution:** Verify in Azure Portal:
1. Static Web App → **Configuration**
2. Check all variables are set correctly
3. Click **Save** and **Restart** the app

### Issue: Build fails in GitHub Actions

**Solution:** Check build logs:
1. GitHub → **Actions** tab
2. Click the failed workflow
3. Review error messages
4. Common fixes:
   - Ensure `package.json` has correct build scripts
   - Check Node.js version compatibility
   - Verify all dependencies are listed

---

## Benefits of This Setup

🚀 **No expired tokens** - Managed Identity auto-refreshes  
🔒 **No secrets in code** - Everything managed by Azure  
🌍 **Shareable URL** - Give to anyone to demo  
⚡ **Fast performance** - Global CDN  
🔄 **Auto deployments** - Push to GitHub = automatic deploy  

---

## Next Steps

- Add custom domain (optional)
- Set up staging environments
- Configure monitoring and alerts
- Add authentication for sensitive endpoints

---

## Cost Estimate

**Azure Static Web Apps Standard SKU:**
- ~$9/month for standard tier
- Includes 100GB bandwidth
- Free SSL certificate
- Custom domains included

**Total estimated cost:** ~$9-15/month (depending on usage)

---

## Questions?

Check the [Azure Static Web Apps documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/) for more details.
