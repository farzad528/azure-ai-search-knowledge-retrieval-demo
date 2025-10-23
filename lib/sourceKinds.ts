export enum SourceKind {
  SearchIndex = 'searchIndex',
  AzureBlob = 'azureBlob',
  Web = 'web',
  IndexedOneLake = 'indexedOneLake',
  RemoteSharePoint = 'remoteSharePoint',
  IndexedSharePoint = 'indexedSharePoint'
}

export const SOURCE_KIND_LABEL: Record<SourceKind, string> = {
  [SourceKind.SearchIndex]: 'Azure AI Search Index',
  [SourceKind.AzureBlob]: 'Azure Blob Storage',
  [SourceKind.Web]: 'Web',
  [SourceKind.IndexedOneLake]: 'Microsoft OneLake',
  [SourceKind.RemoteSharePoint]: 'SharePoint (Remote)',
  [SourceKind.IndexedSharePoint]: 'SharePoint (Indexed)'
}

export const SOURCE_KIND_ICON_PATH: Record<SourceKind, string> = {
  [SourceKind.SearchIndex]: '/icons/search_icon.svg',
  [SourceKind.AzureBlob]: '/icons/blob.svg',
  [SourceKind.Web]: '/icons/web.svg',
  [SourceKind.IndexedOneLake]: '/icons/onelake-color.svg',
  [SourceKind.RemoteSharePoint]: '/icons/sharepoint.svg',
  [SourceKind.IndexedSharePoint]: '/icons/sharepoint.svg'
}

export type SourceDetail = { name: string; kind: SourceKind }

export function getSourceKindLabel(kind: string): string {
  const normalized = kind.toLowerCase()
  const enumValues = Object.values(SourceKind)
  const matchedEnum = enumValues.find(ev => ev.toLowerCase() === normalized)
  
  if (matchedEnum) {
    return SOURCE_KIND_LABEL[matchedEnum as SourceKind]
  }
  
  // Fallback to capitalized kind name
  return kind.charAt(0).toUpperCase() + kind.slice(1)
}

export function aggregateKinds(details: SourceDetail[] | undefined) {
  const counts: Record<SourceKind, number> = {
    [SourceKind.SearchIndex]: 0,
    [SourceKind.AzureBlob]: 0,
    [SourceKind.Web]: 0,
    [SourceKind.IndexedOneLake]: 0,
    [SourceKind.RemoteSharePoint]: 0,
    [SourceKind.IndexedSharePoint]: 0
  }
  if (!details) return counts
  for (const d of details) {
    if (counts[d.kind] !== undefined) counts[d.kind]++
  }
  return counts
}

/**
 * Runtime Properties Configuration for Knowledge Sources
 * Based on Azure AI Search Knowledge Agents API (2025-11-01-Preview)
 */

export type KnowledgeSourceKind = SourceKind | 'mcpTool' | 'unknown'

export type PropertyType = 'boolean' | 'number' | 'string' | 'headers'

export interface PropertyConfig {
  name: string
  label: string
  description: string
  type: PropertyType
  defaultValue?: any
  min?: number
  max?: number
  step?: number
  placeholder?: string
  required?: boolean
}

/**
 * Base runtime properties available for ALL knowledge source kinds
 */
const baseProperties: PropertyConfig[] = [
  {
    name: 'alwaysQuerySource',
    label: 'Always Query Source',
    description: 'Query this source for every request',
    type: 'boolean',
    defaultValue: false
  },
  {
    name: 'includeReferences',
    label: 'Include References',
    description: 'Return reference citations in the response',
    type: 'boolean',
    defaultValue: true
  },
  {
    name: 'includeReferenceSourceData',
    label: 'Include Source Data',
    description: 'Return full source snippets with references',
    type: 'boolean',
    defaultValue: false
  },
  {
    name: 'rerankerThreshold',
    label: 'Reranker Threshold',
    description: 'Minimum reranker score for results (0.0-5.0)',
    type: 'number',
    min: 0,
    max: 5,
    step: 0.1,
    placeholder: '1.0'
  },
  {
    name: 'maxSubQueries',
    label: 'Max Sub-Queries',
    description: 'Maximum number of sub-queries to generate',
    type: 'number',
    min: 1,
    max: 20,
    step: 1,
    placeholder: '5'
  }
]

/**
 * Get runtime property configuration for a knowledge source kind
 */
export function getRuntimeProperties(kind: string): PropertyConfig[] {
  // All kinds get base properties
  return [...baseProperties]
}

/**
 * Get header guidance based on knowledge source kind
 */
export function getHeaderGuidance(kind: string): {
  required: boolean
  headerName?: string
  placeholder?: string
  description: string
} {
  switch (kind) {
    case 'remoteSharePoint':
    case SourceKind.RemoteSharePoint:
      return {
        required: true,
        headerName: 'x-ms-query-source-authorization',
        placeholder: 'eyJ0eXAiOiJKV1QiLCJh...',
        description: 'Azure AD token with https://search.azure.com audience. Required for Remote SharePoint authentication.'
      }
    
    case 'indexedSharePoint':
    case SourceKind.IndexedSharePoint:
      return {
        required: false,
        headerName: 'x-ms-query-source-authorization',
        placeholder: 'eyJ0eXAiOiJKV1QiLCJh...',
        description: 'Azure AD token with https://search.azure.com audience. Optional - use for ACL-based access control.'
      }
    
    case 'mcpTool':
      return {
        required: true,
        headerName: 'Authorization',
        placeholder: 'MwcToken eyJ0eXAiOiJKV1QiLCJh...',
        description: 'MCP server authorization token. Format depends on MCP server requirements.'
      }
    
    default:
      return {
        required: false,
        description: 'Custom headers for authentication or special requirements'
      }
  }
}

/**
 * Validate property value based on its configuration
 */
export function validatePropertyValue(
  property: PropertyConfig,
  value: any
): { valid: boolean; error?: string } {
  if (property.required && (value === null || value === undefined || value === '')) {
    return { valid: false, error: `${property.label} is required` }
  }

  if (property.type === 'number' && value !== null && value !== undefined && value !== '') {
    const num = typeof value === 'number' ? value : parseFloat(value)
    
    if (isNaN(num)) {
      return { valid: false, error: `${property.label} must be a number` }
    }
    
    if (property.min !== undefined && num < property.min) {
      return { valid: false, error: `${property.label} must be at least ${property.min}` }
    }
    
    if (property.max !== undefined && num > property.max) {
      return { valid: false, error: `${property.label} must be at most ${property.max}` }
    }
  }

  return { valid: true }
}

/**
 * Get display name for a knowledge source kind
 */
export function getKindDisplayName(kind: string): string {
  if (kind === 'mcpTool') return 'MCP Tool'
  if (kind === 'unknown') return 'Unknown'
  
  // Try to find in SourceKind enum
  const normalized = kind.toLowerCase()
  const enumValues = Object.values(SourceKind)
  const matchedEnum = enumValues.find(ev => ev.toLowerCase() === normalized)
  
  if (matchedEnum) {
    return SOURCE_KIND_LABEL[matchedEnum as SourceKind]
  }
  
  // Fallback to capitalized kind name
  return kind.charAt(0).toUpperCase() + kind.slice(1)
}
