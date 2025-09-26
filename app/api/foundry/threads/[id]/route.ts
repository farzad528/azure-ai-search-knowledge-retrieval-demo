import { NextRequest, NextResponse } from 'next/server'
import { getFoundryBearerToken } from '@/lib/token-manager'

const FOUNDRY_ENDPOINT = process.env.FOUNDRY_PROJECT_ENDPOINT
const FOUNDRY_API_VERSION = '2025-05-01'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    const threadId = params.id

    console.log(`Deleting Foundry thread ${threadId}`)

    const response = await fetch(`${FOUNDRY_ENDPOINT}/threads/${threadId}?api-version=${FOUNDRY_API_VERSION}`, {
      method: 'DELETE',
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

    console.log('Foundry thread deleted successfully:', threadId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting Foundry thread:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}