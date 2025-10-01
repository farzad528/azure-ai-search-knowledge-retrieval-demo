# Authentication Setup Guide

This guide explains how to configure authentication for the Azure AI Foundry APIs with automatic token refresh.

## Overview

The application supports three authentication methods:
1. **Manual Bearer Token** (for development/testing)
2. **Service Principal** (recommended for production)
3. **Managed Identity** (for Azure deployments)

## Authentication Methods

### Option 1: Manual Bearer Token (Development Only)

This is the simplest method but tokens expire every ~1 hour and must be manually refreshed.

```bash
# Generate a bearer token using Azure CLI
az account get-access-token --resource https://ai.azure.com --query accessToken -o tsv
```

Add to your `.env` file:
```env
FOUNDRY_BEARER_TOKEN=<your-bearer-token>
```

⚠️ **Note**: This token will expire and needs manual refresh. Not recommended for production.

### Option 2: Service Principal (Recommended)

Service principals provide automatic token refresh and are ideal for production deployments.

#### Step 1: Create a Service Principal

```bash
# Create a service principal with appropriate permissions
az ad sp create-for-rbac \
  --name "your-app-name" \
  --role "Contributor" \
  --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group}
```

This will output:
```json
{
  "appId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "displayName": "your-app-name",
  "password": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenant": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

#### Step 2: Grant Permissions to AI Foundry Resources

```bash
# Assign the service principal access to your AI Foundry project
az role assignment create \
  --assignee {appId} \
  --role "Contributor" \
  --scope /subscriptions/{subscription-id}/resourceGroups/{resource-group}/providers/Microsoft.MachineLearningServices/workspaces/{workspace-name}
```

#### Step 3: Configure Environment Variables

Add to your `.env` file:
```env
AZURE_AUTH_METHOD=service-principal
AZURE_TENANT_ID=<tenant-from-output>
AZURE_CLIENT_ID=<appId-from-output>
AZURE_CLIENT_SECRET=<password-from-output>
```

### Option 3: Managed Identity (Azure Deployments)

When deploying to Azure App Service, Container Instances, or other Azure services, you can use Managed Identity for passwordless authentication.

#### Step 1: Enable Managed Identity

For Azure App Service:
```bash
az webapp identity assign --name <app-name> --resource-group <resource-group>
```

#### Step 2: Grant Permissions

```bash
# Get the principal ID
PRINCIPAL_ID=$(az webapp identity show --name <app-name> --resource-group <resource-group> --query principalId -o tsv)

# Grant access to AI Foundry
az role assignment create \
  --assignee $PRINCIPAL_ID \
  --role "Contributor" \
  --scope /subscriptions/{subscription-id}/resourceGroups/{resource-group}/providers/Microsoft.MachineLearningServices/workspaces/{workspace-name}
```

#### Step 3: Configure Environment Variables

Add to your App Service configuration:
```env
AZURE_AUTH_METHOD=managed-identity
# Optional: Only needed if using user-assigned identity
# AZURE_MANAGED_IDENTITY_CLIENT_ID=<client-id>
```

## Token Auto-Refresh Behavior

The application automatically handles token refresh:

1. **Token Caching**: Tokens are cached in memory to avoid unnecessary API calls
2. **Proactive Refresh**: Tokens are refreshed 5 minutes before expiry
3. **Fallback**: If refresh fails, the last known token is used as fallback
4. **Multiple Auth Methods**: Automatically tries different auth methods based on configuration

## Deployment Configurations

### Local Development

```env
# Use service principal for consistent development
AZURE_AUTH_METHOD=service-principal
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
```

### Azure App Service

```env
# Use managed identity for passwordless auth
AZURE_AUTH_METHOD=managed-identity
```

### Docker Container

```env
# Use service principal with secrets mounted
AZURE_AUTH_METHOD=service-principal
AZURE_TENANT_ID=${AZURE_TENANT_ID}
AZURE_CLIENT_ID=${AZURE_CLIENT_ID}
AZURE_CLIENT_SECRET=${AZURE_CLIENT_SECRET}
```

### Vercel/Netlify

```env
# Use service principal configured in platform settings
AZURE_AUTH_METHOD=service-principal
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
```

## Troubleshooting

### Token Expired Errors

If you see "401 Unauthorized" errors:
1. Check if your service principal credentials are correct
2. Verify the service principal has proper permissions
3. For manual tokens, regenerate using `az account get-access-token`

### Permission Errors

If you see "403 Forbidden" errors:
1. Verify the service principal/managed identity has Contributor role
2. Check the scope includes your AI Foundry workspace
3. Ensure the resource endpoints are correct

### Debugging

Enable debug logging by checking the console output:
- "Using Service Principal authentication" - Service principal is configured
- "Using Managed Identity authentication" - Managed identity is configured
- "Token refreshed, expires at..." - Successful token refresh
- "Using cached token" - Token is still valid

## Security Best Practices

1. **Never commit credentials** to source control
2. **Use environment variables** for all sensitive configuration
3. **Rotate service principal secrets** regularly
4. **Use Managed Identity** when deploying to Azure
5. **Implement least privilege** - only grant necessary permissions
6. **Monitor access logs** in Azure Portal

## Additional Resources

- [Azure Service Principal Documentation](https://docs.microsoft.com/azure/active-directory/develop/app-objects-and-service-principals)
- [Managed Identity Overview](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview)
- [Azure AI Foundry Authentication](https://learn.microsoft.com/azure/ai-services/authentication)