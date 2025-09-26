import { NextRequest, NextResponse } from 'next/server'

const FOUNDRY_ENDPOINT = process.env.FOUNDRY_PROJECT_ENDPOINT
const FOUNDRY_API_VERSION = '2025-05-01'
const FOUNDRY_BEARER_TOKEN = process.env.FOUNDRY_BEARER_TOKEN

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Validate required environment variables
    if (!FOUNDRY_ENDPOINT || !FOUNDRY_BEARER_TOKEN) {
      return NextResponse.json(
        {
          error: 'Missing Foundry configuration. Please set FOUNDRY_PROJECT_ENDPOINT and FOUNDRY_BEARER_TOKEN in your .env file.',
          details: 'Generate bearer token with: az account get-access-token --resource https://ai.azure.com --query accessToken -o tsv'
        },
        { status: 500 }
      )
    }

    const assistantId = params.id

    console.log(`Fetching Foundry assistant ${assistantId}`)

    const response = await fetch(`${FOUNDRY_ENDPOINT}/assistants/${assistantId}?api-version=${FOUNDRY_API_VERSION}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FOUNDRY_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Foundry API error:', response.status, errorData)

      if (response.status === 401) {
        return NextResponse.json(
          {
            error: 'Invalid bearer token. Please regenerate with: az account get-access-token --resource https://ai.azure.com --query accessToken -o tsv',
            status: response.status
          },
          { status: 401 }
        )
      }

      return NextResponse.json(
        {
          error: errorData.message || `Foundry API error: ${response.status}`,
          details: errorData
        },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log('Foundry assistant fetched successfully:', assistantId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching Foundry assistant:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Validate required environment variables
    if (!FOUNDRY_ENDPOINT || !FOUNDRY_BEARER_TOKEN) {
      return NextResponse.json(
        {
          error: 'Missing Foundry configuration. Please set FOUNDRY_PROJECT_ENDPOINT and FOUNDRY_BEARER_TOKEN in your .env file.',
          details: 'Generate bearer token with: az account get-access-token --resource https://ai.azure.com --query accessToken -o tsv'
        },
        { status: 500 }
      )
    }

    const body = await req.json()
    const assistantId = params.id

    console.log(`Updating Foundry assistant ${assistantId} with:`, body)

    const response = await fetch(`${FOUNDRY_ENDPOINT}/assistants/${assistantId}?api-version=${FOUNDRY_API_VERSION}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FOUNDRY_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Foundry API error:', response.status, errorData)

      if (response.status === 401) {
        return NextResponse.json(
          {
            error: 'Invalid bearer token. Please regenerate with: az account get-access-token --resource https://ai.azure.com --query accessToken -o tsv',
            status: response.status
          },
          { status: 401 }
        )
      }

      return NextResponse.json(
        {
          error: errorData.message || `Foundry API error: ${response.status}`,
          details: errorData
        },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log('Foundry assistant updated successfully:', assistantId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating Foundry assistant:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}