import { NextResponse } from 'next/server'

const ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT
const API_KEY = process.env.AZURE_SEARCH_API_KEY
const API_VERSION = process.env.AZURE_SEARCH_API_VERSION

export async function GET() {
  try {
    console.log('Fetching knowledge sources from:', `${ENDPOINT}/knowledgeSources?api-version=${API_VERSION}`)

    const response = await fetch(`${ENDPOINT}/knowledgeSources?api-version=${API_VERSION}`, {
      headers: { 
        'api-key': API_KEY,
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    })

    console.log('Azure knowledge sources response status:', response.status)

    if (!response.ok) {
      console.error('Failed to fetch knowledge sources:', response.status, response.statusText)
      return NextResponse.json({ error: 'Failed to fetch knowledge sources' }, { status: response.status })
    }

    const data = await response.json()
    console.log('Fetched knowledge sources:', data.value?.length, 'sources')
    console.log('Knowledge source names from Azure:', data.value?.map(a => a.name))

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Knowledge sources API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}