'use client'

import * as React from 'react'
import { Add20Regular, ArrowClockwise20Regular } from '@fluentui/react-icons'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { KnowledgeSourceCard } from '@/components/knowledge-source-card'
import { KnowledgeBaseCard, KnowledgeBaseSummary } from '@/components/knowledge-base-card'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { CreateKnowledgeBaseForm } from '@/components/forms/create-knowledge-base-form'
import { staggerContainer, staggerItem } from '@/lib/motion'

type KnowledgeSource = {
  id: string
  name: string
  kind: 'indexedOneLake' | 'searchIndex' | 'azureBlob' | 'remoteSharePoint' | 'indexedSharePoint' | 'web'
  docCount?: number
  lastUpdated?: string
  status?: string
}

interface DashboardViewProps {
  knowledgeSources: KnowledgeSource[]
  knowledgeBases: KnowledgeBaseSummary[]
  loading: boolean
  error: string | null
  onRefresh: () => void
}

export function DashboardView({ 
  knowledgeSources, 
  knowledgeBases, 
  loading, 
  error, 
  onRefresh 
}: DashboardViewProps) {
  const [showCreateKnowledgeBase, setShowCreateKnowledgeBase] = React.useState(false)
  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        description={error}
        action={{
          label: "Try again",
          onClick: onRefresh
        }}
      />
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Knowledge retrieval"
  description={`Manage knowledge sources and knowledge bases for intelligent document search and chat experiences${process.env.NEXT_PUBLIC_AZURE_SEARCH_ENDPOINT ? ` • Connected to ${new URL(process.env.NEXT_PUBLIC_AZURE_SEARCH_ENDPOINT).hostname}` : ''}.`}
      />
      
      {/* Quick stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Knowledge sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{knowledgeSources.length}</div>
              <p className="text-xs text-fg-muted">
                Active indexes & data sources
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Knowledge bases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{knowledgeBases.length}</div>
              <p className="text-xs text-fg-muted">
                Orchestrating retrieval
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Knowledge Bases Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Knowledge bases</h2>
              <p className="text-sm text-fg-muted mt-1">
                Grounded retrieval configurations that power agents across your organisation.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="Refresh data">
                <ArrowClockwise20Regular className="h-4 w-4" />
              </Button>
              <Button onClick={() => setShowCreateKnowledgeBase(true)}>
                <Add20Regular className="h-4 w-4 mr-2" />
                Create knowledge base
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {showCreateKnowledgeBase && (
              <CreateKnowledgeBaseForm
                knowledgeSources={knowledgeSources}
                onSubmit={async () => {
                  setShowCreateKnowledgeBase(false)
                  onRefresh()
                }}
                onCancel={() => setShowCreateKnowledgeBase(false)}
              />
            )}
            
            {knowledgeBases.length === 0 && !showCreateKnowledgeBase ? (
              <EmptyState
                title="No knowledge bases"
                description="Create your first knowledge base to power grounded chat experiences."
                action={{
                  label: "Create knowledge base",
                  onClick: () => setShowCreateKnowledgeBase(true)
                }}
              />
            ) : (
              knowledgeBases.map((base) => (
                <KnowledgeBaseCard key={base.id || base.name} knowledgeBase={base} />
              ))
            )}
          </div>
        </section>

        {/* Knowledge Sources Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Knowledge sources</h2>
              <p className="text-sm text-fg-muted mt-1">
                Unified indexes and repositories optimized for high-quality agent grounding.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {knowledgeSources.length === 0 ? (
              <EmptyState
                title="No knowledge sources"
                description="Connect your first data source to enable knowledge retrieval."
              />
            ) : (
              knowledgeSources.map((source) => (
                <KnowledgeSourceCard key={source.id} source={source} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-stroke-divider">
        <LoadingSkeleton className="h-9 w-64 mb-2" />
        <LoadingSkeleton className="h-5 w-96" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <LoadingSkeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <LoadingSkeleton className="h-8 w-16 mb-2" />
              <LoadingSkeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <LoadingSkeleton className="h-6 w-32" />
            <LoadingSkeleton className="h-32 w-full" />
            <LoadingSkeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}