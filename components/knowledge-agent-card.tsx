import * as React from 'react'
import { Bot20Regular, Play20Regular, Settings20Regular, MoreHorizontal20Regular } from '@fluentui/react-icons'
import { AgentAvatar } from '@/components/agent-avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'
import { SourceKindIcon } from '@/components/source-kind-icon'
import { aggregateKinds, SourceKind } from '@/lib/sourceKinds'
import { Tooltip } from '@/components/ui/tooltip'

type KnowledgeAgent = {
  id: string
  name: string
  model?: string
  sources: string[]
  sourceDetails?: { name: string; kind: string }[]
  status?: string
  lastRun?: string
  createdBy?: string
}

interface KnowledgeAgentCardProps {
  agent: KnowledgeAgent
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-status-success' },
  idle: { label: 'Idle', color: 'bg-fg-muted' },
  error: { label: 'Error', color: 'bg-status-danger' },
}

export function KnowledgeAgentCard({ agent }: KnowledgeAgentCardProps) {
  const status = statusConfig[agent.status as keyof typeof statusConfig] || statusConfig.idle
  console.log('Agent card rendering for:', agent.name, 'with ID:', agent.id)
  console.log('Full agent object:', JSON.stringify(agent, null, 2))

  // Agents use name as ID, so ensure we have at least a name
  if (!agent.name) {
    console.error('Agent name is missing:', agent)
    return null
  }

  return (
    <Card className="hover:elevation-md transition-shadow duration-fast">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <AgentAvatar size={40} iconSize={20} variant="subtle" title={agent.name} />
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-fg-default truncate">
                {agent.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {agent.model && (
                  <span className="text-sm text-fg-muted">
                    {agent.model}
                  </span>
                )}
                <span
                  className={cn(
                    'inline-block w-2 h-2 rounded-full',
                    status.color
                  )}
                />
                <span className="text-xs text-fg-muted">
                  {status.label}
                </span>
                {agent.sourceDetails && agent.sourceDetails.length > 0 && (
                  <div className="flex items-center gap-1 ml-2">
                    {Object.entries(aggregateKinds(agent.sourceDetails as any))
                      .filter(([_, count]) => count > 0)
                      .map(([kind, count]) => (
                        <Tooltip key={kind} content={`${count} ${kind} source${count>1?'s':''}`}>
                          <SourceKindIcon kind={kind as SourceKind} size={16} boxSize={28} />
                        </Tooltip>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/knowledge-agents/${agent.id || agent.name}`}>
                <Settings20Regular className="h-4 w-4" />
                <span className="sr-only">Edit agent</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal20Regular className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Sources */}
        {agent.sources?.length > 0 && (
          <div>
            <div className="text-xs text-fg-muted mb-2">Knowledge sources</div>
            <div className="flex flex-wrap gap-1">
              {(agent.sourceDetails ? agent.sourceDetails.map(sd => ({ name: sd.name, kind: sd.kind })) : agent.sources.map(n => ({ name: n, kind: 'searchIndex' })))
                .slice(0,3)
                .map((sd, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded-pill bg-bg-subtle text-xs font-medium text-fg-muted">
                    <SourceKindIcon kind={sd.kind} size={14} boxSize={22} variant="plain" /> {sd.name}
                  </span>
                ))}
              {agent.sources.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-pill bg-bg-subtle text-xs font-medium text-fg-muted">
                  +{agent.sources.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-fg-muted">
            {agent.lastRun ? (
              <>Last run {formatRelativeTime(agent.lastRun)}</>
            ) : (
              'Never run'
            )}
            {agent.createdBy && (
              <> • Created by {agent.createdBy}</>
            )}
          </div>
          
          <Button size="sm" asChild>
            <Link href={`/playground?agent=${agent.id || agent.name}`}>
              <Play20Regular className="h-3 w-3 mr-2" />
              Try now
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}