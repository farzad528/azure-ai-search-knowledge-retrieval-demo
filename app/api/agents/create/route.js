import { NextResponse } from 'next/server'

const ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT
const API_KEY = process.env.AZURE_SEARCH_API_KEY
const API_VERSION = process.env.AZURE_SEARCH_API_VERSION

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Add the API key to the model configuration server-side
    // Azure AI Search requires the API key for OpenAI model access
    if (body.models && body.models.length > 0) {
      body.models.forEach(model => {
        if (model.kind === 'azureOpenAI' && model.azureOpenAIParameters) {
          model.azureOpenAIParameters.apiKey = process.env.AZURE_OPENAI_API_KEY
          // Remove authIdentity when using API key
          delete model.azureOpenAIParameters.authIdentity
        }
      })
    }
    
    console.log('=== CREATING AGENT ===')
    console.log('Agent name:', body.name)
    console.log('Request URL:', `${ENDPOINT}/agents/${body.name}?api-version=${API_VERSION}`)
    console.log('Request body (API key hidden):', JSON.stringify({
      ...body,
      models: body.models?.map(m => ({
        ...m,
        azureOpenAIParameters: m.azureOpenAIParameters ? {
          ...m.azureOpenAIParameters,
          apiKey: m.azureOpenAIParameters.apiKey ? '[HIDDEN]' : m.azureOpenAIParameters.apiKey
        } : m.azureOpenAIParameters
      }))
    }, null, 2))
    
    const response = await fetch(`${ENDPOINT}/agents/${body.name}?api-version=${API_VERSION}`, {
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
      console.error('=== AGENT CREATION FAILED ===')
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
        error: `Failed to create agent (${response.status})`,
        azureError: parsedError,
        details: responseText,
        status: response.status,
        statusText: response.statusText,
        requestBody: body,
        url: `${ENDPOINT}/agents/${body.name}?api-version=${API_VERSION}`
      }, { status: response.status })
    }
    
    console.log('=== AGENT CREATION SUCCESS ===')
    
    // Handle 204 No Content response (successful creation with no body)
    if (response.status === 204) {
      console.log('204 No Content - Creation successful')
      return NextResponse.json({ 
        success: true, 
        message: 'Agent created successfully',
        name: body.name,
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
        data = { message: responseText, name: body.name }
      }
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('=== AGENT CREATION EXCEPTION ===')
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