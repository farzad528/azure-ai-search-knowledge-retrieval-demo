import { PageHeader } from '@/components/shared/page-header'

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Configure your application preferences and account settings."
      />
      
      <div className="text-center py-12">
        <p className="text-fg-muted">Settings panel coming soon...</p>
      </div>
    </div>
  )
}