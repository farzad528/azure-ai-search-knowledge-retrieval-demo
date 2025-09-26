export const dynamic = 'force-dynamic'

import { PathRouter } from '../components/path-router'

async function fetchAzure(path: string) {
  const endpoint = process.env.AZURE_SEARCH_ENDPOINT
  const apiVersion = process.env.AZURE_SEARCH_API_VERSION
  const key = process.env.AZURE_SEARCH_API_KEY
  if (!endpoint || !apiVersion || !key) {
    throw new Error('Azure Search environment variables are not fully configured')
  }
  const res = await fetch(`${endpoint}${path}?api-version=${apiVersion}` , {
    headers: { 'api-key': key, 'Cache-Control': 'no-cache' },
    cache: 'no-store'
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`)
  }
  return res.json()
}

export default async function HomePage() {
  let initialSources: any[] = []
  let initialAgents: any[] = []
  let initialError: string | null = null
  try {
    const [ksRaw, agentsRaw] = await Promise.all([
      fetchAzure('/knowledgeSources'),
      fetchAzure('/agents')
    ])

    initialSources = (ksRaw.value || []).map((source: any) => ({
      id: source.name,
      name: source.name,
      kind: source.kind,
      docCount: 0,
      lastUpdated: null,
      status: 'active',
      description: source.description
    }))
    initialAgents = (agentsRaw.value || []).map((agent: any) => ({
      id: agent.name,
      name: agent.name,
      model: agent.models?.[0]?.azureOpenAIParameters?.modelName,
      sources: (agent.knowledgeSources || []).map((ks: any) => ks.name),
      sourceDetails: (agent.knowledgeSources || []).map((ks: any) => ({ name: ks.name, kind: ks.kind })),
      status: 'active',
      lastRun: null,
      createdBy: null,
      description: agent.description,
      outputConfiguration: agent.outputConfiguration
    }))
  } catch (e: any) {
    console.error('SSR dashboard fetch failed:', e)
    initialError = e?.message || 'Failed to load dashboard data'
  }

  return <PathRouter initialAgents={initialAgents} initialKnowledgeSources={initialSources} initialError={initialError} />
}