export async function fetchKnowledgeSources() {
  // Fetch first page from our API route (which proxies Azure)
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

  // If backend already aggregates or there's no pagination, just return
  if (!initial.nextLink) {
    return initial
  }

  // Otherwise, follow pagination client-side (defensive) by calling Azure directly through our route
  let all = [...(initial.value || [])]
  let nextLink = initial.nextLink
  // Limit pages to prevent runaway loops
  let guard = 0
  while (nextLink && guard < 20) {
    guard++
    // Our API route currently doesn't accept arbitrary absolute nextLink; if Azure returns full URL, we proxy via query param (future enhancement).
    // For now attempt direct fetch if same-origin relative path; if not, break.
    if (!nextLink.startsWith('/')) {
      break
    }
    const resp = await fetch(nextLink, { cache: 'no-store' })
    if (!resp.ok) break
    const page = await resp.json()
    all.push(...(page.value || []))
    nextLink = page.nextLink
  }
  return { value: all }
}

export async function fetchAgents() {
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

export async function fetchAgent(id) {
  const response = await fetch(`/api/agents/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch agent')
  }
  return response.json()
}

export async function updateAgent(agentId, agentData) {
  // Expect full replacement object per PUT semantics. If an etag is present, include If-Match for concurrency control.
  const headers = { 'Content-Type': 'application/json' }
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

export async function deleteAgent(agentId) {
  const response = await fetch(`/api/agents/${agentId}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to delete agent')
  }
  
  return response.json()
}

export async function retrieveFromAgent(agentId, messages, params = {}) {
  // Allow caller (or environment) to supply an end-user auth token used for ACL enforcement.
  // We look in params.xMsUserToken first, then in browser storage (if available).
  let userAclToken = params.xMsUserToken
  if (!userAclToken && typeof window !== 'undefined') {
    try {
      userAclToken = localStorage.getItem('x-ms-query-source-authorization') || sessionStorage.getItem('x-ms-query-source-authorization')
    } catch { /* ignore storage errors */ }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(userAclToken ? { 'x-ms-query-source-authorization': userAclToken } : {})
  }

  const payload = { messages, ...params }
  // Remove helper parameter so it doesn't get sent in body
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

export async function createAgent(agentData) {
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