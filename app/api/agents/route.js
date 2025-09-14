import { NextResponse } from 'next/server'

const ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT
const API_KEY = process.env.AZURE_SEARCH_API_KEY
const API_VERSION = process.env.AZURE_SEARCH_API_VERSION

export async function GET() {
  try {
    console.log('Fetching agents from:', `${ENDPOINT}/agents?api-version=${API_VERSION}`)
    
    const response = await fetch(`${ENDPOINT}/agents?api-version=${API_VERSION}`, {
      headers: { 
        'api-key': API_KEY,
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    })
    
    console.log('Azure agents response status:', response.status)
    
    if (!response.ok) {
      console.error('Failed to fetch agents:', response.status, response.statusText)
      return NextResponse.json({ error: 'Failed to fetch agents' }, { status: response.status })
    }
    
    const data = await response.json()
    console.log('Fetched agents:', data.value?.length, 'agents')
    console.log('Agent names from Azure:', data.value?.map(a => a.name))
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Agents API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}