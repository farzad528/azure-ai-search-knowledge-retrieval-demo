#!/bin/bash

# Upload sample data to Azure Storage and create sample search index
# This script should be run after the Bicep deployment completes

set -e

echo "======================================"
echo "Azure AI Search - Sample Data Setup"
echo "======================================"
echo ""

# Check if required parameters are provided
if [ -z "$STORAGE_ACCOUNT_NAME" ] || [ -z "$STORAGE_CONTAINER_NAME" ] || [ -z "$SEARCH_ENDPOINT" ] || [ -z "$SEARCH_ADMIN_KEY" ]; then
    echo "Error: Required environment variables not set."
    echo ""
    echo "Usage: Set the following environment variables before running:"
    echo "  export STORAGE_ACCOUNT_NAME='your-storage-account'"
    echo "  export STORAGE_CONTAINER_NAME='sample-documents'"
    echo "  export SEARCH_ENDPOINT='https://your-search.search.windows.net'"
    echo "  export SEARCH_ADMIN_KEY='your-admin-key'"
    echo ""
    echo "Or pass them from Bicep outputs:"
    echo "  export STORAGE_ACCOUNT_NAME=\$(az deployment group show -g <rg> -n <deployment> --query properties.outputs.storageAccountName.value -o tsv)"
    exit 1
fi

echo "Configuration:"
echo "  Storage Account: $STORAGE_ACCOUNT_NAME"
echo "  Container: $STORAGE_CONTAINER_NAME"
echo "  Search Endpoint: $SEARCH_ENDPOINT"
echo ""

# Step 1: Download sample PDF (Microsoft Responsible AI Transparency Report)
echo "[1/4] Downloading Microsoft Responsible AI Transparency Report..."
SAMPLE_PDF_URL="https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/msc/documents/presentations/CSR/Responsible-AI-Transparency-Report-2025-vertical.pdf"
SAMPLE_PDF_NAME="Responsible-AI-Transparency-Report-2025.pdf"

mkdir -p ./sample-data
curl -L "$SAMPLE_PDF_URL" -o "./sample-data/$SAMPLE_PDF_NAME"

if [ -f "./sample-data/$SAMPLE_PDF_NAME" ]; then
    echo "✓ Downloaded: $SAMPLE_PDF_NAME"
else
    echo "✗ Failed to download PDF"
    exit 1
fi

# Step 2: Upload PDF to Azure Blob Storage
echo ""
echo "[2/4] Uploading PDF to Azure Blob Storage..."
az storage blob upload \
    --account-name "$STORAGE_ACCOUNT_NAME" \
    --container-name "$STORAGE_CONTAINER_NAME" \
    --name "$SAMPLE_PDF_NAME" \
    --file "./sample-data/$SAMPLE_PDF_NAME" \
    --auth-mode login \
    --overwrite

echo "✓ Uploaded to: $STORAGE_CONTAINER_NAME/$SAMPLE_PDF_NAME"

# Step 3: Create hotels-sample index
echo ""
echo "[3/4] Creating hotels-sample index in Azure AI Search..."

HOTELS_INDEX_SCHEMA='{
  "name": "hotels-sample",
  "fields": [
    {"name": "HotelId", "type": "Edm.String", "key": true, "searchable": false},
    {"name": "HotelName", "type": "Edm.String", "searchable": true, "filterable": false, "sortable": true, "facetable": false},
    {"name": "Description", "type": "Edm.String", "searchable": true, "filterable": false, "sortable": false, "facetable": false},
    {"name": "Category", "type": "Edm.String", "searchable": true, "filterable": true, "sortable": true, "facetable": true},
    {"name": "Tags", "type": "Collection(Edm.String)", "searchable": true, "filterable": true, "sortable": false, "facetable": true},
    {"name": "Rating", "type": "Edm.Double", "searchable": false, "filterable": true, "sortable": true, "facetable": true},
    {"name": "Location", "type": "Edm.GeographyPoint", "searchable": false, "filterable": true, "sortable": true, "facetable": false},
    {"name": "Address", "type": "Edm.ComplexType", "fields": [
      {"name": "StreetAddress", "type": "Edm.String", "searchable": true},
      {"name": "City", "type": "Edm.String", "searchable": true, "filterable": true, "sortable": true, "facetable": true},
      {"name": "StateProvince", "type": "Edm.String", "searchable": true, "filterable": true, "sortable": true, "facetable": true},
      {"name": "PostalCode", "type": "Edm.String", "searchable": true, "filterable": true, "sortable": true, "facetable": true},
      {"name": "Country", "type": "Edm.String", "searchable": true, "filterable": true, "sortable": true, "facetable": true}
    ]}
  ],
  "semantic": {
    "configurations": [
      {
        "name": "hotel-semantic-config",
        "prioritizedFields": {
          "titleField": {
            "fieldName": "HotelName"
          },
          "prioritizedContentFields": [
            {"fieldName": "Description"}
          ],
          "prioritizedKeywordsFields": [
            {"fieldName": "Tags"}
          ]
        }
      }
    ]
  }
}'

