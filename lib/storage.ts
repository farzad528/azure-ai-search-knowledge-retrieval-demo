interface Conversation {
  id: string
  title?: string
  messages?: any[]
  createdAt?: string
  updatedAt?: string
}

export function getConversations(): Conversation[] {
  if (typeof window === 'undefined') return []

  try {
    return JSON.parse(localStorage.getItem('conversations') || '[]')
  } catch {
    return []
  }
}

export function saveConversation(conversation: Conversation): void {
  if (typeof window === 'undefined') return

  const conversations = getConversations()
  const existingIndex = conversations.findIndex(c => c.id === conversation.id)

  if (existingIndex >= 0) {
    conversations[existingIndex] = conversation
  } else {
    conversations.unshift(conversation)
  }

  try {
    localStorage.setItem('conversations', JSON.stringify(conversations.slice(0, 20)))
  } catch {
    // Ignore storage errors
  }
}

export function deleteConversation(id: string): void {
  if (typeof window === 'undefined') return

  const conversations = getConversations()
  const filtered = conversations.filter(c => c.id !== id)

  try {
    localStorage.setItem('conversations', JSON.stringify(filtered))
  } catch {
    // Ignore storage errors
  }
}

export function clearConversations(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem('conversations')
  } catch {
    // Ignore storage errors
  }
}