'use client'

import * as React from 'react'
import { Eye20Regular, EyeOff20Regular, Add20Regular, Dismiss20Regular, ChevronDown20Regular, ChevronUp20Regular } from '@fluentui/react-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type KnowledgeSourceParam = {
  knowledgeSourceName: string
  kind: string
  alwaysQuerySource?: boolean
  includeReferences?: boolean
  includeReferenceSourceData?: boolean
  rerankerThreshold?: number | null
  maxSubQueries?: number | null
  headers?: Record<string, string>
}

interface RuntimeSettings {
  knowledgeSourceParams: KnowledgeSourceParam[]
  outputMode?: 'answerSynthesis' | 'extractiveData'
  reasoningEffort?: 'low' | 'medium' | 'high'
}

type KnowledgeSource = {
  name: string
  kind?: string
  includeReferences?: boolean
  includeReferenceSourceData?: boolean | null
  alwaysQuerySource?: boolean | null
  maxSubQueries?: number | null
  rerankerThreshold?: number | null
}

interface RuntimeSettingsPanelProps {
  knowledgeSources: KnowledgeSource[]
  settings: RuntimeSettings
  onSettingsChange: (settings: RuntimeSettings) => void
  hasWebSource: boolean
}

export function RuntimeSettingsPanel({
  knowledgeSources,
  settings,
  onSettingsChange,
  hasWebSource
}: RuntimeSettingsPanelProps) {
  const [expandedSources, setExpandedSources] = React.useState<Set<string>>(new Set())
  const [showTokens, setShowTokens] = React.useState<Record<string, boolean>>({})

  // Initialize settings from knowledge base configuration
  React.useEffect(() => {
    if (settings.knowledgeSourceParams.length === 0 && knowledgeSources.length > 0) {
      const initialParams = knowledgeSources.map(ks => {
        // Detect kind from name pattern if not provided
        let kind = ks.kind || 'unknown'
        if (kind === 'unknown' && ks.name) {
          if (ks.name.toLowerCase().includes('mcp-')) {
            kind = 'mcpTool'
          } else if (ks.name.toLowerCase().includes('web')) {
            kind = 'web'
          } else if (ks.name.toLowerCase().includes('blob')) {
            kind = 'azureBlob'
          } else if (ks.name.toLowerCase().includes('sharepoint')) {
            kind = ks.name.toLowerCase().includes('indexed') ? 'indexedSharePoint' : 'remoteSharePoint'
          } else if (ks.name.toLowerCase().includes('onelake')) {
            kind = 'indexedOneLake'
          }
        }
        
        return {
          knowledgeSourceName: ks.name,
          kind: kind,
          alwaysQuerySource: ks.alwaysQuerySource ?? false,
          includeReferences: ks.includeReferences ?? true,
          includeReferenceSourceData: ks.includeReferenceSourceData ?? false,
          rerankerThreshold: ks.rerankerThreshold,
          maxSubQueries: ks.maxSubQueries,
          headers: {}
        }
      })
      onSettingsChange({
        ...settings,
        knowledgeSourceParams: initialParams,
        outputMode: hasWebSource ? 'answerSynthesis' : (settings.outputMode || 'answerSynthesis'),
        reasoningEffort: settings.reasoningEffort || 'low'
      })
    }
  }, [knowledgeSources, hasWebSource])

  const toggleSourceExpanded = (sourceName: string) => {
    setExpandedSources(prev => {
      const next = new Set(prev)
      if (next.has(sourceName)) {
        next.delete(sourceName)
      } else {
        next.add(sourceName)
      }
      return next
    })
  }

  const toggleTokenVisibility = (sourceName: string, headerKey: string) => {
    const key = `${sourceName}-${headerKey}`
    setShowTokens(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const updateSourceParam = (sourceName: string, updates: Partial<KnowledgeSourceParam>) => {
    const newParams = settings.knowledgeSourceParams.map(param =>
      param.knowledgeSourceName === sourceName
        ? { ...param, ...updates }
        : param
    )
    onSettingsChange({ ...settings, knowledgeSourceParams: newParams })
  }

  const addHeader = (sourceName: string) => {
    const param = settings.knowledgeSourceParams.find(p => p.knowledgeSourceName === sourceName)
    if (param) {
      updateSourceParam(sourceName, {
        headers: { ...param.headers, '': '' }
      })
    }
  }

  const updateHeader = (sourceName: string, oldKey: string, newKey: string, value: string) => {
    const param = settings.knowledgeSourceParams.find(p => p.knowledgeSourceName === sourceName)
    if (param && param.headers) {
      const newHeaders = { ...param.headers }
      if (oldKey !== newKey) {
        delete newHeaders[oldKey]
      }
      newHeaders[newKey] = value
      updateSourceParam(sourceName, { headers: newHeaders })
    }
  }

  const removeHeader = (sourceName: string, key: string) => {
    const param = settings.knowledgeSourceParams.find(p => p.knowledgeSourceName === sourceName)
    if (param && param.headers) {
      const newHeaders = { ...param.headers }
      delete newHeaders[key]
      updateSourceParam(sourceName, { headers: newHeaders })
    }
  }

  const isMCPSource = (kind: string) => kind === 'mcpTool'

  return (
    <div className="space-y-6">
      {/* Output Configuration */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium border-b border-stroke-divider pb-2">Output Configuration</h4>
        
        {/* Output Mode */}
        <div className="space-y-2">
          <label htmlFor="output-mode" className="text-xs font-medium text-fg-default">
            Output Mode
          </label>
          <Select
            value={settings.outputMode || 'answerSynthesis'}
            onValueChange={(value: 'answerSynthesis' | 'extractiveData') => {
              onSettingsChange({ ...settings, outputMode: value })
            }}
            disabled={hasWebSource}
          >
            <SelectTrigger id="output-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="answerSynthesis">Answer Synthesis</SelectItem>
              <SelectItem value="extractiveData">Extractive Data</SelectItem>
            </SelectContent>
          </Select>
          {hasWebSource && (
            <p className="text-xs text-status-warning">
              Web sources require Answer Synthesis mode
            </p>
          )}
        </div>

        {/* Reasoning Effort */}
        <div className="space-y-2">
          <label htmlFor="reasoning-effort" className="text-xs font-medium text-fg-default">
            Reasoning Effort
          </label>
          <Select
            value={settings.reasoningEffort || 'low'}
            onValueChange={(value: 'low' | 'medium' | 'high') => {
              // Prevent selection of 'high' as it's not supported
              if (value === 'high') return
              onSettingsChange({ ...settings, reasoningEffort: value })
            }}
          >
            <SelectTrigger id="reasoning-effort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high" className="opacity-50 cursor-not-allowed" aria-disabled="true">
                High (Not Supported)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-fg-muted">
            Controls retrieval reasoning complexity
          </p>
        </div>
      </div>

      {/* Knowledge Source Parameters */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium border-b border-stroke-divider pb-2">
          Knowledge Source Parameters
        </h4>

        {settings.knowledgeSourceParams.map((param) => {
          const isExpanded = expandedSources.has(param.knowledgeSourceName)
          const isMCP = isMCPSource(param.kind)

          return (
            <div
              key={param.knowledgeSourceName}
              className="border border-stroke-divider rounded-md overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => toggleSourceExpanded(param.knowledgeSourceName)}
                className="w-full p-3 flex items-center justify-between bg-bg-subtle hover:bg-bg-hover transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-fg-default">
                    {param.knowledgeSourceName}
                  </div>
                  <div className="text-xs text-fg-muted px-2 py-0.5 bg-bg-card rounded">
                    {param.kind}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp20Regular className="h-4 w-4 text-fg-muted" />
                ) : (
                  <ChevronDown20Regular className="h-4 w-4 text-fg-muted" />
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4 space-y-4 bg-bg-card">
                  {/* Boolean Toggles */}
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div>
                        <div className="text-xs font-medium text-fg-default">Always Query Source</div>
                        <div className="text-xs text-fg-muted">Query this source for every request</div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={param.alwaysQuerySource}
                        onClick={() => updateSourceParam(param.knowledgeSourceName, {
                          alwaysQuerySource: !param.alwaysQuerySource
                        })}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                          param.alwaysQuerySource ? "bg-accent" : "bg-bg-subtle border border-stroke-divider"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-3 w-3 transform rounded-full bg-bg-canvas shadow transition-transform",
                            param.alwaysQuerySource ? "translate-x-5" : "translate-x-1"
                          )}
                        />
                      </button>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                      <div>
                        <div className="text-xs font-medium text-fg-default">Include References</div>
                        <div className="text-xs text-fg-muted">Return reference citations</div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={param.includeReferences}
                        onClick={() => updateSourceParam(param.knowledgeSourceName, {
                          includeReferences: !param.includeReferences
                        })}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                          param.includeReferences ? "bg-accent" : "bg-bg-subtle border border-stroke-divider"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-3 w-3 transform rounded-full bg-bg-canvas shadow transition-transform",
                            param.includeReferences ? "translate-x-5" : "translate-x-1"
                          )}
                        />
                      </button>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                      <div>
                        <div className="text-xs font-medium text-fg-default">Include Source Data</div>
                        <div className="text-xs text-fg-muted">Return full source snippets</div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={param.includeReferenceSourceData}
                        onClick={() => updateSourceParam(param.knowledgeSourceName, {
                          includeReferenceSourceData: !param.includeReferenceSourceData
                        })}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                          param.includeReferenceSourceData ? "bg-accent" : "bg-bg-subtle border border-stroke-divider"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-3 w-3 transform rounded-full bg-bg-canvas shadow transition-transform",
                            param.includeReferenceSourceData ? "translate-x-5" : "translate-x-1"
                          )}
                        />
                      </button>
                    </label>
                  </div>

                  {/* Number Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor={`reranker-${param.knowledgeSourceName}`} className="text-xs font-medium text-fg-default">
                        Reranker Threshold
                      </label>
                      <Input
                        id={`reranker-${param.knowledgeSourceName}`}
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={param.rerankerThreshold ?? ''}
                        onChange={(e) => updateSourceParam(param.knowledgeSourceName, {
                          rerankerThreshold: e.target.value ? parseFloat(e.target.value) : null
                        })}
                        placeholder="0.5"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor={`max-queries-${param.knowledgeSourceName}`} className="text-xs font-medium text-fg-default">
                        Max Sub-Queries
                      </label>
                      <Input
                        id={`max-queries-${param.knowledgeSourceName}`}
                        type="number"
                        min="1"
                        value={param.maxSubQueries ?? ''}
                        onChange={(e) => updateSourceParam(param.knowledgeSourceName, {
                          maxSubQueries: e.target.value ? parseInt(e.target.value) : null
                        })}
                        placeholder="5"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* Custom Headers (MCP Sources) */}
                  {isMCP && (
                    <div className="space-y-2 pt-3 border-t border-stroke-divider">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-fg-default">Custom Headers</label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addHeader(param.knowledgeSourceName)}
                          className="h-6 text-xs"
                        >
                          <Add20Regular className="h-3 w-3 mr-1" />
                          Add Header
                        </Button>
                      </div>

                      {param.headers && Object.entries(param.headers).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(param.headers).map(([key, value]) => {
                            const isAuthHeader = key.toLowerCase() === 'authorization'
                            const tokenKey = `${param.knowledgeSourceName}-${key}`
                            const showToken = showTokens[tokenKey] || false

                            return (
                              <div key={key} className="flex gap-2 items-start">
                                <Input
                                  placeholder="Header Name"
                                  value={key}
                                  onChange={(e) => updateHeader(param.knowledgeSourceName, key, e.target.value, value)}
                                  className="h-8 text-xs flex-1"
                                />
                                <div className="flex-1 relative">
                                  <Input
                                    type={isAuthHeader && !showToken ? 'password' : 'text'}
                                    placeholder={isAuthHeader ? 'MwcToken ey...' : 'Header Value'}
                                    value={value}
                                    onChange={(e) => updateHeader(param.knowledgeSourceName, key, key, e.target.value)}
                                    className="h-8 text-xs pr-8"
                                  />
                                  {isAuthHeader && (
                                    <button
                                      type="button"
                                      onClick={() => toggleTokenVisibility(param.knowledgeSourceName, key)}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg-default"
                                    >
                                      {showToken ? (
                                        <EyeOff20Regular className="h-4 w-4" />
                                      ) : (
                                        <Eye20Regular className="h-4 w-4" />
                                      )}
                                    </button>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeHeader(param.knowledgeSourceName, key)}
                                  className="h-8 w-8 flex-shrink-0"
                                >
                                  <Dismiss20Regular className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-fg-muted italic">No custom headers configured</p>
                      )}

                      {isMCP && (
                        <p className="text-xs text-fg-muted mt-2">
                          💡 MCP sources may require custom headers like Authorization tokens
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}