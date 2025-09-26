'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { StatusPill } from '@/components/shared/status-pill'
import {
  Database20Regular,
  Add20Regular,
  Document20Regular,
  Settings20Regular
} from '@fluentui/react-icons'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface KnowledgeBase {
  id: string
  name: string
  description?: string
  status: 'healthy' | 'processing' | 'error'
  sourceCount: number
  lastUpdated?: Date
}

export default function KnowledgePage() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchKnowledgeBases = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/knowledge-sources')
        if (!response.ok) {
          throw new Error(`Failed to fetch knowledge bases: ${response.status}`)
        }

        const data = await response.json()

        // Transform knowledge sources to knowledge bases format
        const bases = (data.value || []).map((source: any) => ({
          id: source.name,
          name: source.name,
          description: source.description,
          status: 'healthy' as const, // Simplified status for minimal workflow
          sourceCount: 1, // Each knowledge source becomes a base
          lastUpdated: new Date()
        }))

        setKnowledgeBases(bases)
      } catch (err: any) {
        setError(err.message || 'Failed to load knowledge bases')
        console.error('Error fetching knowledge bases:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchKnowledgeBases()
  }, [])

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
        <ErrorState title="Error loading knowledge bases" description={error} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge"
        description="Manage knowledge bases for your agents"
        primaryAction={{
          label: "Create Knowledge Base",
          href: "/knowledge/create",
          icon: Add20Regular
        }}
      />

      {knowledgeBases.length === 0 ? (
        <EmptyState
          icon={Database20Regular}
          title="No knowledge bases found"
          description="Create your first knowledge base to provide context for your agents"
          action={{
            label: "Create Knowledge Base",
            onClick: () => window.location.href = "/knowledge/create"
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {knowledgeBases.map((kb, index) => (
            <motion.div
              key={kb.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <KnowledgeBaseCard knowledgeBase={kb} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

interface KnowledgeBaseCardProps {
  knowledgeBase: KnowledgeBase
}

function KnowledgeBaseCard({ knowledgeBase }: KnowledgeBaseCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-subtle">
              <Database20Regular className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">{knowledgeBase.name}</CardTitle>
              {knowledgeBase.description && (
                <CardDescription className="mt-1 line-clamp-2">
                  {knowledgeBase.description}
                </CardDescription>
              )}
            </div>
          </div>
          <StatusPill variant={knowledgeBase.status === 'healthy' ? 'success' : knowledgeBase.status === 'error' ? 'danger' : 'neutral'}>
            {knowledgeBase.status}
          </StatusPill>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm text-fg-muted">
          <div className="flex items-center gap-1">
            <Document20Regular className="h-4 w-4" />
            <span>{knowledgeBase.sourceCount} source{knowledgeBase.sourceCount !== 1 ? 's' : ''}</span>
          </div>
          {knowledgeBase.lastUpdated && (
            <span>Updated {knowledgeBase.lastUpdated.toLocaleDateString()}</span>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Settings20Regular className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}