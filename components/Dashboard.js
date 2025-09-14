'use client'
import { useState } from 'react'
import Link from 'next/link'
import AgentCard from './AgentCard'
import KnowledgeSourceCard from './KnowledgeSourceCard'
import AgentEditor from './AgentEditor'
import Toast from './Toast'

export default function Dashboard({ knowledgeSources, agents, onRefresh }) {
  const [showAgentEditor, setShowAgentEditor] = useState(false)
  const [toast, setToast] = useState(null)
  return (
    <div className="min-h-screen p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Azure AI Search Knowledge Retrieval</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            💡 <strong>Tip:</strong> Click "Open Playground" on any agent to start chatting, or use the <strong>"View Code"</strong> button to see REST API examples in cURL, Python, and TypeScript.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Knowledge Agents</h2>
            <button
              onClick={() => setShowAgentEditor(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              + Create Agent
            </button>
          </div>
          <div className="space-y-4">
            {agents.map(agent => (
              <AgentCard key={agent.name} agent={agent} onRefresh={onRefresh} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Knowledge Sources</h2>
          <div className="space-y-4">
            {knowledgeSources.map(source => (
              <KnowledgeSourceCard key={source.name} source={source} />
            ))}
          </div>
        </section>
      </div>

      {showAgentEditor && (
        <AgentEditor
          onClose={() => setShowAgentEditor(false)}
          onSuccess={(agentName) => {
            setShowAgentEditor(false)
            console.log('Agent created successfully:', agentName)
            setToast({ message: `Agent "${agentName}" created successfully!`, type: 'success' })
            // Add small delay to ensure agent is fully created before refresh
            setTimeout(() => {
              onRefresh()
            }, 500)
          }}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
        <p className="mb-2">
          Made with ❤️ by Azure AI Search Product Team
        </p>
        <p>
          Contact us at{' '}
          <a 
            href="mailto:azuresearch_contact@microsoft.com" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            azuresearch_contact@microsoft.com
          </a>
        </p>
      </footer>
    </div>
  )
}