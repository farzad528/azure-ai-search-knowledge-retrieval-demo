import { InlineCitationsText } from './inline-citations'

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  
  // Extract different content types
  const textContent = message.content?.find(c => c.type === 'text')?.text || ''
  const imageContent = message.content?.find(c => c.type === 'image')
  
  let text = textContent
  let parsedCitations = []

  // For assistant messages, try to parse citations and clean up text
  if (!isUser) {
    try {
      const citationsData = JSON.parse(text)
      if (Array.isArray(citationsData)) {
        parsedCitations = citationsData
        // If the entire text is just citations JSON, show a friendly message
        text = "Here's what I found based on the available knowledge sources:"
      }
    } catch {
      // If not JSON, use text as-is
    }
  }

  // Inline citation chip renderer similar to playground-view implementation
  // Inline citations now handled by shared component

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3xl p-4 rounded-lg ${
        isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-white border shadow-sm'
      }`}>
        {/* Display image content if present */}
        {imageContent && (
          <div className="mb-3">
            <img 
              src={imageContent.image.url} 
              alt="User uploaded image" 
              className="max-w-full h-auto rounded-lg border"
              style={{ maxHeight: '300px' }}
            />
          </div>
        )}
        
        <div className="whitespace-pre-wrap">
          <InlineCitationsText 
            text={text}
            references={message.references}
            activity={message.activity}
            messageId={message.id}
            onActivate={() => {/* no-op for now */}}
          />
        </div>
        
        {/* Display parsed citations from response text */}
        {!isUser && parsedCitations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Knowledge Sources:</h4>
            <div className="space-y-2">
              {parsedCitations.map((citation, i) => (
                <div id={`ref-${message.id}-${citation.ref_id || i}`} key={i} className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  <div className="font-medium text-xs text-gray-500 mb-1">Reference {citation.ref_id != null ? citation.ref_id + 1 : i + 1}</div>
                  <div className="line-clamp-3">{citation.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!isUser && message.citations && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Citations:</h4>
            <div className="space-y-1">
              {message.citations.map((citation, i) => (
                <div key={i} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {citation.title || citation.url || citation.content?.slice(0, 100)}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isUser && message.references && message.references.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Source Documents:</h4>
            <div className="space-y-1">
              {message.references.map((ref, i) => (
                <div id={`ref-${message.id}-${i}`} key={i} className="text-xs">
                  <div className="text-gray-600">
                    <span className="font-medium">Type:</span> {ref.type}
                    {ref.rerankerScore && (
                      <span className="ml-2 text-gray-500">Score: {ref.rerankerScore.toFixed(2)}</span>
                    )}
                  </div>
                  {ref.blobUrl && (
                    <div className="flex items-center gap-2 flex-wrap" title={ref.blobUrl.split('/').pop()}>
                      <span className="truncate max-w-[220px] break-all">{ref.blobUrl.split('/').pop()}</span>
                      <a
                        href={ref.blobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200 flex items-center gap-1"
                        aria-label={`Open source document ${ref.blobUrl.split('/').pop()}`}
                        title={`Open ${ref.blobUrl.split('/').pop()}`}
                      >
                        <span className="inline-block w-3 h-3">↗</span>
                        Open
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isUser && message.activity && message.activity.length > 0 && (
          <details className="mt-3 pt-3 border-t border-gray-200">
            <summary className="font-semibold text-sm text-gray-700 cursor-pointer">
              Activity Log ({message.activity.length} steps)
            </summary>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
              {message.activity.map((activity, i) => (
                <div key={i} className="text-xs bg-gray-50 p-2 rounded">
                  <div className="font-medium text-gray-700">{activity.type}</div>
                  {activity.knowledgeSourceName && (
                    <div className="text-gray-600">Source: {activity.knowledgeSourceName}</div>
                  )}
                  {activity.count !== undefined && (
                    <div className="text-gray-600">Results: {activity.count}</div>
                  )}
                  {activity.elapsedMs && (
                    <div className="text-gray-500">{activity.elapsedMs}ms</div>
                  )}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}