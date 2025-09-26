import { NextRequest, NextResponse } from 'next/server'
import { getFoundryBearerToken } from '@/lib/token-manager'

const FOUNDRY_ENDPOINT = process.env.FOUNDRY_PROJECT_ENDPOINT
const FOUNDRY_API_VERSION = '2025-05-01'

export async function GET() {
  try {
    // Validate required environment variables
    if (!FOUNDRY_ENDPOINT) {
      return NextResponse.json(
        {
          error: 'Missing Foundry configuration. Please set FOUNDRY_PROJECT_ENDPOINT in your .env file.'
        },
        { status: 500 }
      )
    }

    // Get bearer token (auto-refreshed)
    const bearerToken = await getFoundryBearerToken()

    console.log('Fetching Foundry threads list')

    const response = await fetch(`${FOUNDRY_ENDPOINT}/threads?api-version=${FOUNDRY_API_VERSION}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
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
    console.log('Foundry threads fetched successfully')
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching Foundry threads:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get bearer token (auto-refreshed)
    const bearerToken = await getFoundryBearerToken()

    const response = await fetch(`${FOUNDRY_ENDPOINT}/threads?api-version=${FOUNDRY_API_VERSION}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || 'Failed to create thread' },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating thread:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}