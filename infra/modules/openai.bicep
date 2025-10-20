// Azure OpenAI Service with model deployments
@description('Name of the Azure OpenAI service')
param openAIName string

@description('Location for the OpenAI service')
param location string = resourceGroup().location

@description('SKU for the OpenAI service')
@allowed([
  'S0'
])
param sku string = 'S0'

@description('Tags for the OpenAI service')
param tags object = {}

@description('Embedding model deployment name')
param embeddingDeploymentName string = 'text-embedding-3-small'

@description('Embedding model name')
param embeddingModelName string = 'text-embedding-3-small'

@description('Embedding model version')
param embeddingModelVersion string = '1'

@description('Embedding model capacity (TPM in thousands) - safe default for new subscriptions')
param embeddingCapacity int = 20

@description('Chat model deployment name')
param chatDeploymentName string = 'gpt-4o-mini'

@description('Chat model name')
param chatModelName string = 'gpt-4o-mini'

@description('Chat model version')
param chatModelVersion string = '2024-07-18'

@description('Chat model capacity (TPM in thousands) - safe default for new subscriptions')
param chatCapacity int = 30

resource openAI 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: openAIName
  location: location
  tags: tags
  kind: 'OpenAI'
  sku: {
    name: sku
  }
  properties: {
    customSubDomainName: openAIName
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
    }
  }
}

// Deploy embedding model
resource embeddingDeployment 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = {
  parent: openAI
  name: embeddingDeploymentName
  sku: {
    name: 'Standard'
    capacity: embeddingCapacity
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: embeddingModelName
      version: embeddingModelVersion
    }
  }
}

// Deploy chat model
resource chatDeployment 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = {
  parent: openAI
  name: chatDeploymentName
  sku: {
    name: 'Standard'
    capacity: chatCapacity
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: chatModelName
      version: chatModelVersion
    }
  }
  dependsOn: [
    embeddingDeployment
  ]
}

// Output OpenAI details
output openAIId string = openAI.id
output openAIName string = openAI.name
output openAIEndpoint string = openAI.properties.endpoint
output openAIKey string = openAI.listKeys().key1
output embeddingDeploymentName string = embeddingDeployment.name
output chatDeploymentName string = chatDeployment.name
