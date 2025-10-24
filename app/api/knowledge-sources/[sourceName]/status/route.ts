import { NextRequest, NextResponse } from 'next/server'

const ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT
const API_KEY = process.env.AZURE_SEARCH_API_KEY
const API_VERSION = process.env.AZURE_SEARCH_API_VERSION

interface RouteContext {
  params: { sourceName: string }
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    if (!ENDPOINT || !API_KEY || !API_VERSION) {
      return NextResponse.json(
        { error: 'Azure Search configuration missing' },
        { status: 500 }
      )
    }

    const { sourceName } = params

    const response = await fetch(
      `${ENDPOINT}/knowledgesources('${sourceName}')/status?api-version=${API_VERSION}`,
      {
        headers: {
          'api-key': API_KEY,
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      let parsedError: unknown = errorText
      try {
        parsedError = JSON.parse(errorText)
      } catch {
        // keep as text
      }

      return NextResponse.json(
        {
          error: `Failed to fetch knowledge source status (${response.status})`,
          azureError: parsedError,
          details: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Knowledge source status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
