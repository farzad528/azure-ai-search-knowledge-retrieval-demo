# Deploy Next.js app to Azure Static Web Apps
# This script creates a Static Web App with Managed Identity enabled

param(
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "fsunavala-rg-foundry-knowledge",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "eastus2",
    
    [Parameter(Mandatory=$false)]
    [string]$AppName = "foundry-knowledge-demo-swa"
)

Write-Host "🚀 Deploying to Azure Static Web Apps..." -ForegroundColor Cyan

# 1. Create Static Web App (without GitHub integration - we'll add that later)
Write-Host "`n📦 Creating Static Web App: $AppName" -ForegroundColor Yellow
az staticwebapp create `
    --name $AppName `
    --resource-group $ResourceGroup `
    --location $Location `
    --sku Standard

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create Static Web App" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Static Web App created successfully!" -ForegroundColor Green

# 2. Enable Managed Identity
Write-Host "`n🔐 Enabling Managed Identity..." -ForegroundColor Yellow
$identity = az staticwebapp identity assign `
    --name $AppName `
    --resource-group $ResourceGroup `
    --output json | ConvertFrom-Json

$principalId = $identity.principalId
Write-Host "✅ Managed Identity enabled. Principal ID: $principalId" -ForegroundColor Green

# 3. Get subscription ID
$subscriptionId = az account show --query id -o tsv

# 4. Assign permissions to Azure AI Search
Write-Host "`n🔑 Assigning permissions to Azure AI Search..." -ForegroundColor Yellow
az role assignment create `
    --assignee $principalId `
    --role "Cognitive Services User" `
    --scope "/subscriptions/$subscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Search/searchServices/fsunavala-canary"

Write-Host "✅ Azure AI Search permissions assigned" -ForegroundColor Green

# 5. Assign permissions to AI Foundry Project
Write-Host "`n🔑 Assigning permissions to AI Foundry Project..." -ForegroundColor Yellow
$foundryResourceId = "/subscriptions/$subscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.MachineLearningServices/workspaces/fsunavala-2228"

az role assignment create `
    --assignee $principalId `
    --role "Cognitive Services User" `
    --scope $foundryResourceId

Write-Host "✅ AI Foundry permissions assigned" -ForegroundColor Green

# 6. Assign Storage Blob Data Reader role for blob access
Write-Host "`n🔑 Assigning permissions to Storage Account..." -ForegroundColor Yellow
az role assignment create `
    --assignee $principalId `
    --role "Storage Blob Data Reader" `
    --scope "/subscriptions/$subscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Storage/storageAccounts/fsunavalast"

Write-Host "✅ Storage permissions assigned" -ForegroundColor Green

# 7. Get deployment token
Write-Host "`n🔐 Getting deployment token..." -ForegroundColor Yellow
$deploymentToken = az staticwebapp secrets list `
    --name $AppName `
    --resource-group $ResourceGroup `
    --query "properties.apiKey" -o tsv

# 8. Show next steps
Write-Host "`n✅ Deployment setup complete!" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Add this deployment token to your GitHub repository secrets as 'AZURE_STATIC_WEB_APPS_API_TOKEN'"
Write-Host "2. Configure environment variables in Azure Portal"
Write-Host "3. Push to GitHub to trigger deployment"
Write-Host "`n🔑 Deployment Token (copy this):" -ForegroundColor Yellow
Write-Host $deploymentToken -ForegroundColor White

Write-Host "`n🌐 Your app will be available at:" -ForegroundColor Cyan
$appUrl = az staticwebapp show --name $AppName --resource-group $ResourceGroup --query "defaultHostname" -o tsv
Write-Host "https://$appUrl" -ForegroundColor White
