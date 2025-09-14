export enum SourceKind {
  SearchIndex = 'searchIndex',
  AzureBlob = 'azureBlob',
  Web = 'web'
}

export const SOURCE_KIND_LABEL: Record<SourceKind, string> = {
  [SourceKind.SearchIndex]: 'Search Index',
  [SourceKind.AzureBlob]: 'Azure Blob',
  [SourceKind.Web]: 'Web'
}

export const SOURCE_KIND_ICON_PATH: Record<SourceKind, string> = {
  [SourceKind.SearchIndex]: '/icons/search_icon.svg',
  [SourceKind.AzureBlob]: '/icons/blob.svg',
  [SourceKind.Web]: '/icons/web.svg'
}

export type SourceDetail = { name: string; kind: SourceKind }

export function aggregateKinds(details: SourceDetail[] | undefined) {
  const counts: Record<SourceKind, number> = {
    [SourceKind.SearchIndex]: 0,
    [SourceKind.AzureBlob]: 0,
    [SourceKind.Web]: 0
  }
  if (!details) return counts
  for (const d of details) {
    if (counts[d.kind] !== undefined) counts[d.kind]++
  }
  return counts
}
