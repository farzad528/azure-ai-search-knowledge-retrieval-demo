import Link from 'next/link'

export default function ConversationSidebar({ conversations, onSelectConversation, onNewConversation, agentName }) {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <Link href="/" className="text-gray-300 hover:text-white text-sm">← Back to Dashboard</Link>
        <h2 className="text-lg font-semibold mt-2">{agentName}</h2>
      </div>
      
      <div className="p-4">
        <button 
          onClick={onNewConversation}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white p-2 rounded text-sm"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map(conv => (
          <button
            key={conv.id}
            onClick={() => onSelectConversation(conv)}
            className="w-full text-left p-3 hover:bg-gray-700 border-b border-gray-700 text-sm"
          >
            <div className="truncate">{conv.title}</div>
            <div className="text-xs text-gray-400 mt-1">
              {new Date(conv.updatedAt).toLocaleDateString()}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}