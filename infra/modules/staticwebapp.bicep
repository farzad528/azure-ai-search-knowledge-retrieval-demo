// Azure Static Web App for Next.js hosting
@description('Name of the static web app')
param staticWebAppName string

@description('Location for the static web app')
param location string = resourceGroup().location

@description('SKU for the static web app')
@allowed([
  'Free'
  'Standard'
])
param sku string = 'Free'

@description('Tags for the static web app')
param tags object = {}

@description('Repository URL')
param repositoryUrl string = ''

@description('Branch name')
param branch string = 'main'

@description('Repository token (optional)')
@secure()
param repositoryToken string = ''

@description('Build properties')
param buildProperties object = {
  appLocation: '/'
  apiLocation: ''
  outputLocation: '.next'
  appBuildCommand: 'npm run build'
  apiBuildCommand: ''
}

resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: staticWebAppName
  location: location
  tags: tags
  sku: {
    name: sku
    tier: sku
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    repositoryUrl: repositoryUrl
    branch: branch
    repositoryToken: repositoryToken
    buildProperties: buildProperties
    provider: 'GitHub'
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    enterpriseGradeCdnStatus: 'Disabled'
  }
}

// Output Static Web App details
output staticWebAppId string = staticWebApp.id
output staticWebAppName string = staticWebApp.name
output staticWebAppUrl string = 'https://${staticWebApp.properties.defaultHostname}'
output staticWebAppPrincipalId string = staticWebApp.identity.principalId
