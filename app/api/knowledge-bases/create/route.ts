import { NextRequest, NextResponse } from 'next/server'

const ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT
const API_KEY = process.env.AZURE_SEARCH_API_KEY
const API_VERSION = process.env.AZURE_SEARCH_API_VERSION

export async function POST(request: NextRequest) {
  try {
    if (!ENDPOINT || !API_KEY || !API_VERSION) {
      return NextResponse.json(
        { error: 'Azure Search configuration missing' },
        { status: 500 }
      )
    }

    const body = await request.json()

    // Inject Azure OpenAI API key server-side when using key-based auth
    if (body.models && Array.isArray(body.models)) {
      body.models.forEach((model: any) => {
        if (model.kind === 'azureOpenAI' && model.azureOpenAIParameters) {
          model.azureOpenAIParameters.apiKey = process.env.AZURE_OPENAI_API_KEY
          delete model.azureOpenAIParameters.authIdentity
        }
      })
    }

    const response = await fetch(`${ENDPOINT}/knowledgebases/${body.name}?api-version=${API_VERSION}`, {
      method: 'PUT',
      headers: {
        'api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const responseText = await response.text()

    if (!response.ok) {
      let parsedError: unknown = responseText
      try {
        parsedError = JSON.parse(responseText)
      } catch {
        // Response not JSON, keep raw text
      }

      return NextResponse.json({
        error: `Failed to create knowledge base (${response.status})`,
        azureError: parsedError,
        details: responseText,
        status: response.status,
        statusText: response.statusText,
        requestBody: body,
        url: `${ENDPOINT}/knowledgebases/${body.name}?api-version=${API_VERSION}`
      }, { status: response.status })
    }

    if (response.status === 204 || !responseText) {
      return NextResponse.json({
        success: true,
        message: 'Knowledge base created successfully',
        name: body.name,
        status: response.status
      })
    }

    let data: any = {}
    try {
      data = responseText ? JSON.parse(responseText) : {}
    } catch {
      data = { message: responseText, name: body.name }
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message,
      stack: error.stack,
      type: 'exception'
    }, { status: 500 })
  }
}
