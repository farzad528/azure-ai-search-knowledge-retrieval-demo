import { NextRequest, NextResponse } from 'next/server';

const ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT;
const API_KEY = process.env.AZURE_SEARCH_API_KEY;
const API_VERSION = process.env.AZURE_SEARCH_API_VERSION;

interface RouteContext {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const response = await fetch(`${ENDPOINT}/agents/${id}?api-version=${API_VERSION}`, {
      headers: { 'api-key': API_KEY! },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch agent' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const body = await request.json();

    // Support optimistic concurrency if '@odata.etag' present in payload
    const ifMatch = typeof body['@odata.etag'] === 'string' ? body['@odata.etag'] : undefined;

    const response = await fetch(`${ENDPOINT}/agents/${id}?api-version=${API_VERSION}`, {
      method: 'PUT',
      headers: {
        'api-key': API_KEY!,
        'Content-Type': 'application/json',
        ...(ifMatch ? { 'If-Match': ifMatch } : {})
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let parsedError = responseText;
      try {
        parsedError = JSON.parse(responseText);
      } catch (e) {
        // Response is not JSON
      }

      return NextResponse.json({
        error: `Failed to update agent (${response.status})`,
        azureError: parsedError,
        details: responseText,
        status: response.status,
        statusText: response.statusText,
        requestBody: body,
        url: `${ENDPOINT}/agents/${id}?api-version=${API_VERSION}`
      }, { status: response.status });
    }

    if (response.status === 204) {
      return NextResponse.json({
        success: true,
        message: 'Agent updated successfully',
        status: 204
      });
    }

    let data = {};
    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { message: responseText };
      }
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message,
      stack: error.stack,
      type: 'exception'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    const response = await fetch(`${ENDPOINT}/agents/${id}?api-version=${API_VERSION}`, {
      method: 'DELETE',
      headers: {
        'api-key': API_KEY!,
      },
    });

    if (!response.ok) {
      const responseText = await response.text();
      let parsedError = responseText;
      try {
        parsedError = JSON.parse(responseText);
      } catch (e) {
        // Response is not JSON
      }

      return NextResponse.json({
        error: `Failed to delete agent (${response.status})`,
        azureError: parsedError,
        details: responseText,
        status: response.status,
        statusText: response.statusText
      }, { status: response.status });
    }

    if (response.status === 204) {
      return NextResponse.json({
        success: true,
        message: 'Agent deleted successfully',
        status: 204
      });
    }

    return NextResponse.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message,
      stack: error.stack,
      type: 'exception'
    }, { status: 500 });
  }
}