import * as React from 'react'
import { Database20Regular, Globe20Regular, FolderOpen20Regular, Open20Regular } from '@fluentui/react-icons'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'

type KnowledgeSource = {
  id: string
  name: string
  kind: 'searchIndex' | 'web' | 'azureBlob'
  docCount?: number
  lastUpdated?: string
  status?: string
}

interface KnowledgeSourceCardProps {
  source: KnowledgeSource
}

const kindConfig = {
  searchIndex: {
    icon: Database20Regular,
    label: 'Search Index',
    color: 'text-accent'
  },
  web: {
    icon: Globe20Regular,
    label: 'Web',
    color: 'text-status-info'
  },
  azureBlob: {
    icon: FolderOpen20Regular,
    label: 'Azure Blob',
    color: 'text-status-success'
  }
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-status-success' },
  syncing: { label: 'Syncing', color: 'bg-status-warning' },
  error: { label: 'Error', color: 'bg-status-danger' },
  inactive: { label: 'Inactive', color: 'bg-fg-muted' },
}

export function KnowledgeSourceCard({ source }: KnowledgeSourceCardProps) {
  const config = kindConfig[source.kind]
  const Icon = config.icon
  const status = statusConfig[source.status as keyof typeof statusConfig] || statusConfig.active

  return (
    <Card className="hover:elevation-md transition-shadow duration-fast">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={cn('p-2 rounded-md bg-bg-subtle', config.color)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-fg-default truncate">
                {source.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-fg-muted">
                  {config.label}
                </span>
                <span
                  className={cn(
                    'inline-block w-2 h-2 rounded-full',
                    status.color
                  )}
                />
                <span className="text-xs text-fg-muted">
                  {status.label}
                </span>
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
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {source.docCount !== undefined && (
              <div>
                <span className="font-medium text-fg-default">
                  {source.docCount.toLocaleString()}
                </span>
                <span className="text-fg-muted ml-1">documents</span>
              </div>
            )}
            {source.lastUpdated && (
              <div className="text-fg-muted">
                Updated {formatRelativeTime(source.lastUpdated)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}