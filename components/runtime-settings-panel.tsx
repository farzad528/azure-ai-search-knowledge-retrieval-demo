'use client'

import * as React from 'react'
import { Settings20Regular, Dismiss20Regular, Filter20Regular, Globe20Regular, Database20Regular, FolderOpen20Regular } from '@fluentui/react-icons'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField, FormLabel, FormControl, FormDescription } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface RuntimeSettings {
  retrievalReasoningEffort?: 'low' | 'medium' | 'high'
  outputMode?: 'extractiveData' | 'answerSynthesis'
  knowledgeSourceParams?: Array<{
    kind: 'indexedOneLake' | 'searchIndex' | 'azureBlob' | 'remoteSharePoint' | 'indexedSharePoint' | 'web'
    knowledgeSourceName: string
    filterAddOn?: string
    freshness?: 'day' | 'week' | 'month'
  }>
}

interface RuntimeSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  settings: RuntimeSettings
  onSettingsChange: (settings: RuntimeSettings) => void
  knowledgeSources: Array<{
    name: string
    kind: 'indexedOneLake' | 'searchIndex' | 'azureBlob' | 'remoteSharePoint' | 'indexedSharePoint' | 'web'
  }>
  className?: string
}

const kindIcons = {
  indexedOneLake: Database20Regular,
  searchIndex: Database20Regular,
  azureBlob: FolderOpen20Regular,
  remoteSharePoint: FolderOpen20Regular,
  indexedSharePoint: Database20Regular,
  web: Globe20Regular,
}

export function RuntimeSettingsPanel({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  knowledgeSources,
  className
}: RuntimeSettingsPanelProps) {
  const [localSettings, setLocalSettings] = React.useState<RuntimeSettings>(settings)

  React.useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleSettingsUpdate = (updates: Partial<RuntimeSettings>) => {
    const newSettings = { ...localSettings, ...updates }
    setLocalSettings(newSettings)
    onSettingsChange(newSettings)
  }

  const handleKnowledgeSourceParamUpdate = (
    index: number,
    updates: Partial<RuntimeSettings['knowledgeSourceParams'][0]>
  ) => {
    const currentParams = localSettings.knowledgeSourceParams || []
    const newParams = [...currentParams]
    newParams[index] = { ...newParams[index], ...updates }
    
    handleSettingsUpdate({ knowledgeSourceParams: newParams })
  }

  const addKnowledgeSourceParam = () => {
    const currentParams = localSettings.knowledgeSourceParams || []
    const newParam = {
      kind: 'searchIndex' as const,
      knowledgeSourceName: '',
      filterAddOn: ''
    }
    
    handleSettingsUpdate({ 
      knowledgeSourceParams: [...currentParams, newParam] 
    })
  }

  const removeKnowledgeSourceParam = (index: number) => {
    const currentParams = localSettings.knowledgeSourceParams || []
    const newParams = currentParams.filter((_, i) => i !== index)
    
    handleSettingsUpdate({ knowledgeSourceParams: newParams })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 400, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'border-l border-stroke-divider bg-bg-card overflow-hidden',
            className
          )}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stroke-divider">
              <div className="flex items-center gap-2">
                <Settings20Regular className="h-5 w-5" />
                <h3 className="font-semibold">Runtime settings</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close settings"
              >
                <Dismiss20Regular className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Retrieval Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Retrieval settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField name="retrievalReasoningEffort">
                    <FormLabel>Reasoning effort</FormLabel>
                    <FormControl>
                      <Select
                        value={localSettings.retrievalReasoningEffort || 'medium'}
                        onValueChange={(value: 'low' | 'medium' | 'high') =>
                          handleSettingsUpdate({ retrievalReasoningEffort: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select reasoning effort" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - Faster responses</SelectItem>
                          <SelectItem value="medium">Medium - Balanced</SelectItem>
                          <SelectItem value="high">High - More thorough</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Controls how deeply the system reasons through your knowledge sources
                    </FormDescription>
                  </FormField>

                  <FormField name="outputMode">
                    <FormLabel>Output mode</FormLabel>
                    <FormControl>
                      <Select
                        value={localSettings.outputMode || 'answerSynthesis'}
                        onValueChange={(value: 'extractiveData' | 'answerSynthesis') =>
                          handleSettingsUpdate({ outputMode: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select output mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="extractiveData">Extractive data - Return relevant chunks</SelectItem>
                          <SelectItem value="answerSynthesis">Answer synthesis - Generate comprehensive answers</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Choose between raw data extraction or synthesized answers
                    </FormDescription>
                  </FormField>
                </CardContent>
              </Card>

              {/* Knowledge Source Parameters */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">Knowledge source parameters</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addKnowledgeSourceParam}
                  >
                    <Filter20Regular className="h-3 w-3 mr-1" />
                    Add filter
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(localSettings.knowledgeSourceParams || []).length === 0 ? (
                    <div className="text-center py-4 text-sm text-fg-muted">
                      No runtime parameters configured
                    </div>
                  ) : (
                    (localSettings.knowledgeSourceParams || []).map((param, index) => {
                      const Icon = kindIcons[param.kind]
                      
                      return (
                        <div
                          key={index}
                          className="p-4 border border-stroke-divider rounded-md space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {param.kind} parameter
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeKnowledgeSourceParam(index)}
                              className="h-6 w-6"
                            >
                              <Dismiss20Regular className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="space-y-3">
                            <FormField name={`source-${index}`}>
                              <FormLabel>Knowledge source</FormLabel>
                              <FormControl>
                                <Select
                                  value={param.knowledgeSourceName}
                                  onValueChange={(value) =>
                                    handleKnowledgeSourceParamUpdate(index, {
                                      knowledgeSourceName: value
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select source" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {knowledgeSources
                                      .filter(source => source.kind === param.kind)
                                      .map((source) => (
                                        <SelectItem key={source.name} value={source.name}>
                                          {source.name}
                                        </SelectItem>
                                      ))
                                    }
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormField>

                            {(param as any).kind === 'web' && (
                              <FormField name={`freshness-${index}`}>
                                <FormLabel>Freshness</FormLabel>
                                <FormControl>
                                  <Select
                                    value={(param as any).freshness || 'week'}
                                    onValueChange={(value) =>
                                      handleKnowledgeSourceParamUpdate(index, {
                                        freshness: value as 'day' | 'week' | 'month'
                                      } as any)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="day">Past day</SelectItem>
                                      <SelectItem value="week">Past week</SelectItem>
                                      <SelectItem value="month">Past month</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                              </FormField>
                            )}

                            <FormField name={`filter-${index}`}>
                              <FormLabel>Filter add-on</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., category eq 'Technology'"
                                  value={param.filterAddOn || ''}
                                  onChange={(e) =>
                                    handleKnowledgeSourceParamUpdate(index, {
                                      filterAddOn: e.target.value
                                    })
                                  }
                                />
                              </FormControl>
                              <FormDescription>
                                Optional OData filter expression
                              </FormDescription>
                            </FormField>

                          </div>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}