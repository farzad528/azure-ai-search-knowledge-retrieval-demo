import { useState } from 'react'
import Link from 'next/link'
import AgentEditor from './AgentEditor'
import DeleteConfirmationModal from './DeleteConfirmationModal'
import { deleteAgent } from '@/lib/api'

export default function AgentCard({ agent, onRefresh }) {
  const [showEditor, setShowEditor] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteAgent(agent.name)
      setShowDeleteConfirm(false)
      onRefresh()
    } catch (error) {
      console.error('Delete error:', error)
      alert(`Failed to delete agent: ${error.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold mb-2">{agent.name}</h3>
      <p className="text-gray-600 mb-4">{agent.description}</p>
      <div className="flex gap-3 flex-wrap items-center">
        <Link 
          href={`/agent/${agent.name}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Sources →
        </Link>
        <button
          onClick={() => setShowEditor(true)}
          className="text-gray-600 hover:text-gray-800 text-sm font-medium border border-gray-300 px-2 py-1 rounded hover:bg-gray-50"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-800 text-sm font-medium border border-red-300 px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? '⏳ Deleting...' : '🗑️ Delete'}
        </button>
        <Link 
          href={`/playground/${agent.name}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
        >
          Open Playground
        </Link>
      </div>

      {showEditor && (
        <AgentEditor
          agent={agent}
          onClose={() => setShowEditor(false)}
          onSuccess={(agentName) => {
            setShowEditor(false)
            onRefresh()
          }}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmationModal
          agentName={agent.name}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}