import { NextResponse } from 'next/server'

const ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT
const API_KEY = process.env.AZURE_SEARCH_API_KEY
const API_VERSION = process.env.AZURE_SEARCH_API_VERSION

export async function POST(request, { params }) {
  try {
    const agentId = params.id
    const body = await request.json()
    
    console.log('=== AGENT RETRIEVE REQUEST ===')
    console.log('Agent ID:', agentId)
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    const url = `${ENDPOINT}/agents/${agentId}/retrieve?api-version=${API_VERSION}`
    console.log('Request URL:', url)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY
      },
      body: JSON.stringify(body)
    })
    
    console.log('Azure retrieve response status:', response.status)
    console.log('Azure retrieve response headers:', Object.fromEntries(response.headers.entries()))
    
    const responseText = await response.text()
    console.log('Azure retrieve response text:', responseText)
    
    if (!response.ok) {
      console.error('=== RETRIEVE REQUEST FAILED ===')
      console.error('Status:', response.status)
      console.error('Status Text:', response.statusText)
      console.error('Response:', responseText)
      
      let parsedError = responseText
      try {
        parsedError = JSON.parse(responseText)
        console.error('Parsed error:', JSON.stringify(parsedError, null, 2))
      } catch (e) {
        console.error('Could not parse error as JSON')
      }
      
      return NextResponse.json({ 
        error: `Failed to retrieve from agent (${response.status})`,
        azureError: parsedError,
        details: responseText,
        status: response.status,
        statusText: response.statusText
      }, { status: response.status })
    }
    
    console.log('=== RETRIEVE REQUEST SUCCESS ===')
    
    let data = {}
    if (responseText) {
      try {
        data = JSON.parse(responseText)
        console.log('Parsed response:', JSON.stringify(data, null, 2))
      } catch (e) {
        console.error('Response is not JSON:', responseText)
        data = { message: responseText }
      }
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('=== RETRIEVE REQUEST EXCEPTION ===')
    console.error('Error:', error)
    console.error('Stack:', error.stack)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: error.stack,
      type: 'exception'
    }, { status: 500 })
  }
}