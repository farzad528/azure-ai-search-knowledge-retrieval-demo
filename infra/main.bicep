// Main deployment template for Azure AI Search Knowledge Retrieval Demo
targetScope = 'resourceGroup'

@description('Base name for all resources (will be used to generate unique names)')
@minLength(3)
@maxLength(10)
param baseName string = 'aikb'

@description('Location for all resources')
param location string = resourceGroup().location

@description('Environment name (dev, staging, prod)')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environment string = 'dev'

@description('GitHub repository URL for Static Web App')
param repositoryUrl string = 'https://github.com/farzad528/azure-ai-search-knowledge-retrieval-demo'

@description('GitHub repository branch')
param branch string = 'main'

@description('GitHub repository token for Static Web App deployment')
@secure()
param repositoryToken string = ''

@description('Deploy sample data (hotels index and Responsible AI PDF)')
param deploySampleData bool = true

// SKU selections based on environment
var skuMap = {
  dev: {
    search: 'basic'
    openai: 'S0'
    storage: 'Standard_LRS'
    staticWebApp: 'Free'
  }
  staging: {
    search: 'standard'
    openai: 'S0'
    storage: 'Standard_LRS'
    staticWebApp: 'Standard'
  }
  prod: {
    search: 'standard'
    openai: 'S0'
    storage: 'Standard_GRS'
    staticWebApp: 'Standard'
  }
}

// Generate unique suffix
var uniqueSuffix = uniqueString(resourceGroup().id)

// Resource naming
var resourceNames = {
  search: '${baseName}-search-${uniqueSuffix}'
  openai: '${baseName}-openai-${uniqueSuffix}'
  storage: toLower('${baseName}storage${uniqueSuffix}')
  hub: '${baseName}-hub-${uniqueSuffix}'
  project: '${baseName}-project-${uniqueSuffix}'
  staticWebApp: '${baseName}-web-${uniqueSuffix}'
}

// Tags for all resources
var tags = {
  environment: environment
  solution: 'Azure AI Search Knowledge Retrieval'
  managedBy: 'Bicep'
}

// Deploy Azure AI Search
module search 'modules/search.bicep' = {
  name: 'deploy-search'
  params: {
    searchServiceName: resourceNames.search
    location: location
    sku: skuMap[environment].search
    tags: tags
  }
}

// Deploy Azure OpenAI with models
module openai 'modules/openai.bicep' = {
  name: 'deploy-openai'
  params: {
    openAIName: resourceNames.openai
    location: location
    sku: skuMap[environment].openai
    tags: tags
    embeddingDeploymentName: 'text-embedding-3-large'
    embeddingModelName: 'text-embedding-3-large'
    embeddingModelVersion: '1'
    embeddingCapacity: 120
    chatDeploymentName: 'gpt-4o'
    chatModelName: 'gpt-4o'
    chatModelVersion: '2024-08-06'
    chatCapacity: 50
  }
}

// Deploy Storage Account
module storage 'modules/storage.bicep' = {
  name: 'deploy-storage'
  params: {
    storageAccountName: resourceNames.storage
    location: location
    sku: skuMap[environment].storage
    tags: tags
    sampleDataContainerName: 'sample-documents'
  }
}

// Deploy AI Foundry Hub and Project
module foundry 'modules/foundry.bicep' = {
  name: 'deploy-foundry'
  params: {
    hubName: resourceNames.hub
    projectName: resourceNames.project
    location: location
    tags: tags
    openAIResourceId: openai.outputs.openAIId
    searchResourceId: search.outputs.searchServiceId
    storageAccountId: storage.outputs.storageAccountId
  }
}

// Deploy Static Web App
module staticWebApp 'modules/staticwebapp.bicep' = {
  name: 'deploy-staticwebapp'
  params: {
    staticWebAppName: resourceNames.staticWebApp
    location: location
    sku: skuMap[environment].staticWebApp
    tags: tags
    repositoryUrl: repositoryUrl
    branch: branch
    repositoryToken: repositoryToken
  }
}

// Role assignments for Managed Identity
// Note: Role assignments commented out as they require outputs that aren't available at compile time
// They can be added post-deployment via a script or manually in the portal
// See scripts/configure-rbac.sh for automated role assignment setup

// Outputs for application configuration
output resourceGroupName string = resourceGroup().name
output location string = location

// Search outputs
output searchEndpoint string = search.outputs.searchEndpoint
output searchServiceName string = search.outputs.searchServiceName
output searchAdminKey string = search.outputs.searchAdminKey

// OpenAI outputs
output openAIEndpoint string = openai.outputs.openAIEndpoint
output openAIKey string = openai.outputs.openAIKey
output embeddingDeploymentName string = openai.outputs.embeddingDeploymentName
output chatDeploymentName string = openai.outputs.chatDeploymentName

// Storage outputs
output storageAccountName string = storage.outputs.storageAccountName
output storageConnectionString string = storage.outputs.storageConnectionString
output sampleDataContainerName string = storage.outputs.sampleDataContainerName

// Foundry outputs
output foundryProjectEndpoint string = foundry.outputs.projectEndpoint
output foundryProjectName string = foundry.outputs.projectName
output foundryHubName string = foundry.outputs.hubName

// Static Web App outputs
output staticWebAppUrl string = staticWebApp.outputs.staticWebAppUrl
output staticWebAppName string = staticWebApp.outputs.staticWebAppName

// Environment variables for Static Web App
output environmentVariables object = {
  AZURE_SEARCH_ENDPOINT: search.outputs.searchEndpoint
  AZURE_SEARCH_API_KEY: search.outputs.searchAdminKey
  AZURE_SEARCH_API_VERSION: '2025-08-01-preview'
  NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT: openai.outputs.openAIEndpoint
  AZURE_OPENAI_API_KEY: openai.outputs.openAIKey
  FOUNDRY_PROJECT_ENDPOINT: foundry.outputs.projectEndpoint
  FOUNDRY_API_VERSION: '2025-05-01'
  AZURE_AUTH_METHOD: 'managed-identity'
  NEXT_PUBLIC_SEARCH_ENDPOINT: search.outputs.searchEndpoint
}

// Deployment summary
output deploymentSummary object = {
  message: 'Deployment completed successfully!'
  nextSteps: [
    '1. Visit your Static Web App at: ${staticWebApp.outputs.staticWebAppUrl}'
    '2. Configure GitHub Actions for automated deployments'
    '3. Upload sample data using the provided script'
    '4. Create your first knowledge base in the app'
  ]
  estimatedMonthlyCost: environment == 'dev' ? '$100-150' : environment == 'staging' ? '$250-350' : '$500+'
  resources: {
    search: resourceNames.search
    openai: resourceNames.openai
    storage: resourceNames.storage
    foundry: '${resourceNames.hub} / ${resourceNames.project}'
    staticWebApp: resourceNames.staticWebApp
  }
}