curl -X PUT "$SEARCH_ENDPOINT/indexes/hotels-sample?api-version=2023-11-01" \
    -H "Content-Type: application/json" \
    -H "api-key: $SEARCH_ADMIN_KEY" \
    -d "$HOTELS_INDEX_SCHEMA"

echo "✓ Created hotels-sample index"

# Step 4: Upload sample hotel documents
echo ""
echo "[4/4] Uploading sample hotel documents..."

HOTELS_DATA='{
  "value": [
    {
      "@search.action": "upload",
      "HotelId": "1",
      "HotelName": "Azure Grand Hotel",
      "Description": "Luxury hotel in downtown with modern amenities and stunning city views. Features include rooftop pool, spa, and fine dining restaurant.",
      "Category": "Luxury",
      "Tags": ["pool", "spa", "restaurant", "wifi", "city-view"],
      "Rating": 4.8,
      "Location": {"type": "Point", "coordinates": [-122.131577, 47.678581]},
      "Address": {
        "StreetAddress": "123 Cloud Street",
        "City": "Seattle",
        "StateProvince": "WA",
        "PostalCode": "98101",
        "Country": "USA"
      }
    },
    {
      "@search.action": "upload",
      "HotelId": "2",
      "HotelName": "AI Suites & Conference Center",
      "Description": "Business hotel with state-of-the-art conference facilities and high-speed internet. Perfect for corporate events and tech conferences.",
      "Category": "Business",
      "Tags": ["conference-room", "wifi", "business-center", "parking"],
      "Rating": 4.5,
      "Location": {"type": "Point", "coordinates": [-122.335167, 47.608013]},
      "Address": {
        "StreetAddress": "456 Intelligence Ave",
        "City": "Seattle",
        "StateProvince": "WA",
        "PostalCode": "98102",
        "Country": "USA"
      }
    },
    {
      "@search.action": "upload",
      "HotelId": "3",
      "HotelName": "Cognitive Beach Resort",
      "Description": "Beachfront resort with family-friendly activities, water sports, and kids club. Enjoy sunset views from your private balcony.",
      "Category": "Resort",
      "Tags": ["beach", "pool", "kids-club", "water-sports", "ocean-view"],
      "Rating": 4.7,
      "Location": {"type": "Point", "coordinates": [-122.389695, 47.611595]},
      "Address": {
        "StreetAddress": "789 Reasoning Boulevard",
        "City": "Bellevue",
        "StateProvince": "WA",
        "PostalCode": "98004",
        "Country": "USA"
      }
    }
  ]
}'

curl -X POST "$SEARCH_ENDPOINT/indexes/hotels-sample/docs/index?api-version=2023-11-01" \
    -H "Content-Type: application/json" \
    -H "api-key: $SEARCH_ADMIN_KEY" \
    -d "$HOTELS_DATA"

echo "✓ Uploaded 3 sample hotels"

# Cleanup
rm -rf ./sample-data

echo ""
echo "======================================"
echo "✓ Sample Data Setup Complete!"
echo "======================================"
echo ""
echo "What was created:"
echo "  1. Blob Storage: Responsible-AI-Transparency-Report-2025.pdf"
echo "  2. Search Index: hotels-sample (with 3 documents)"
echo ""
echo "Next steps:"
echo "  1. Create a knowledge base in the app pointing to:"
echo "     - Azure Blob: $STORAGE_CONTAINER_NAME container"
echo "     - Search Index: hotels-sample"
echo "  2. Test queries like:"
echo "     - 'What are Microsoft's principles for responsible AI?'"
echo "     - 'Find hotels with a pool in Seattle'"
echo ""
