#!/bin/bash

# Configure RBAC permissions for deployed resources
# This script should be run after the main Bicep deployment completes

set -e

echo "======================================"
echo "Configure RBAC Permissions"
echo "======================================"
echo ""

# Check if required parameters are provided
if [ -z "$RESOURCE_GROUP" ] || [ -z "$DEPLOYMENT_NAME" ]; then
    echo "Error: Required environment variables not set."
    echo ""
    echo "Usage: Set the following environment variables before running:"
    echo "  export RESOURCE_GROUP='your-resource-group'"
    echo "  export DEPLOYMENT_NAME='your-deployment-name'"
    echo ""
    exit 1
fi

echo "Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Deployment: $DEPLOYMENT_NAME"
echo ""

# Get deployment outputs
echo "[1/3] Retrieving deployment outputs..."
STATIC_WEB_APP_NAME=$(az deployment group show -g "$RESOURCE_GROUP" -n "$DEPLOYMENT_NAME" --query properties.outputs.staticWebAppName.value -o tsv)
SEARCH_SERVICE_NAME=$(az deployment group show -g "$RESOURCE_GROUP" -n "$DEPLOYMENT_NAME" --query properties.outputs.searchServiceName.value -o tsv)
OPENAI_NAME=$(az deployment group show -g "$RESOURCE_GROUP" -n "$DEPLOYMENT_NAME" --query properties.outputs.openAIName.value -o tsv 2>/dev/null || echo "")
STORAGE_ACCOUNT_NAME=$(az deployment group show -g "$RESOURCE_GROUP" -n "$DEPLOYMENT_NAME" --query properties.outputs.storageAccountName.value -o tsv)
FOUNDRY_PROJECT_NAME=$(az deployment group show -g "$RESOURCE_GROUP" -n "$DEPLOYMENT_NAME" --query properties.outputs.foundryProjectName.value -o tsv 2>/dev/null || echo "")

# Get principal IDs
STATIC_WEB_APP_PRINCIPAL=$(az staticwebapp show -n "$STATIC_WEB_APP_NAME" -g "$RESOURCE_GROUP" --query identity.principalId -o tsv)

if [ -n "$FOUNDRY_PROJECT_NAME" ]; then
    FOUNDRY_PRINCIPAL=$(az ml workspace show -n "$FOUNDRY_PROJECT_NAME" -g "$RESOURCE_GROUP" --query identity.principalId -o tsv 2>/dev/null || echo "")
fi

echo "✓ Retrieved resource information"

# Role GUIDs
COGNITIVE_SERVICES_USER="a97b65f3-24c7-4388-baec-2e87135dc908"
SEARCH_INDEX_DATA_CONTRIBUTOR="8ebe5a00-799e-43f5-93ac-243d3dce84a7"
STORAGE_BLOB_DATA_CONTRIBUTOR="ba92f5b4-2d11-453d-a403-e96b0029c9fe"

# [2/3] Assign roles to Static Web App
echo ""
echo "[2/3] Assigning roles to Static Web App..."

# Static Web App -> OpenAI
if [ -n "$OPENAI_NAME" ]; then
    echo "  - Cognitive Services User on OpenAI..."
    az role assignment create \
        --assignee "$STATIC_WEB_APP_PRINCIPAL" \
        --role "$COGNITIVE_SERVICES_USER" \
        --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.CognitiveServices/accounts/$OPENAI_NAME" \
        --output none 2>/dev/null || echo "    (already exists)"
fi

# Static Web App -> Search
echo "  - Search Index Data Contributor on Search..."
az role assignment create \
    --assignee "$STATIC_WEB_APP_PRINCIPAL" \
    --role "$SEARCH_INDEX_DATA_CONTRIBUTOR" \
    --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Search/searchServices/$SEARCH_SERVICE_NAME" \
    --output none 2>/dev/null || echo "    (already exists)"

# Static Web App -> Storage
echo "  - Storage Blob Data Contributor on Storage..."
az role assignment create \
    --assignee "$STATIC_WEB_APP_PRINCIPAL" \
    --role "$STORAGE_BLOB_DATA_CONTRIBUTOR" \
    --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/$STORAGE_ACCOUNT_NAME" \
    --output none 2>/dev/null || echo "    (already exists)"

echo "✓ Static Web App permissions configured"

# [3/3] Assign roles to Foundry Project (if exists)
if [ -n "$FOUNDRY_PRINCIPAL" ] && [ "$FOUNDRY_PRINCIPAL" != "null" ]; then
    echo ""
    echo "[3/3] Assigning roles to Foundry Project..."

    # Foundry -> OpenAI
    if [ -n "$OPENAI_NAME" ]; then
        echo "  - Cognitive Services User on OpenAI..."
        az role assignment create \
            --assignee "$FOUNDRY_PRINCIPAL" \
            --role "$COGNITIVE_SERVICES_USER" \
            --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.CognitiveServices/accounts/$OPENAI_NAME" \
            --output none 2>/dev/null || echo "    (already exists)"
    fi

    # Foundry -> Search
    echo "  - Search Index Data Contributor on Search..."
    az role assignment create \
        --assignee "$FOUNDRY_PRINCIPAL" \
        --role "$SEARCH_INDEX_DATA_CONTRIBUTOR" \
        --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Search/searchServices/$SEARCH_SERVICE_NAME" \
        --output none 2>/dev/null || echo "    (already exists)"

    echo "✓ Foundry Project permissions configured"
else
    echo ""
    echo "[3/3] Skipping Foundry permissions (not deployed or no identity)"
fi

echo ""
echo "======================================"
echo "✓ RBAC Configuration Complete!"
echo "======================================"
echo ""
echo "Permissions granted:"
echo "  ✓ Static Web App can access OpenAI, Search, and Storage"
if [ -n "$FOUNDRY_PRINCIPAL" ] && [ "$FOUNDRY_PRINCIPAL" != "null" ]; then
    echo "  ✓ Foundry Project can access OpenAI and Search"
fi
echo ""
