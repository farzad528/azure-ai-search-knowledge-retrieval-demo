# Configure environment variables for Azure Static Web App
# This script adds all required environment variables to your Static Web App

param(
    [Parameter(Mandatory=$false)]
    [string]$AppName = "foundry-knowledge-demo-swa",
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "fsunavala-rg-foundry-knowledge"
)

Write-Host "🔧 Configuring environment variables for Static Web App..." -ForegroundColor Cyan

# Read from .env.azure-swa file
$envFile = Get-Content ".env.azure-swa" | Where-Object { $_ -notmatch '^#' -and $_ -match '=' }

$settings = @{}
foreach ($line in $envFile) {
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        if ($key -and $value) {
            $settings[$key] = $value
        }
    }
}

Write-Host "`n📋 Found $($settings.Count) environment variables" -ForegroundColor Yellow

# Create settings string for Azure CLI
$settingsArray = @()
foreach ($key in $settings.Keys) {
    $settingsArray += "$key=$($settings[$key])"
}

# Apply settings
Write-Host "`n🚀 Applying settings to Static Web App..." -ForegroundColor Yellow

foreach ($setting in $settingsArray) {
    $key = $setting.Split('=')[0]
    Write-Host "  - Setting $key" -ForegroundColor Gray
}

$settingsJson = $settings | ConvertTo-Json -Compress

# Note: Azure CLI doesn't have a direct command to set app settings for Static Web Apps
# We need to use the REST API or do it manually in the portal

Write-Host "`n⚠️ Azure CLI doesn't support setting Static Web App settings directly" -ForegroundColor Yellow
Write-Host "Please add these variables manually in Azure Portal:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Azure Portal → Static Web App → Configuration → Application settings" -ForegroundColor Cyan
Write-Host ""

foreach ($key in $settings.Keys | Sort-Object) {
    Write-Host "$key=$($settings[$key])" -ForegroundColor White
}

Write-Host "`n💡 Tip: Copy each line above and add it in the portal" -ForegroundColor Cyan
Write-Host "Or use the Azure Portal UI to add them one by one" -ForegroundColor Cyan
