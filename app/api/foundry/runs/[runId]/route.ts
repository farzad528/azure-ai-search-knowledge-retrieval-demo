import { NextRequest, NextResponse } from 'next/server'

const FOUNDRY_ENDPOINT = process.env.FOUNDRY_PROJECT_ENDPOINT
const FOUNDRY_API_VERSION = '2025-05-01'
const FOUNDRY_BEARER_TOKEN = process.env.FOUNDRY_BEARER_TOKEN

export async function GET(
  req: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const threadId = searchParams.get('threadId')

    if (!threadId) {
      return NextResponse.json(
        { error: 'threadId is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${FOUNDRY_ENDPOINT}/threads/${threadId}/runs/${params.runId}?api-version=${FOUNDRY_API_VERSION}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FOUNDRY_BEARER_TOKEN}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || 'Failed to get run status' },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error getting run status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}