/**
 * Knowledge Source Status Types
 * Based on Azure AI Search 2025-11-01-preview API
 */

export type SynchronizationStatus = 'active' | 'idle' | 'error' | 'notStarted'

export interface SynchronizationState {
  startTime?: string
  endTime?: string
  itemsProcessed?: number
  itemsFailed?: number
  itemsSkipped?: number
  errorMessage?: string
}

export interface KnowledgeSourceStatus {
  name: string
  synchronizationStatus: SynchronizationStatus
  synchronizationInterval?: string
  currentSynchronizationState?: SynchronizationState
  lastSynchronizationState?: SynchronizationState
  totalSynchronization?: number
  averageSynchronizationDuration?: string
  averageItemsProcessedPerSynchronization?: number
}

/**
 * Helper to get display-friendly status text
 */
export function getStatusLabel(status: SynchronizationStatus): string {
  switch (status) {
    case 'active':
      return 'Syncing'
    case 'idle':
      return 'Ready'
    case 'error':
      return 'Error'
    case 'notStarted':
      return 'Not Started'
    default:
      return 'Unknown'
  }
}

/**
 * Helper to get status color variant
 */
export function getStatusVariant(status: SynchronizationStatus): 'default' | 'success' | 'destructive' | 'secondary' {
  switch (status) {
    case 'active':
      return 'secondary'
    case 'idle':
      return 'success'
    case 'error':
      return 'destructive'
    case 'notStarted':
      return 'default'
    default:
      return 'default'
  }
}

/**
 * Helper to determine if knowledge source is syncing
 */
export function isSyncing(status: KnowledgeSourceStatus): boolean {
  return status.synchronizationStatus === 'active'
}

/**
 * Helper to determine if knowledge source has errors
 */
export function hasErrors(status: KnowledgeSourceStatus): boolean {
  return (
    status.synchronizationStatus === 'error' ||
    (status.currentSynchronizationState?.itemsFailed ?? 0) > 0 ||
    (status.lastSynchronizationState?.itemsFailed ?? 0) > 0
  )
}
