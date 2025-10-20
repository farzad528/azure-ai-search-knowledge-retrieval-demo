'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Info20Regular, ChevronDown20Regular, ChevronUp20Regular } from '@fluentui/react-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form'
import { FormFrame } from '@/components/shared/form-frame'
import { Tooltip } from '@/components/ui/tooltip'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { createKnowledgeBase } from '@/lib/api'
import { createKnowledgeBaseSchema, CreateKnowledgeBaseFormData } from '@/lib/validations'
import { getSourceKindLabel } from '@/lib/sourceKinds'

interface KnowledgeSourceSummary {
  id?: string
  name: string
  kind: string
}

interface CreateKnowledgeBaseFormProps {
  knowledgeSources: KnowledgeSourceSummary[]
  onSubmit?: (data: CreateKnowledgeBaseFormData) => Promise<void>
  onCancel: () => void
  className?: string
}

export function CreateKnowledgeBaseForm({
  knowledgeSources,
  onSubmit,
  onCancel,
  className,
}: CreateKnowledgeBaseFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedSources, setSelectedSources] = React.useState<string[]>([])
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof createKnowledgeBaseSchema>>({
    resolver: zodResolver(createKnowledgeBaseSchema),
    defaultValues: {
      name: '',
      description: '',
      modelDeployment: 'gpt-4o-mini',
      sources: [],
      outputModality: 'extractiveData',
      answerInstructions: '',
      retrievalInstructions: '',
      includeReferences: true,
      includeReferenceSourceData: false,
      alwaysQuerySource: false,
      maxSubQueries: 5,
      rerankerThreshold: 2.1,
      includeActivity: true,
    },
  })

  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = form
  const watchedOutputModality = watch('outputModality')
  const watchedModel = watch('modelDeployment')

  const toggleSource = (sourceName: string) => {
    setSelectedSources(prev => {
      const updated = prev.includes(sourceName)
        ? prev.filter(name => name !== sourceName)
        : [...prev, sourceName]
      setValue('sources', updated)
      return updated
    })
  }

  const handleFormSubmit = async (data: CreateKnowledgeBaseFormData) => {
    try {
      setIsSubmitting(true)

      const knowledgeSourcesPayload = selectedSources.map(name => {
        const sourceConfig: Record<string, unknown> = {
          name,
          includeReferences: data.includeReferences,
        }

        if (showAdvanced) {
          if (data.includeReferenceSourceData) {
            sourceConfig.includeReferenceSourceData = data.includeReferenceSourceData
          }
          if (data.alwaysQuerySource) {
            sourceConfig.alwaysQuerySource = data.alwaysQuerySource
          }
          if (data.maxSubQueries !== 5) {
            sourceConfig.maxSubQueries = data.maxSubQueries
          }
          if (data.rerankerThreshold !== 2.1) {
            sourceConfig.rerankerThreshold = data.rerankerThreshold
          }
        }

        return sourceConfig
      })

      const payload = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        retrievalInstructions: data.retrievalInstructions?.trim() || undefined,
        models: [
          {
            kind: 'azureOpenAI',
            azureOpenAIParameters: {
              resourceUri: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT || '',
              deploymentId: data.modelDeployment,
              modelName: data.modelDeployment,
            },
          },
        ],
        knowledgeSources: knowledgeSourcesPayload,
        outputConfiguration: {
          modality: data.outputModality,
          answerInstructions:
            data.outputModality === 'answerSynthesis'
              ? (data.answerInstructions?.trim() || undefined)
              : undefined,
          includeActivity: showAdvanced ? data.includeActivity : undefined,
        },
      }

      await createKnowledgeBase(payload)

      if (onSubmit) {
        await onSubmit(data)
      }

      onCancel()
      toast({
        type: 'success',
        title: 'Knowledge base created',
        description: 'Your knowledge base is ready to use.',
      })
    } catch (error) {
      console.error('Failed to create knowledge base:', error)
      toast({
        type: 'error',
        title: 'Creation failed',
        description: error instanceof Error ? error.message : 'Failed to create knowledge base',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      <FormFrame
        title="Create knowledge base"
        description="Ground AI experiences with curated knowledge sources."
        actions={[
          {
            label: 'Cancel',
            onClick: onCancel,
            variant: 'ghost' as const,
          },
          {
            label: 'Create knowledge base',
            onClick: handleSubmit(handleFormSubmit),
            loading: isSubmitting,
            disabled: isSubmitting || selectedSources.length === 0,
          },
        ]}
      >
        <form className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic information</h3>

            <FormField name="name" error={errors.name?.message}>
              <div className="flex items-center gap-2">
                <FormLabel required>Knowledge base name</FormLabel>
                <Tooltip content="Choose a friendly name that reflects the knowledge this experience represents.">
                  <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                </Tooltip>
              </div>
              <FormControl>
                <Input
                  {...register('name')}
                  placeholder="e.g., Product Support KB"
                  aria-invalid={errors.name ? 'true' : 'false'}
                  maxLength={64}
                />
              </FormControl>
              <FormDescription>
                A unique name for this knowledge base (max 64 characters).
              </FormDescription>
              <FormMessage />
            </FormField>

            <FormField name="description" error={errors.description?.message}>
              <div className="flex items-center gap-2">
                <FormLabel>Description</FormLabel>
                <Tooltip content="Explain what this knowledge base covers so other builders know when to use it.">
                  <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                </Tooltip>
              </div>
              <FormControl>
                <Textarea
                  {...register('description')}
                  placeholder="e.g., Official troubleshooting and how-to guidance for Contoso products"
                  rows={3}
                  maxLength={500}
                />
              </FormControl>
              <FormDescription>
                Optional description to help teammates understand the scope.
              </FormDescription>
              <FormMessage />
            </FormField>
          </div>

          {/* Model Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Model configuration</h3>

            <FormField name="modelDeployment" error={errors.modelDeployment?.message}>
              <div className="flex items-center gap-2">
                <FormLabel required>Azure OpenAI deployment</FormLabel>
                <Tooltip content="Select the Azure OpenAI deployment the knowledge base should use for grounded answers.">
                  <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                </Tooltip>
              </div>
              <FormControl>
                <Select
                  value={watchedModel || 'gpt-4o-mini'}
                  onValueChange={(value) => {
                    setValue('modelDeployment', value)
                    trigger('modelDeployment')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a deployment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o-mini">
                      <div>
                        <div className="font-medium">GPT-4o Mini</div>
                        <div className="text-xs text-fg-muted">Balanced quality, cost, and latency</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="gpt-4o">
                      <div>
                        <div className="font-medium">GPT-4o</div>
                        <div className="text-xs text-fg-muted">Highest quality grounded answers</div>
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
                        <div className="text-xs text-fg-muted">Higher quality with moderate cost</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="gpt-5-mini">
                      <div>
                        <div className="font-medium">GPT-5 Mini</div>
                        <div className="text-xs text-fg-muted">Latest mini-class deployment</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="gpt-5">
                      <div>
                        <div className="font-medium">GPT-5</div>
                        <div className="text-xs text-fg-muted">Latest flagship deployment</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Pick the Azure OpenAI deployment to answer with grounded context.
              </FormDescription>
              <FormMessage />
            </FormField>

            <FormField name="outputModality" error={errors.outputModality?.message}>
              <div className="flex items-center gap-2">
                <FormLabel required>Output modality</FormLabel>
                <Tooltip content="Extractive data quotes directly from sources. Answer synthesis crafts new answers from the retrieved content.">
                  <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                </Tooltip>
              </div>
              <FormControl>
                <Select
                  value={watchedOutputModality || 'extractiveData'}
                  onValueChange={(value) => {
                    setValue('outputModality', value as 'extractiveData' | 'answerSynthesis')
                    trigger('outputModality')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select output modality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="extractiveData">
                      <div>
                        <div className="font-medium">Extractive data</div>
                        <div className="text-xs text-fg-muted">Return verbatim snippets with citations</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="answerSynthesis">
                      <div>
                        <div className="font-medium">Answer synthesis</div>
                        <div className="text-xs text-fg-muted">Compose grounded answers with custom guidance</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Determine how responses are constructed from retrieved knowledge.
              </FormDescription>
              <FormMessage />
            </FormField>

            {watchedOutputModality === 'answerSynthesis' && (
              <FormField name="answerInstructions" error={errors.answerInstructions?.message}>
                <div className="flex items-center gap-2">
                  <FormLabel>Answer instructions</FormLabel>
                  <Tooltip content="Add style or formatting guidance for synthesized answers.">
                    <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                  </Tooltip>
                </div>
                <FormControl>
                  <Textarea
                    {...register('answerInstructions')}
                    placeholder="e.g., Provide concise answers with numbered steps when relevant."
                    rows={3}
                    maxLength={500}
                  />
                </FormControl>
                <FormDescription>
                  Optional guidance for synthesized responses (max 500 characters).
                </FormDescription>
                <FormMessage />
              </FormField>
            )}
          </div>

          {/* Knowledge Sources */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Knowledge sources</h3>
            <FormField name="sources" error={errors.sources?.message}>
              <div className="flex items-center gap-2">
                <FormLabel required>Select sources</FormLabel>
                <Tooltip content="Pick the indexes or repositories this knowledge base can access.">
                  <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                </Tooltip>
              </div>
              <FormControl>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-stroke-divider rounded-md p-3">
                  {knowledgeSources.length === 0 ? (
                    <div className="text-sm text-fg-muted text-center py-8">
                      <div className="mb-2">No knowledge sources available</div>
                      <div className="text-xs">
                        Connect knowledge sources before creating a knowledge base.
                      </div>
                    </div>
                  ) : (
                    knowledgeSources.map((source) => (
                      <label
                        key={source.name}
                        className="flex items-center space-x-3 p-2 rounded hover:bg-bg-hover cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSources.includes(source.name)}
                          onChange={() => {
                            toggleSource(source.name)
                            setTimeout(() => trigger('sources'), 0)
                          }}
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
                The knowledge base will ground answers using these sources ({selectedSources.length} selected).
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
                <span>Advanced retrieval configuration</span>
                <Tooltip content="Fine-tune citation behavior and retrieval limits. Defaults are optimized for most scenarios.">
                  <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                </Tooltip>
              </Button>
            </div>

            {showAdvanced && (
              <div className="space-y-4 ml-4 pl-4 border-l-2 border-stroke-divider">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="includeReferences">
                    <div className="flex items-center gap-2">
                      <FormLabel>Include references</FormLabel>
                      <Tooltip content="Attach citations to every answer for transparency.">
                        <Info20Regular className="h-3 w-3 text-fg-muted cursor-help" />
                      </Tooltip>
                    </div>
                    <FormControl>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register('includeReferences')}
                          className="rounded border-stroke-divider"
                        />
                        <span className="text-sm">Show source citations</span>
                      </label>
                    </FormControl>
                  </FormField>

                  <FormField name="includeActivity">
                    <div className="flex items-center gap-2">
                      <FormLabel>Include activity</FormLabel>
                      <Tooltip content="Return retrieval diagnostics useful for debugging.">
                        <Info20Regular className="h-3 w-3 text-fg-muted cursor-help" />
                      </Tooltip>
                    </div>
                    <FormControl>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register('includeActivity')}
                          className="rounded border-stroke-divider"
                        />
                        <span className="text-sm">Attach search activity details</span>
                      </label>
                    </FormControl>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="includeReferenceSourceData">
                    <div className="flex items-center gap-2">
                      <FormLabel>Include source data</FormLabel>
                      <Tooltip content="Return additional fields from the knowledge source in each citation.">
                        <Info20Regular className="h-3 w-3 text-fg-muted cursor-help" />
                      </Tooltip>
                    </div>
                    <FormControl>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register('includeReferenceSourceData')}
                          className="rounded border-stroke-divider"
                        />
                        <span className="text-sm">Embed source metadata with citations</span>
                      </label>
                    </FormControl>
                  </FormField>

                  <FormField name="alwaysQuerySource">
                    <div className="flex items-center gap-2">
                      <FormLabel>Always query sources</FormLabel>
                      <Tooltip content="Force the knowledge base to query every selected source each time.">
                        <Info20Regular className="h-3 w-3 text-fg-muted cursor-help" />
                      </Tooltip>
                    </div>
                    <FormControl>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register('alwaysQuerySource')}
                          className="rounded border-stroke-divider"
                        />
                        <span className="text-sm">Query all sources for each request</span>
                      </label>
                    </FormControl>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="maxSubQueries" error={errors.maxSubQueries?.message}>
                    <div className="flex items-center gap-2">
                      <FormLabel>Max sub-queries</FormLabel>
                      <Tooltip content="Upper bound on the number of retrieval queries issued per request.">
                        <Info20Regular className="h-3 w-3 text-fg-muted cursor-help" />
                      </Tooltip>
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        {...register('maxSubQueries', { valueAsNumber: true })}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>Range 1-20 (default 5).</FormDescription>
                    <FormMessage />
                  </FormField>

                  <FormField name="rerankerThreshold" error={errors.rerankerThreshold?.message}>
                    <div className="flex items-center gap-2">
                      <FormLabel>Reranker threshold</FormLabel>
                      <Tooltip content="Discard documents with a reranker score below this value.">
                        <Info20Regular className="h-3 w-3 text-fg-muted cursor-help" />
                      </Tooltip>
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        {...register('rerankerThreshold', { valueAsNumber: true })}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>Range 0.0-5.0 (default 2.1).</FormDescription>
                    <FormMessage />
                  </FormField>
                </div>

                <FormField name="retrievalInstructions" error={errors.retrievalInstructions?.message}>
                  <div className="flex items-center gap-2">
                    <FormLabel>Retrieval instructions</FormLabel>
                    <Tooltip content="Provide hints for how the system should query and prioritize knowledge.">
                      <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                    </Tooltip>
                  </div>
                  <FormControl>
                    <Textarea
                      {...register('retrievalInstructions')}
                      placeholder="e.g., Prioritize latest release notes and official documentation over community content."
                      rows={3}
                      maxLength={500}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional retrieval guidance (max 500 characters).
                  </FormDescription>
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
