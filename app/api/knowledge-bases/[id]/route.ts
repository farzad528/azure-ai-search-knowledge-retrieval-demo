import { NextRequest, NextResponse } from 'next/server'

const ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT
const API_KEY = process.env.AZURE_SEARCH_API_KEY
const API_VERSION = process.env.AZURE_SEARCH_API_VERSION

interface RouteContext {
  params: { id: string }
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params

    const response = await fetch(`${ENDPOINT}/knowledgebases/${id}?api-version=${API_VERSION}`, {
      headers: { 'api-key': API_KEY! }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch knowledge base' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params
    const body = await request.json()

    const response = await fetch(`${ENDPOINT}/knowledgebases/${id}?api-version=${API_VERSION}`, {
      method: 'PUT',
      headers: {
        'api-key': API_KEY!,
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
        // Non-JSON error body
      }

      return NextResponse.json({
        error: `Failed to update knowledge base (${response.status})`,
        azureError: parsedError,
        details: responseText,
        status: response.status,
        statusText: response.statusText,
        requestBody: body,
        url: `${ENDPOINT}/knowledgebases/${id}?api-version=${API_VERSION}`
      }, { status: response.status })
    }

    if (response.status === 204 || !responseText) {
      return NextResponse.json({
        success: true,
        message: 'Knowledge base updated successfully',
        status: response.status
      })
    }

    let data: any = {}
    try {
      data = responseText ? JSON.parse(responseText) : {}
    } catch {
      data = { message: responseText }
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

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params

    const response = await fetch(`${ENDPOINT}/knowledgebases/${id}?api-version=${API_VERSION}`, {
      method: 'DELETE',
      headers: {
        'api-key': API_KEY!
      }
    })

    if (!response.ok) {
      const responseText = await response.text()
      let parsedError: unknown = responseText
      try {
        parsedError = JSON.parse(responseText)
      } catch {
        // keep raw
      }

      return NextResponse.json({
        error: `Failed to delete knowledge base (${response.status})`,
        azureError: parsedError,
        details: responseText,
        status: response.status,
        statusText: response.statusText
      }, { status: response.status })
    }

    if (response.status === 204) {
      return NextResponse.json({
        success: true,
        message: 'Knowledge base deleted successfully',
        status: 204
      })
    }

    return NextResponse.json({ success: true, message: 'Knowledge base deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message,
      stack: error.stack,
      type: 'exception'
    }, { status: 500 })
  }
}
