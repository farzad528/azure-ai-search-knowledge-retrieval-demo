import { NextResponse } from 'next/server'

const ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT
const API_KEY = process.env.AZURE_SEARCH_API_KEY
const API_VERSION = process.env.AZURE_SEARCH_API_VERSION

// Proxies GET index statistics
// Azure endpoint: GET /indexes/{indexName}/stats?api-version=...
export async function GET(request, { params }) {
  const { indexName } = params
  if (!indexName) {
    return NextResponse.json({ error: 'Index name required' }, { status: 400 })
  }
  try {
    const url = `${ENDPOINT}/indexes/${encodeURIComponent(indexName)}/stats?api-version=${API_VERSION}`
    const response = await fetch(url, {
      headers: {
        'api-key': API_KEY,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ error: 'Failed to fetch index stats', details: text }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 })
  }
}
