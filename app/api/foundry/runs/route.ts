import { NextRequest, NextResponse } from 'next/server'
import { getFoundryBearerToken } from '@/lib/token-manager'

const FOUNDRY_ENDPOINT = process.env.FOUNDRY_PROJECT_ENDPOINT
const FOUNDRY_API_VERSION = '2025-05-01'

export async function POST(req: NextRequest) {
  try {
    // Get bearer token (auto-refreshed)
    const bearerToken = await getFoundryBearerToken()

    const body = await req.json()
    const { threadId, assistantId, tool_resources } = body

    // Inject the API key from server-side environment variables
    if (tool_resources && tool_resources.mcp) {
      tool_resources.mcp = tool_resources.mcp.map(mcpResource => ({
        ...mcpResource,
        headers: {
          ...mcpResource.headers,
          'api-key': process.env.AZURE_SEARCH_API_KEY
        }
      }))
    }

    const runData = {
      assistant_id: assistantId,
      ...(tool_resources && { tool_resources })
    }

    const response = await fetch(`${FOUNDRY_ENDPOINT}/threads/${threadId}/runs?api-version=${FOUNDRY_API_VERSION}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(runData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || 'Failed to create run' },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating run:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}