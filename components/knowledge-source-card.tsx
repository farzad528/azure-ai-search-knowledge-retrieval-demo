import * as React from 'react'
import { Open20Regular } from '@fluentui/react-icons'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'
import { SourceKindIcon } from '@/components/source-kind-icon'
import { StatusPill } from '@/components/shared/status-pill'

type KnowledgeSource = {
  id: string
  name: string
  kind: 'searchIndex' | 'web' | 'azureBlob' | 'indexedOneLake' | 'remoteSharePoint' | 'indexedSharePoint'
  docCount?: number
  lastUpdated?: string
  status?: string
}

interface KnowledgeSourceCardProps {
  source: KnowledgeSource
}

const kindConfig = {
  searchIndex: { label: 'Search Index' },
  web: { label: 'Web' },
  azureBlob: { label: 'Azure Blob' },
  indexedOneLake: { label: 'OneLake' },
  remoteSharePoint: { label: 'SharePoint' },
  indexedSharePoint: { label: 'SharePoint' }
}

const statusConfig = {
  active: { label: 'Active', variant: 'success' as const },
  syncing: { label: 'Syncing', variant: 'info' as const },
  error: { label: 'Error', variant: 'danger' as const },
  inactive: { label: 'Inactive', variant: 'neutral' as const }
}

export function KnowledgeSourceCard({ source }: KnowledgeSourceCardProps) {
  const config = kindConfig[source.kind]
  const status = statusConfig[source.status as keyof typeof statusConfig] || statusConfig.active

  return (
    <Card className="transition-shadow duration-base ease-out hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <SourceKindIcon kind={source.kind} size={18} boxSize={32} />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold tracking-tight text-fg-default">
                {source.name}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-glass-border bg-glass-surface px-2 py-1 text-xs font-medium uppercase tracking-wide text-fg-muted">
                  {config.label}
                </span>
                <StatusPill variant={status.variant}>{status.label}</StatusPill>
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/knowledge-sources/${source.id}`}>
              <Open20Regular className="h-4 w-4" />
              <span className="sr-only">View source details</span>
            </Link>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center justify-between text-xs text-fg-subtle">
          <div className="flex flex-wrap items-center gap-3">
            {typeof source.docCount === 'number' && (
              <span className="inline-flex items-center rounded-full border border-glass-border bg-glass-surface px-2.5 py-1 text-xs font-medium text-fg-muted">
                {source.docCount.toLocaleString()} documents
              </span>
            )}
            {source.lastUpdated && (
              <span>Updated {formatRelativeTime(source.lastUpdated)}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}