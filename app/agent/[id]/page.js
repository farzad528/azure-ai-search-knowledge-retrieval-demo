'use client'
import { useState, useEffect } from 'react'
import { fetchAgent } from '@/lib/api'
import Link from 'next/link'

export default function AgentDetails({ params }) {
  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadAgent() {
      try {
        const data = await fetchAgent(params.id)
        setAgent(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadAgent()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="spinner"></div>
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Agent not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">← Back to Dashboard</Link>
      
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{agent.name}</h1>
        <p className="text-gray-600 mb-4">{agent.description}</p>
        
        <Link 
          href={`/playground/${agent.name}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium inline-block"
        >
          Open Playground
        </Link>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Knowledge Sources ({agent.knowledgeSources?.length || 0})</h2>
        <div className="grid gap-4">
          {agent.knowledgeSources?.map(ks => (
            <div key={ks.name} className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="font-semibold">{ks.name}</h3>
              <p className="text-sm text-gray-600">References: {ks.includeReferences ? 'Enabled' : 'Disabled'}</p>
            </div>
          ))}
        </div>
      </div>

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