import { NextRequest, NextResponse } from 'next/server'

const FOUNDRY_ENDPOINT = process.env.FOUNDRY_PROJECT_ENDPOINT
const FOUNDRY_API_VERSION = '2025-05-01'
const FOUNDRY_BEARER_TOKEN = process.env.FOUNDRY_BEARER_TOKEN

export async function POST(req: NextRequest) {
  try {
    const response = await fetch(`${FOUNDRY_ENDPOINT}/threads?api-version=${FOUNDRY_API_VERSION}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FOUNDRY_BEARER_TOKEN}`,
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