 'use client'

export const dynamic = 'force-dynamic'

import React, { Suspense, useEffect, useState } from 'react'
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
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { getSourceKindLabel } from '@/lib/sourceKinds'

type KnowledgeSource = {
  name: string
  kind: 'indexedOneLake' | 'searchIndex' | 'azureBlob' | 'remoteSharePoint' | 'indexedSharePoint' | 'web' | 'unknown'
}

type KnowledgeBase = {
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

type FoundryAgent = {
  id: string
  name: string
  tools?: any[]
}

function KnowledgePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = !!searchParams?.has('edit-mode')
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

      // Fetch knowledge bases and knowledge sources
      const [kbResponse, ksResponse, agentsResponse] = await Promise.all([
        fetch('/api/knowledge-bases', {
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

      // Transform knowledge bases to display format
      const bases = (kbData.value || []).map((kb: any) => ({
        id: kb.name,
        name: kb.name,
        description: kb.description || kb.retrievalInstructions,
        retrievalInstructions: kb.retrievalInstructions,
        model: kb.models?.[0]?.azureAIParameters?.modelName || kb.models?.[0]?.azureOpenAIParameters?.modelName,
        knowledgeSources: (kb.knowledgeSources || []).map((ks: any) => ({
          name: ks.name,
          kind: sourceKindMap.get(ks.name) || 'unknown'
        })),
        status: 'active' as const,
        lastUpdated: new Date().toLocaleDateString(),
        outputConfiguration: kb.outputConfiguration,
        '@odata.etag': kb['@odata.etag']
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
      const response = await fetch(`/api/knowledge-bases/${kb.id}`, {
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
        tool.server_url?.includes(`/knowledgebases/${kbName}/mcp`)
      )
    )
  }

  const getSourceIcon = (kind: string) => {
    switch (kind) {
      case 'azureBlob':
        return '/icons/blob.svg'
      case 'searchIndex':
        return '/icons/search_icon.svg'
      case 'indexedOneLake':
        return '/icons/onelake-color.svg'
      case 'remoteSharePoint':
      case 'indexedSharePoint':
        return '/icons/sharepoint.svg'
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
              <div key={kb.id} className="transform-gpu">
                <Card
                  className="h-[440px] flex flex-col transition-all duration-200 cursor-pointer group relative overflow-hidden border-2 hover:border-accent/50 hover:shadow-xl hover:-translate-y-1"
                  onClick={() => router.push(`/knowledge/${kb.id}/edit`)}
                >
                  {/* Subtle gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Compact Header */}
                  <CardHeader className="pb-2 flex-shrink-0 relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-1.5 rounded-lg bg-accent-subtle flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                            <DocumentDatabase20Regular className="h-4 w-4 text-accent" />
                          </div>
                          <CardTitle className="text-base truncate font-semibold">{kb.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusPill variant="success">healthy</StatusPill>
                          <span className="text-xs text-fg-muted font-medium">
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
                        className="h-7 w-7 text-fg-muted hover:text-destructive hover:bg-destructive/10 flex-shrink-0 hover:scale-110 transition-transform"
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
                  <CardContent className="flex-1 flex flex-col min-h-0 space-y-3 px-4 relative z-10">
                    {/* Sources Section */}
                    <div className="flex-1 min-h-0">
                      <div className="text-xs font-semibold text-fg-default mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                        {kb.knowledgeSources.length} Source{kb.knowledgeSources.length !== 1 ? 's' : ''}
                      </div>

                      {kb.knowledgeSources.length > 0 && (
                        <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar thin">
                          {kb.knowledgeSources.slice(0, 6).map((source, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-2 bg-bg-subtle rounded-lg border border-stroke-divider hover:border-accent/30 hover:bg-accent-subtle/30 transition-all duration-150 group/source"
                            >
                              <div className="flex-shrink-0 group-hover/source:scale-110 transition-transform duration-150">
                                <Image
                                  src={getSourceIcon(source.kind)}
                                  alt={source.kind}
                                  width={14}
                                  height={14}
                                  className="object-contain"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-fg-default truncate">
                                  {source.name}
                                </div>
                                <div className="text-xs text-fg-muted">
                                  {getSourceKindLabel(source.kind)}
                                </div>
                              </div>
                            </div>
                          ))}
                          {kb.knowledgeSources.length > 6 && (
                            <div className="text-xs text-fg-muted text-center py-1.5 bg-bg-subtle rounded-lg border border-stroke-divider">
                              +{kb.knowledgeSources.length - 6} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Agents Section - Always at bottom with fixed space */}
                    {usedByAgents.length > 0 && (
                      <div className="border-t border-stroke-divider pt-3 flex-shrink-0">
                        <div className="text-xs font-semibold text-fg-muted mb-2 flex items-center gap-1.5">
                          <Bot20Regular className="h-3.5 w-3.5 text-accent" />
                          <span>Used by {usedByAgents.length} agent{usedByAgents.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {usedByAgents.slice(0, 3).map(agent => (
                            <span
                              key={agent.id}
                              className="px-2.5 py-1 text-xs bg-bg-subtle text-fg-default rounded-lg border border-stroke-divider truncate max-w-[120px] inline-block hover:bg-accent-subtle hover:text-accent hover:border-accent hover:scale-105 transition-all duration-150"
                              title={agent.name}
                            >
                              {agent.name}
                            </span>
                          ))}
                          {usedByAgents.length > 3 && (
                            <span className="px-2.5 py-1 text-xs bg-bg-subtle text-fg-muted rounded-lg border border-stroke-divider">
                              +{usedByAgents.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  {/* Minimal Footer */}
                  <CardFooter className="pt-2 pb-3 flex-shrink-0 relative z-10">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-xs group-hover:bg-accent group-hover:text-fg-on-accent group-hover:border-accent transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isEditMode) {
                          router.push(`/knowledge/${kb.id}/edit`)
                        } else {
                          router.push(`/knowledge/${kb.id}`)
                        }
                      }}
                    >
                      <Settings20Regular className="h-3.5 w-3.5 mr-1.5" />
                      {isEditMode ? 'Configure' : 'View Details'}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
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

export default function KnowledgePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <KnowledgePageContent />
    </Suspense>
  )
}
