import { NextResponse } from 'next/server'

const ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT
const API_KEY = process.env.AZURE_SEARCH_API_KEY
const API_VERSION = process.env.AZURE_SEARCH_API_VERSION

export async function GET(request, { params }) {
  try {
    const { id } = params
    console.log('Fetching agent:', id)
    const response = await fetch(`${ENDPOINT}/agents/${id}?api-version=${API_VERSION}`, {
      headers: { 'api-key': API_KEY },
    })
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch agent' }, { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    
    console.log('=== UPDATING AGENT ===')
    console.log('Agent ID:', id)
    console.log('Request URL:', `${ENDPOINT}/agents/${id}?api-version=${API_VERSION}`)
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    const response = await fetch(`${ENDPOINT}/agents/${id}?api-version=${API_VERSION}`, {
      method: 'PUT',
      headers: {
        'api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    console.log('Azure response status:', response.status)
    console.log('Azure response statusText:', response.statusText)
    console.log('Azure response headers:', Object.fromEntries(response.headers.entries()))
    
    // Always try to get response text first
    const responseText = await response.text()
    console.log('Azure response text:', responseText)
    
    if (!response.ok) {
      console.error('=== AGENT UPDATE FAILED ===')
      console.error('Status:', response.status)
      console.error('Status Text:', response.statusText)
      console.error('Response:', responseText)
      
      // Try to parse error as JSON if possible
      let parsedError = responseText
      try {
        parsedError = JSON.parse(responseText)
        console.error('Parsed error:', JSON.stringify(parsedError, null, 2))
      } catch (e) {
        console.error('Could not parse error as JSON')
      }
      
      return NextResponse.json({ 
        error: `Failed to update agent (${response.status})`,
        azureError: parsedError,
        details: responseText,
        status: response.status,
        statusText: response.statusText,
        requestBody: body,
        url: `${ENDPOINT}/agents/${id}?api-version=${API_VERSION}`
      }, { status: response.status })
    }
    
    console.log('=== AGENT UPDATE SUCCESS ===')
    
    // Handle 204 No Content response (successful update with no body)
    if (response.status === 204) {
      console.log('204 No Content - Update successful')
      return NextResponse.json({ 
        success: true, 
        message: 'Agent updated successfully',
        status: 204
      })
    }
    
    // Try to parse JSON response
    let data = {}
    if (responseText) {
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.log('Response is not JSON:', responseText)
        data = { message: responseText }
      }
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('=== AGENT UPDATE EXCEPTION ===')
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

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    console.log('=== DELETING AGENT ===')
    console.log('Agent ID:', id)
    console.log('Request URL:', `${ENDPOINT}/agents/${id}?api-version=${API_VERSION}`)
    
    const response = await fetch(`${ENDPOINT}/agents/${id}?api-version=${API_VERSION}`, {
      method: 'DELETE',
      headers: {
        'api-key': API_KEY,
      },
    })
    
    console.log('Azure delete response status:', response.status)
    console.log('Azure delete response statusText:', response.statusText)
    
    if (!response.ok) {
      const responseText = await response.text()
      console.error('=== AGENT DELETE FAILED ===')
      console.error('Status:', response.status)
      console.error('Response:', responseText)
      
      let parsedError = responseText
      try {
        parsedError = JSON.parse(responseText)
      } catch (e) {
        console.error('Could not parse delete error as JSON')
      }
      
      return NextResponse.json({ 
        error: `Failed to delete agent (${response.status})`,
        azureError: parsedError,
        details: responseText,
        status: response.status,
        statusText: response.statusText
      }, { status: response.status })
    }
    
    console.log('=== AGENT DELETE SUCCESS ===')
    
    // Handle 204 No Content response (successful deletion)
    if (response.status === 204) {
      console.log('204 No Content - Delete successful')
      return NextResponse.json({ 
        success: true, 
        message: 'Agent deleted successfully',
        status: 204
      })
    }
    
    return NextResponse.json({ success: true, message: 'Agent deleted successfully' })
  } catch (error) {
    console.error('=== AGENT DELETE EXCEPTION ===')
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