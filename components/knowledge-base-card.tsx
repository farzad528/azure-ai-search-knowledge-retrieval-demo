import * as React from 'react'
import { Play20Regular, Settings20Regular, MoreHorizontal20Regular } from '@fluentui/react-icons'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AgentAvatar } from '@/components/agent-avatar'
import { StatusPill } from '@/components/shared/status-pill'
import { formatRelativeTime } from '@/lib/utils'
import { useEditMode, withEditMode } from '@/lib/edit-mode'

export interface KnowledgeBaseSummary {
  id: string
  name: string
  model?: string
  sources: string[]
  status?: string
  lastRun?: string
  createdBy?: string
  sourceDetails?: { name: string; kind: string }[]
}

interface KnowledgeBaseCardProps {
  knowledgeBase: KnowledgeBaseSummary
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'neutral' | 'danger' }> = {
  active: { label: 'Active', variant: 'success' },
  idle: { label: 'Idle', variant: 'neutral' },
  error: { label: 'Error', variant: 'danger' },
}

export function KnowledgeBaseCard({ knowledgeBase }: KnowledgeBaseCardProps) {
  const { isEditMode } = useEditMode()
  const status = statusConfig[knowledgeBase.status || ''] || statusConfig.idle

  if (!knowledgeBase.name) {
    return null
  }

  const knowledgeBaseId = knowledgeBase.id || knowledgeBase.name

  return (
    <Card className="transition-shadow duration-base ease-out hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <AgentAvatar size={40} iconSize={20} variant="subtle" title={knowledgeBase.name} />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold tracking-tight text-fg-default">
                {knowledgeBase.name}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                {knowledgeBase.model && (
                  <span className="rounded-full border border-glass-border bg-glass-surface px-2 py-1 text-xs font-medium uppercase tracking-wide text-fg-muted">
                    {knowledgeBase.model}
                  </span>
                )}
                <StatusPill variant={status.variant}>{status.label}</StatusPill>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href={withEditMode(`/knowledge-bases/${knowledgeBaseId}`)}>
                <Settings20Regular className="h-4 w-4" />
                <span className="sr-only">{isEditMode ? 'Configure' : 'View'} knowledge base</span>
              </Link>
            </Button>
            {isEditMode && (
              <Button variant="ghost" size="icon">
                <MoreHorizontal20Regular className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {knowledgeBase.sources?.length > 0 && (
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-fg-subtle">Knowledge sources</div>
            <div className="flex flex-wrap gap-2">
              {(knowledgeBase.sourceDetails ? knowledgeBase.sourceDetails.map((sd) => sd.name) : knowledgeBase.sources)
                .slice(0, 3)
                .map((name, index) => (
                  <span
                    key={`${knowledgeBaseId}-source-${index}`}
                    className="inline-flex items-center rounded-full border border-glass-border bg-glass-surface px-2.5 py-1 text-xs font-medium text-fg-muted"
                  >
                    {name}
                  </span>
                ))}
              {knowledgeBase.sources.length > 3 && (
                <span className="inline-flex items-center rounded-full border border-glass-border bg-glass-surface px-2.5 py-1 text-xs font-medium text-fg-muted">
                  +{knowledgeBase.sources.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 text-xs text-fg-subtle">
          <div>
            {knowledgeBase.lastRun ? (
              <>Last run {formatRelativeTime(knowledgeBase.lastRun)}</>
            ) : (
              'Never run'
            )}
            {knowledgeBase.createdBy && <> • Created by {knowledgeBase.createdBy}</>}
          </div>

          <Button size="sm" asChild>
            <Link href={`/playground?knowledgeBase=${knowledgeBaseId}`}>
              <Play20Regular className="h-3 w-3 mr-2" />
              Try now
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
