interface ApiResponse<T> {
  value: T[]
  nextLink?: string
}

interface Agent {
  name: string
  description?: string
  models?: any[]
  knowledgeSources?: any[]
  outputConfiguration?: any
  retrievalInstructions?: string
  requestLimits?: any
  '@odata.etag'?: string
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string | any[]
}

interface RetrieveParams {
  xMsUserToken?: string
  [key: string]: any
}

export async function fetchKnowledgeSources(): Promise<ApiResponse<any>> {
  const first = await fetch('/api/knowledge-sources', {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })

  if (!first.ok) {
    throw new Error('Failed to fetch knowledge sources')
  }

  const initial = await first.json()

  if (!initial.nextLink) {
    return initial
  }

  // Follow pagination if needed
  const all = [...(initial.value || [])]
  let nextLink = initial.nextLink
  let guard = 0

  while (nextLink && guard < 20) {
    guard++
    if (!nextLink.startsWith('/')) break

    const resp = await fetch(nextLink, { cache: 'no-store' })
    if (!resp.ok) break

    const page = await resp.json()
    all.push(...(page.value || []))
    nextLink = page.nextLink
  }

  return { value: all }
}

export async function fetchAgents(): Promise<ApiResponse<Agent>> {
  const response = await fetch('/api/agents', {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch agents')
  }

  return response.json()
}

export async function fetchAgent(id: string): Promise<Agent> {
  const response = await fetch(`/api/agents/${id}`)

  if (!response.ok) {
    throw new Error('Failed to fetch agent')
  }

  return response.json()
}

export async function updateAgent(agentId: string, agentData: Agent): Promise<Agent> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }

  if (agentData['@odata.etag']) {
    headers['If-Match'] = agentData['@odata.etag']
  }

  const response = await fetch(`/api/agents/${agentId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(agentData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to update agent')
  }

  return response.json()
}

export async function deleteAgent(agentId: string): Promise<any> {
  const response = await fetch(`/api/agents/${agentId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to delete agent')
  }

  return response.json()
}

export async function retrieveFromAgent(
  agentId: string,
  messages: Message[],
  params: RetrieveParams = {}
): Promise<any> {
  let userAclToken = params.xMsUserToken

  if (!userAclToken && typeof window !== 'undefined') {
    try {
      userAclToken =
        localStorage.getItem('x-ms-query-source-authorization') ||
        sessionStorage.getItem('x-ms-query-source-authorization') ||
        undefined
    } catch {
      // Ignore storage errors
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(userAclToken ? { 'x-ms-query-source-authorization': userAclToken } : {})
  }

  const payload = { messages, ...params }
  delete payload.xMsUserToken

  const response = await fetch(`/api/agents/${agentId}/retrieve`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to retrieve from agent')
  }

  return response.json()
}

export async function createAgent(agentData: Partial<Agent>): Promise<Agent> {
  const response = await fetch('/api/agents/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(agentData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to create agent')
  }

  return response.json()
}

export async function createKnowledgeSource(sourceData: any): Promise<any> {
  const response = await fetch('/api/knowledge-sources', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sourceData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to create knowledge source')
  }

  return response.json()
}

export async function createFoundryAgent(agentData: any): Promise<any> {
  const response = await fetch('/api/foundry/assistants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(agentData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to create Foundry agent')
  }

  return response.json()
}

export async function getKnowledgeSourceStatus(sourceId: string): Promise<any> {
  const response = await fetch(`/api/knowledge-sources/${sourceId}/status`)

  if (!response.ok) {
    throw new Error('Failed to get knowledge source status')
  }

  return response.json()
}