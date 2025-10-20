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
