import { NextResponse } from 'next/server'

const ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT
const API_KEY = process.env.AZURE_SEARCH_API_KEY
const API_VERSION = process.env.AZURE_SEARCH_API_VERSION

export async function GET() {
  try {
    const response = await fetch(`${ENDPOINT}/knowledgeSources?api-version=${API_VERSION}`, {
      headers: { 'api-key': API_KEY },
    })
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch knowledge sources' }, { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}