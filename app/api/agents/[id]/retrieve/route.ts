import { NextRequest, NextResponse } from 'next/server';

const ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT;
const API_KEY = process.env.AZURE_SEARCH_API_KEY;
const API_VERSION = process.env.AZURE_SEARCH_API_VERSION;

interface RouteContext {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const agentId = params.id;
    const body = await request.json();

    // Forward end-user authorization token for ACL enforcement if provided
    // Support either canonical header or a legacy alias (if client provided)
    const aclHeader = request.headers.get('x-ms-query-source-authorization') ||
                     request.headers.get('x-ms-user-authorization');

    const url = `${ENDPOINT}/agents/${agentId}/retrieve?api-version=${API_VERSION}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY!,
        // Pass through ACL header when present for document-level security
        ...(aclHeader ? { 'x-ms-query-source-authorization': aclHeader } : {})
      },
      body: JSON.stringify(body)
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
        error: `Failed to retrieve from agent (${response.status})`,
        azureError: parsedError,
        details: responseText,
        status: response.status,
        statusText: response.statusText
      }, { status: response.status });
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