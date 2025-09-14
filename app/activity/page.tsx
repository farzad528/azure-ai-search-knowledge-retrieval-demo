import { PageHeader } from '@/components/shared/page-header'

export default function ActivityPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Activity"
        description="Monitor knowledge retrieval activity and usage metrics."
      />
      
      <div className="text-center py-12">
        <p className="text-fg-muted">Activity tracking coming soon...</p>
      </div>
    </div>
  )
}