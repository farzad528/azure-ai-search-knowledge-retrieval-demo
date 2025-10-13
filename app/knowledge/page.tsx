'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { StatusPill } from '@/components/shared/status-pill'
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog'
import {
  Database20Regular,
  Settings20Regular,
  Delete20Regular,
  Bot20Regular,
  DocumentDatabase20Regular
} from '@fluentui/react-icons'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface KnowledgeSource {
  name: string
  kind: 'searchIndex' | 'azureBlob' | 'web' | 'unknown'
}

interface KnowledgeBase {
  id: string
  name: string
  description?: string
  retrievalInstructions?: string
  model?: string
  knowledgeSources: KnowledgeSource[]
  status: 'active' | 'inactive'
  lastUpdated?: string
  outputConfiguration?: any
  '@odata.etag'?: string
}

interface FoundryAgent {
  id: string
  name: string
  tools?: any[]
}

export default function KnowledgePage() {
  const router = useRouter()
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [foundryAgents, setFoundryAgents] = useState<FoundryAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; kb: KnowledgeBase | null }>({ open: false, kb: null })
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch knowledge bases (agents from Search API) and knowledge sources
      const [kbResponse, ksResponse, agentsResponse] = await Promise.all([
        fetch('/api/agents', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        }),
        fetch('/api/knowledge-sources', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        }),
        fetch('/api/foundry/assistants').catch(() => ({ ok: false } as Response))
      ])

      if (!kbResponse.ok) {
        throw new Error(`Failed to fetch knowledge bases: ${kbResponse.status}`)
      }

      const kbData = await kbResponse.json()
      const ksData = ksResponse.ok ? await ksResponse.json() : { value: [] }

      // Create a map of knowledge source names to their kinds
      const sourceKindMap = new Map<string, string>()
      for (const source of (ksData.value || [])) {
        sourceKindMap.set(source.name, source.kind)
      }

      // Transform agents to knowledge bases format
      const bases = (kbData.value || []).map((agent: any) => ({
        id: agent.name,
        name: agent.name,
        description: agent.description || agent.retrievalInstructions,
        retrievalInstructions: agent.retrievalInstructions,
        model: agent.models?.[0]?.azureAIParameters?.modelName || agent.models?.[0]?.azureOpenAIParameters?.modelName,
        knowledgeSources: (agent.knowledgeSources || []).map((ks: any) => ({
          name: ks.name,
          kind: sourceKindMap.get(ks.name) || 'unknown'
        })),
        status: 'active' as const,
        lastUpdated: new Date().toLocaleDateString(),
        outputConfiguration: agent.outputConfiguration,
        '@odata.etag': agent['@odata.etag']
      }))

      setKnowledgeBases(bases)

      // Fetch Foundry agents if available
      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json()
        setFoundryAgents(agentsData.data || [])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load knowledge bases')
      console.error('Error fetching knowledge bases:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (kb: KnowledgeBase) => {
    try {
      setDeleteLoading(true)
      const response = await fetch(`/api/agents/${kb.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete knowledge base')
      }

      setKnowledgeBases(prev => prev.filter(k => k.id !== kb.id))
    } catch (err: any) {
      console.error('Error deleting knowledge base:', err)
      setError(err.message || 'Failed to delete knowledge base')
    } finally {
      setDeleteLoading(false)
      setDeleteDialog({ open: false, kb: null })
    }
  }

  const getAgentsUsingKnowledgeBase = (kbName: string): FoundryAgent[] => {
    return foundryAgents.filter(agent =>
      agent.tools?.some(tool =>
        tool.type === 'mcp' &&
        tool.server_url?.includes(`/agents/${kbName}/mcp`)
      )
    )
  }

  const getSourceIcon = (kind: string) => {
    switch (kind) {
      case 'azureBlob':
        return '/icons/blob.svg'
      case 'searchIndex':
        return '/icons/search_icon.svg'
      case 'web':
        return '/icons/web.svg'
      case 'unknown':
      default:
        return '/icons/search_icon.svg' // fallback icon
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Knowledge"
          description="Manage knowledge bases for your agents"
        />
        <LoadingSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Knowledge"
          description="Manage knowledge bases for your agents"
        />
        <ErrorState
          title="Error loading knowledge bases"
          description={error}
          action={{
            label: "Try again",
            onClick: fetchData
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge"
        description="Manage knowledge bases for your agents"
      />

      {knowledgeBases.length === 0 ? (
        <EmptyState
          icon={Database20Regular}
          title="No knowledge bases found"
          description="Knowledge bases provide context for your agents"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {knowledgeBases.map((kb, index) => {
            const usedByAgents = getAgentsUsingKnowledgeBase(kb.name)

            return (
              <motion.div
                key={kb.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className="h-[440px] flex flex-col hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-accent"
                  onClick={() => router.push(`/knowledge/${kb.id}/edit`)}
                >
                  {/* Compact Header */}
                  <CardHeader className="pb-2 flex-shrink-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-1.5 rounded-md bg-accent-subtle flex-shrink-0">
                            <DocumentDatabase20Regular className="h-4 w-4 text-accent" />
                          </div>
                          <CardTitle className="text-base truncate">{kb.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusPill variant="success">healthy</StatusPill>
                          <span className="text-xs text-fg-muted">
                            {kb.model || 'gpt-4o-mini'}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteDialog({ open: true, kb })
                        }}
                        className="h-7 w-7 text-fg-muted hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                      >
                        <Delete20Regular className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {kb.description && (
                      <CardDescription className="text-xs line-clamp-2 mt-1 text-fg-muted">
                        {kb.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  {/* Main Content - Two Column Layout */}
                  <CardContent className="flex-1 flex flex-col min-h-0 space-y-3 px-4">
                    {/* Sources Section */}
                    <div className="flex-1 min-h-0">
                      <div className="text-xs font-medium text-fg-default mb-2 flex items-center gap-1">
                        <span className="w-2 h-2 bg-accent rounded-full"></span>
                        {kb.knowledgeSources.length} Source{kb.knowledgeSources.length !== 1 ? 's' : ''}
                      </div>

                      {kb.knowledgeSources.length > 0 && (
                        <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                          {kb.knowledgeSources.slice(0, 6).map((source, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-2 bg-bg-subtle rounded border border-stroke-divider"
                            >
                              <Image
                                src={getSourceIcon(source.kind)}
                                alt={source.kind}
                                width={14}
                                height={14}
                                className="object-contain flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-fg-default truncate">
                                  {source.name}
                                </div>
                                <div className="text-xs text-fg-muted capitalize">
                                  {source.kind}
                                </div>
                              </div>
                            </div>
                          ))}
                          {kb.knowledgeSources.length > 6 && (
                            <div className="text-xs text-fg-muted text-center py-1.5 bg-bg-subtle rounded border border-stroke-divider">
                              +{kb.knowledgeSources.length - 6} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Agents Section - Always at bottom with fixed space */}
                    {usedByAgents.length > 0 && (
                      <div className="border-t border-stroke-divider pt-3 flex-shrink-0 h-[70px] flex flex-col">
                        <div className="text-xs font-medium text-fg-default mb-2 flex items-center gap-1">
                          <Bot20Regular className="h-3.5 w-3.5 text-fg-muted" />
                          Used by {usedByAgents.length}
                        </div>
                        <div className="flex flex-wrap gap-1 overflow-hidden">
                          {usedByAgents.slice(0, 2).map(agent => (
                            <span
                              key={agent.id}
                              className="px-2 py-0.5 text-xs bg-accent-subtle text-accent rounded truncate max-w-[90px] inline-block"
                              title={agent.name}
                            >
                              {agent.name}
                            </span>
                          ))}
                          {usedByAgents.length > 2 && (
                            <span className="px-2 py-0.5 text-xs bg-bg-subtle text-fg-muted rounded">
                              +{usedByAgents.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  {/* Minimal Footer */}
                  <CardFooter className="pt-2 pb-3 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/knowledge/${kb.id}/edit`)
                      }}
                    >
                      <Settings20Regular className="h-3.5 w-3.5 mr-1.5" />
                      Configure
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, kb: null })}
        title="Delete Knowledge Base"
        description={`Are you sure you want to delete "${deleteDialog.kb?.name}"? This action cannot be undone.`}
        confirmText="Delete Knowledge Base"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={() => deleteDialog.kb && handleDelete(deleteDialog.kb)}
      />
    </div>
  )
}