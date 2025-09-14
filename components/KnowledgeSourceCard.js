export default function KnowledgeSourceCard({ source }) {
  const getKindBadge = (kind) => {
    const colors = {
      searchIndex: 'bg-green-100 text-green-800',
      azureBlob: 'bg-blue-100 text-blue-800',
      web: 'bg-purple-100 text-purple-800'
    }
    return colors[kind] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{source.name}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getKindBadge(source.kind)}`}>
          {source.kind}
        </span>
      </div>
      <p className="text-gray-600 text-sm">{source.description}</p>
    </div>
  )
}