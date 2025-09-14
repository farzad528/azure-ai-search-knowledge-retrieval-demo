# Component Prop Contracts

## Shared Components

### PageHeader

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | ✅ | - | Main page title |
| description | string | ❌ | - | Optional page description |
| status | {label: string, variant: 'success'\|'warning'\|'danger'\|'info'} | ❌ | - | Status badge |
| primaryAction | {label: string, href?: string, onClick?: () => void, icon?: Component} | ❌ | - | Main action button |
| backButton | {href: string, label?: string} | ❌ | - | Back navigation |
| className | string | ❌ | - | Additional CSS classes |

### DataList

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| data | T[] | ✅ | - | Array of items to render |
| renderItem | (item: T, index: number) => ReactNode | ✅ | - | Function to render each item |
| loading | boolean | ❌ | false | Show loading skeletons |
| emptyState | ReactNode | ❌ | - | Content when data is empty |
| className | string | ❌ | - | Additional CSS classes |
| itemClassName | string | ❌ | - | Classes for each item |

### DataTable

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| data | T[] | ✅ | - | Array of table data |
| columns | Column<T>[] | ✅ | - | Column definitions |
| loading | boolean | ❌ | false | Show loading state |
| emptyState | ReactNode | ❌ | - | Content when data is empty |
| onRowClick | (item: T) => void | ❌ | - | Row click handler |
| className | string | ❌ | - | Additional CSS classes |

### EmptyState

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | ✅ | - | Empty state title |
| description | string | ❌ | - | Empty state description |
| icon | Component | ❌ | - | Icon to display |
| action | {label: string, onClick: () => void, variant?: string} | ❌ | - | Action button |
| className | string | ❌ | - | Additional CSS classes |

### ErrorState

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | ✅ | - | Error title |
| description | string | ❌ | - | Error description |
| action | {label: string, onClick: () => void, variant?: string} | ❌ | - | Retry action |
| className | string | ❌ | - | Additional CSS classes |

### LoadingSkeleton

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| className | string | ❌ | - | CSS classes for sizing/positioning |

### KeyValue

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| items | KeyValueItem[] | ✅ | - | Array of key-value pairs |
| layout | 'vertical' \| 'horizontal' | ❌ | 'vertical' | Layout direction |
| className | string | ❌ | - | Additional CSS classes |

### StatusPill

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| variant | 'success'\|'warning'\|'danger'\|'info'\|'neutral' | ❌ | 'neutral' | Visual style |
| children | ReactNode | ✅ | - | Content to display |
| className | string | ❌ | - | Additional CSS classes |

### FormFrame

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | ✅ | - | Form title |
| description | string | ❌ | - | Form description |
| children | ReactNode | ✅ | - | Form content |
| actions | FormAction[] | ✅ | - | Bottom action buttons |
| className | string | ❌ | - | Additional CSS classes |

### ReferenceList

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| references | Reference[] | ✅ | - | Array of references |
| maxItems | number | ❌ | - | Maximum items to show |
| showScores | boolean | ❌ | false | Show relevance scores |
| className | string | ❌ | - | Additional CSS classes |

### ActivityTimeline

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| items | ActivityItem[] | ✅ | - | Array of activities |
| className | string | ❌ | - | Additional CSS classes |

## Domain Components

### KnowledgeSourceCard

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| source | KnowledgeSource | ✅ | - | Knowledge source data |

### KnowledgeAgentCard

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| agent | KnowledgeAgent | ✅ | - | Knowledge agent data |

## UI Components

### Button

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| variant | 'default'\|'destructive'\|'outline'\|'secondary'\|'ghost'\|'link' | ❌ | 'default' | Visual style |
| size | 'default'\|'sm'\|'lg'\|'icon' | ❌ | 'default' | Button size |
| asChild | boolean | ❌ | false | Render as child element |

### Input

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| type | string | ❌ | 'text' | Input type |
| className | string | ❌ | - | Additional CSS classes |

### Textarea

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| className | string | ❌ | - | Additional CSS classes |

### Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| className | string | ❌ | - | Additional CSS classes |

### Tabs, TabsList, TabsTrigger, TabsContent

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | string | ✅ (Tabs) | - | Active tab value |
| onValueChange | (value: string) => void | ✅ (Tabs) | - | Tab change handler |
| className | string | ❌ | - | Additional CSS classes |

## Type Definitions

```typescript
interface KnowledgeSource {
  id: string
  name: string
  kind: 'searchIndex' | 'web' | 'azureBlob'
  docCount?: number
  lastUpdated?: string
  status?: string
}

interface KnowledgeAgent {
  id: string
  name: string
  model?: string
  sources: string[]
  status?: string
  lastRun?: string
  createdBy?: string
}

interface Reference {
  id: string
  source: string
  title: string
  excerpt: string
  url?: string
  score?: number
}

interface ActivityItem {
  id: string
  type: string
  title: string
  description?: string
  timestamp: Date | string
  icon?: Component
  status?: 'success' | 'warning' | 'danger' | 'info'
  metadata?: Record<string, any>
}

interface KeyValueItem {
  key: string
  value: ReactNode
  copyable?: boolean
}

interface FormAction {
  label: string
  onClick: () => void
  variant?: 'default' | 'outline' | 'ghost'
  loading?: boolean
  disabled?: boolean
}
```