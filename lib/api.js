export async function fetchKnowledgeSources() {
  const response = await fetch('/api/knowledge-sources')
  if (!response.ok) {
    throw new Error('Failed to fetch knowledge sources')
  }
  return response.json()
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
  const response = await fetch(`/api/agents/${agentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
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
  const response = await fetch(`/api/agents/${agentId}/retrieve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, ...params }),
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