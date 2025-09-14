export function getConversations() {
  if (typeof window === 'undefined') return []
  return JSON.parse(localStorage.getItem('conversations') || '[]')
}

export function saveConversation(conversation) {
  if (typeof window === 'undefined') return
  const conversations = getConversations()
  const existing = conversations.findIndex(c => c.id === conversation.id)
  if (existing >= 0) {
    conversations[existing] = conversation
  } else {
    conversations.unshift(conversation)
  }
  localStorage.setItem('conversations', JSON.stringify(conversations.slice(0, 20)))
}