'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
// (Note: reuse simple model value without full schema here)
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip } from '@/components/ui/tooltip'
import { Info20Regular, ChevronDown20Regular, ChevronUp20Regular } from '@fluentui/react-icons'
import { FormField, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form'
import { FormFrame } from '@/components/shared/form-frame'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { getSourceKindLabel } from '@/lib/sourceKinds'

interface AgentData {
  name: string
  description?: string
  knowledgeSources?: Array<{
    name: string
    includeReferences?: boolean
    includeReferenceSourceData?: boolean | null
    alwaysQuerySource?: boolean | null
    maxSubQueries?: number | null
    rerankerThreshold?: number | null
  }>
  models?: Array<{
    kind: string
    azureOpenAIParameters?: {
      resourceUri: string
      deploymentId: string
      modelName: string
    }
  }>
  outputConfiguration?: {
    modality: string
    answerInstructions?: string | null
    attemptFastPath?: boolean | null
    includeActivity?: boolean | null
  }
  retrievalInstructions?: string | null
  requestLimits?: {
    maxRuntimeInSeconds?: number | null
    maxOutputSize?: number | null
  } | null
  ['@odata.etag']?: string
}

interface EditAgentFormProps {
  agent: AgentData
  knowledgeSources: Array<{ name: string; kind: string }>
  onSubmit: (data: Partial<AgentData>) => Promise<void>
  onCancel: () => void
  onDelete?: () => Promise<void>
  className?: string
}

export function EditAgentForm({ 
  agent, 
  knowledgeSources, 
  onSubmit, 
  onCancel, 
  onDelete,
  className 
}: EditAgentFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [selectedSources, setSelectedSources] = React.useState<string[]>(
    agent.knowledgeSources?.map(ks => ks.name) || []
  )
  const { toast } = useToast()

  const form = useForm({
    defaultValues: {
      name: agent.name,
      description: agent.description || '',
      model: agent.models?.[0]?.azureOpenAIParameters?.modelName || 'gpt-4o-mini',
      outputModality: agent.outputConfiguration?.modality || 'extractiveData',
      answerInstructions: agent.outputConfiguration?.answerInstructions || '',
      retrievalInstructions: agent.retrievalInstructions || '',
      includeReferences: agent.knowledgeSources?.[0]?.includeReferences ?? true,
      includeReferenceSourceData: agent.knowledgeSources?.[0]?.includeReferenceSourceData ?? false,
      alwaysQuerySource: agent.knowledgeSources?.[0]?.alwaysQuerySource ?? false,
      maxSubQueries: agent.knowledgeSources?.[0]?.maxSubQueries ?? 5,
      rerankerThreshold: agent.knowledgeSources?.[0]?.rerankerThreshold ?? 2.1,
      includeActivity: agent.outputConfiguration?.includeActivity ?? true,
      maxRuntimeInSeconds: agent.requestLimits?.maxRuntimeInSeconds ?? 60,
      maxOutputSize: agent.requestLimits?.maxOutputSize ?? 100000,
      sources: selectedSources,
      // immutable helper
      etag: agent['@odata.etag'] || ''
    },
  })

  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = form
  const watchedModel = watch('model')
  const watchedOutputModality = watch('outputModality')
  const [showAdvanced, setShowAdvanced] = React.useState(false)

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)
      if (selectedSources.length === 0) {
        throw new Error('At least one knowledge source is required')
      }
      if (!data.outputModality) {
        throw new Error('Output modality is required')
      }

      // Convert form data to Azure AI Search agent format
      // FULL REPLACEMENT payload (PUT requires complete object). We intentionally include all configurable properties.
      // NOTE: PUT is a full replacement. All properties not included here may be cleared in Azure.
      const agentData: AgentData = {
        name: agent.name, // immutable; ignore any attempted change
        description: data.description || null,
        retrievalInstructions: data.retrievalInstructions || null,
        models: [{
          kind: 'azureOpenAI',
          azureOpenAIParameters: {
            resourceUri: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT || '',
            deploymentId: data.model || 'gpt-4o-mini',
            modelName: data.model || 'gpt-4o-mini'
          }
        }],
        knowledgeSources: selectedSources.map(name => ({
          name,
          includeReferences: data.includeReferences ?? true,
          includeReferenceSourceData: showAdvanced && data.includeReferenceSourceData ? data.includeReferenceSourceData : null,
            alwaysQuerySource: showAdvanced && data.alwaysQuerySource ? data.alwaysQuerySource : null,
            maxSubQueries: showAdvanced && data.maxSubQueries !== 5 ? data.maxSubQueries : null,
            rerankerThreshold: showAdvanced && data.rerankerThreshold !== 2.1 ? data.rerankerThreshold : null
        })),
        outputConfiguration: {
          modality: data.outputModality,
          answerInstructions: data.outputModality === 'answerSynthesis' ? (data.answerInstructions || null) : null,
          attemptFastPath: false,
          includeActivity: data.includeActivity || null
        },
        requestLimits: {
          maxRuntimeInSeconds: showAdvanced ? data.maxRuntimeInSeconds : null,
          maxOutputSize: showAdvanced ? data.maxOutputSize : null
        },
        ['@odata.etag']: agent['@odata.etag'] // concurrency control
      }

      await onSubmit(agentData)
      
      toast({
        type: 'success',
        title: 'Agent updated',
        description: 'Your knowledge agent has been updated successfully.'
      })
    } catch (error) {
      console.error('Failed to update agent:', error)
      toast({
        type: 'error',
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update agent'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    
    try {
      setIsDeleting(true)
      await onDelete()
      
      toast({
        type: 'success',
        title: 'Agent deleted',
        description: 'The knowledge agent has been deleted successfully.'
      })
    } catch (error) {
      console.error('Failed to delete agent:', error)
      toast({
        type: 'error',
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete agent'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleSource = (sourceName: string) => {
    setSelectedSources(prev => {
      const newSources = prev.includes(sourceName)
        ? prev.filter(name => name !== sourceName)
        : [...prev, sourceName]
      setValue('sources', newSources)
      return newSources
    })
  }

  return (
    <div className={className}>
      <FormFrame
        title={`Edit ${agent.name}`}
        description="Update your knowledge agent configuration."
        actions={[
          ...(onDelete ? [{
            label: "Delete agent",
            onClick: handleDelete,
            variant: "outline" as const,
            loading: isDeleting,
            disabled: isSubmitting || isDeleting
          }] : []),
          {
            label: "Cancel",
            onClick: onCancel,
            variant: "ghost" as const
          },
          {
            label: "Save changes",
            onClick: handleSubmit(handleFormSubmit),
            loading: isSubmitting,
            disabled: isSubmitting || isDeleting || selectedSources.length === 0
          }
        ]}
      >
        <form className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic information</h3>
            
            <FormField name="name" error={errors.name?.message}>
              <FormLabel required>Agent name (immutable)</FormLabel>
              <FormControl>
                <Input
                  {...register('name')}
                  disabled
                  aria-invalid={errors.name ? 'true' : 'false'}
                />
              </FormControl>
              <FormDescription>
                Name cannot be changed after creation. Create a new agent to rename.
              </FormDescription>
              <FormMessage />
            </FormField>

            <FormField name="description" error={errors.description?.message}>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...register('description')}
                  placeholder="Describe what this agent helps with..."
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                Optional description of the agent's purpose and capabilities
              </FormDescription>
              <FormMessage />
            </FormField>
          </div>

          {/* Model Configuration - now editable */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Model configuration</h3>
            <FormField name="model">
              <FormLabel required>AI model</FormLabel>
              <FormControl>
                <Select
                  value={watchedModel || agent.models?.[0]?.azureOpenAIParameters?.modelName || 'gpt-4o-mini'}
                  onValueChange={(value) => {
                    setValue('model', value)
                    trigger('model')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o-mini">
                      <div>
                        <div className="font-medium">GPT-4o Mini</div>
                        <div className="text-xs text-fg-muted">Fast, cost-effective, recommended</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="gpt-4o">
                      <div>
                        <div className="font-medium">GPT-4o</div>
                        <div className="text-xs text-fg-muted">Highest quality responses</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="gpt-4.1-nano">
                      <div>
                        <div className="font-medium">GPT-4.1 Nano</div>
                        <div className="text-xs text-fg-muted">Ultra-fast, minimal cost</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="gpt-4.1-mini">
                      <div>
                        <div className="font-medium">GPT-4.1 Mini</div>
                        <div className="text-xs text-fg-muted">Fast and efficient</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="gpt-4.1">
                      <div>
                        <div className="font-medium">GPT-4.1</div>
                        <div className="text-xs text-fg-muted">High performance</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="gpt-5-nano">
                      <div>
                        <div className="font-medium">GPT-5 Nano</div>
                        <div className="text-xs text-fg-muted">Latest nano model</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="gpt-5-mini">
                      <div>
                        <div className="font-medium">GPT-5 Mini</div>
                        <div className="text-xs text-fg-muted">Latest mini model</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="gpt-5">
                      <div>
                        <div className="font-medium">GPT-5</div>
                        <div className="text-xs text-fg-muted">Latest flagship model</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormField>
          </div>

          {/* Output Modality */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Output configuration</h3>
            <FormField name="outputModality">
              <FormLabel required>Output modality</FormLabel>
              <FormControl>
                <Select
                  value={watchedOutputModality || 'extractiveData'}
                  onValueChange={(value) => {
                    setValue('outputModality', value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select output mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="extractiveData">
                      <div>
                        <div className="font-medium">Extractive Data</div>
                        <div className="text-xs text-fg-muted">Returns exact text from sources with citations</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="answerSynthesis">
                      <div>
                        <div className="font-medium">Answer Synthesis</div>
                        <div className="text-xs text-fg-muted">Creates new responses based on sources</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                How the agent structures its responses.
              </FormDescription>
              <FormMessage />
            </FormField>

            {watchedOutputModality === 'answerSynthesis' && (
              <FormField name="answerInstructions">
                <FormLabel>Answer instructions</FormLabel>
                <FormControl>
                  <Textarea
                    {...register('answerInstructions')}
                    placeholder="Guidelines for synthesized answers..."
                    rows={3}
                    maxLength={500}
                  />
                </FormControl>
                <FormDescription>
                  Optional answer synthesis guidance (max 500 chars)
                </FormDescription>
                <FormMessage />
              </FormField>
            )}
          </div>

          {/* Knowledge Sources (already present) */}

          {/* Knowledge Sources */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Knowledge sources</h3>
            <FormField name="sources" error={errors.sources?.message}>
              <FormLabel required>Select sources</FormLabel>
              <FormControl>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-stroke-divider rounded-md p-3">
                  {knowledgeSources.length === 0 ? (
                    <div className="text-sm text-fg-muted text-center py-8">
                      No knowledge sources available
                    </div>
                  ) : (
                    knowledgeSources.map((source) => (
                      <label
                        key={source.name}
                        className="flex items-center space-x-3 p-2 rounded hover:bg-bg-hover cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSources.includes(source.name)}
                          onChange={() => toggleSource(source.name)}
                          className="rounded border-stroke-divider"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium">{source.name}</span>
                          <span className="text-xs text-fg-muted ml-2">({getSourceKindLabel(source.kind)})</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Choose which knowledge sources this agent can search
              </FormDescription>
              <FormMessage />
            </FormField>
          </div>

          {/* Advanced Configuration */}
          <div className="space-y-4">
            <div className="border-t border-stroke-divider pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 p-0 h-auto font-medium text-left"
              >
                {showAdvanced ? (
                  <ChevronUp20Regular className="h-4 w-4" />
                ) : (
                  <ChevronDown20Regular className="h-4 w-4" />
                )}
                <span>Advanced configuration</span>
                <Tooltip content="Optional retrieval and search settings. PUT replaces entire agent so unspecified fields may reset.">
                  <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                </Tooltip>
              </Button>
            </div>
            {showAdvanced && (
              <div className="space-y-4 ml-4 pl-4 border-l-2 border-stroke-divider">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="includeReferences">
                    <FormLabel>Include references</FormLabel>
                    <FormControl>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" {...register('includeReferences')} className="rounded border-stroke-divider" />
                        <span className="text-sm">Show source citations</span>
                      </label>
                    </FormControl>
                  </FormField>
                  <FormField name="includeActivity">
                    <FormLabel>Include activity</FormLabel>
                    <FormControl>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" {...register('includeActivity')} className="rounded border-stroke-divider" />
                        <span className="text-sm">Include search activity metadata</span>
                      </label>
                    </FormControl>
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="includeReferenceSourceData">
                    <FormLabel>Include source data</FormLabel>
                    <FormControl>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" {...register('includeReferenceSourceData')} className="rounded border-stroke-divider" />
                        <span className="text-sm">Embed referenced source snippets</span>
                      </label>
                    </FormControl>
                  </FormField>
                  <FormField name="alwaysQuerySource">
                    <FormLabel>Always query source</FormLabel>
                    <FormControl>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" {...register('alwaysQuerySource')} className="rounded border-stroke-divider" />
                        <span className="text-sm">Force query each source</span>
                      </label>
                    </FormControl>
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="maxSubQueries" error={errors.maxSubQueries?.message}>
                    <FormLabel>Max sub-queries</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={10} {...register('maxSubQueries', { valueAsNumber: true })} />
                    </FormControl>
                    <FormDescription>1-10 (default 5)</FormDescription>
                    <FormMessage />
                  </FormField>
                  <FormField name="rerankerThreshold" error={errors.rerankerThreshold?.message}>
                    <FormLabel>Reranker threshold</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" min={0} max={5} {...register('rerankerThreshold', { valueAsNumber: true })} />
                    </FormControl>
                    <FormDescription>0.0-5.0 (default 2.1)</FormDescription>
                    <FormMessage />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="maxRuntimeInSeconds">
                    <FormLabel>Max runtime (s)</FormLabel>
                    <FormControl>
                      <Input type="number" min={5} max={300} {...register('maxRuntimeInSeconds', { valueAsNumber: true })} />
                    </FormControl>
                    <FormDescription>Execution timeout</FormDescription>
                    <FormMessage />
                  </FormField>
                  <FormField name="maxOutputSize">
                    <FormLabel>Max output size</FormLabel>
                    <FormControl>
                      <Input type="number" min={1000} max={500000} {...register('maxOutputSize', { valueAsNumber: true })} />
                    </FormControl>
                    <FormDescription>Bytes (default 100000)</FormDescription>
                    <FormMessage />
                  </FormField>
                </div>
                <FormField name="retrievalInstructions">
                  <FormLabel>Retrieval instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      {...register('retrievalInstructions')}
                      placeholder="Guidance for how to search and prioritize sources..."
                      rows={2}
                      maxLength={300}
                    />
                  </FormControl>
                  <FormDescription>Custom search guidance (max 300 chars)</FormDescription>
                  <FormMessage />
                </FormField>
              </div>
            )}
          </div>
        </form>
      </FormFrame>
    </div>
  )
}