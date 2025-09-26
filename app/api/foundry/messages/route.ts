import { NextRequest, NextResponse } from 'next/server'

const FOUNDRY_ENDPOINT = process.env.FOUNDRY_PROJECT_ENDPOINT
const FOUNDRY_API_VERSION = '2025-05-01'
const FOUNDRY_BEARER_TOKEN = process.env.FOUNDRY_BEARER_TOKEN

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { threadId, ...messageData } = body

    const response = await fetch(`${FOUNDRY_ENDPOINT}/threads/${threadId}/messages?api-version=${FOUNDRY_API_VERSION}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FOUNDRY_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || 'Failed to create message' },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const threadId = searchParams.get('threadId')

    if (!threadId) {
      return NextResponse.json(
        { error: 'threadId is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${FOUNDRY_ENDPOINT}/threads/${threadId}/messages?api-version=${FOUNDRY_API_VERSION}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FOUNDRY_BEARER_TOKEN}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || 'Failed to get messages' },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error getting messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}