'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/components/ui/toast'
import { Tooltip } from '@/components/ui/tooltip'
import { Info20Regular, ChevronDown20Regular, ChevronUp20Regular } from '@fluentui/react-icons'
import { createAgent } from '@/lib/api'

// Form validation schema based on Azure AI Search 2025-08-01-Preview API
const createAgentSchema = z.object({
  name: z.string().min(1, 'Agent name is required').max(50, 'Name must be 50 characters or less'),
  description: z.string().optional(),
  model: z.string().min(1, 'Model selection is required'),
  sources: z.array(z.string()).min(1, 'At least one knowledge source is required'),
  outputModality: z.enum(['extractiveData', 'answerSynthesis']),
  answerInstructions: z.string().optional(),
  retrievalInstructions: z.string().optional(),
  includeReferences: z.boolean(),
  includeReferenceSourceData: z.boolean(),
  alwaysQuerySource: z.boolean(),
  maxSubQueries: z.number().min(1).max(20),
  rerankerThreshold: z.number().min(0).max(5),
  includeActivity: z.boolean()
})

type CreateAgentFormData = z.infer<typeof createAgentSchema>
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form'
import { FormFrame } from '@/components/shared/form-frame'
import { cn } from '@/lib/utils'

interface CreateAgentFormProps {
  knowledgeSources: Array<{ id: string; name: string; kind: string }>
  onSubmit: (data: CreateAgentFormData) => Promise<void>
  onCancel: () => void
  className?: string
}

export function CreateAgentForm({ 
  knowledgeSources, 
  onSubmit, 
  onCancel,
  className 
}: CreateAgentFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedSources, setSelectedSources] = React.useState<string[]>([])
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof createAgentSchema>>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: '',
      description: '',
      model: 'gpt-4o-mini', // Using supported model name
      sources: [],
      outputModality: 'extractiveData' as const,
      answerInstructions: '',
      retrievalInstructions: '',
      includeReferences: true,
      includeReferenceSourceData: false,
      alwaysQuerySource: false,
      maxSubQueries: 5,
      rerankerThreshold: 2.1,
      includeActivity: true
    },
  })

  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = form
  const watchedOutputModality = watch('outputModality')
  
  const watchedModel = watch('model')

  const handleFormSubmit = async (data: z.infer<typeof createAgentSchema>) => {
    try {
      setIsSubmitting(true)

      // Convert to Azure AI Search agent format (2025-08-01-Preview API)
      // Based on actual API structure from existing agents
      const agentData = {
        name: data.name,
        description: data.description || undefined,
        retrievalInstructions: data.retrievalInstructions || null,
        models: [{
          kind: 'azureOpenAI',
          azureOpenAIParameters: {
            resourceUri: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT || '',
            deploymentId: data.model,
            modelName: data.model
            // API key will be injected server-side
          }
        }],
        knowledgeSources: selectedSources.map(name => ({
          name,
          includeReferences: data.includeReferences || true,
          includeReferenceSourceData: showAdvanced && data.includeReferenceSourceData ? data.includeReferenceSourceData : null,
          alwaysQuerySource: showAdvanced && data.alwaysQuerySource ? data.alwaysQuerySource : null,
          maxSubQueries: showAdvanced && data.maxSubQueries !== 5 ? data.maxSubQueries : null,
          rerankerThreshold: showAdvanced && data.rerankerThreshold !== 2.1 ? data.rerankerThreshold : null
        })),
        outputConfiguration: {
          modality: data.outputModality,
          answerInstructions: data.answerInstructions || null,
          attemptFastPath: false,
          includeActivity: data.includeActivity || null
        },
        requestLimits: null,
        encryptionKey: null
      }

      await createAgent(agentData)
      onCancel() // Close the form on success
      
      toast({
        type: 'success',
        title: 'Agent created',
        description: 'Your knowledge agent has been created successfully.'
      })
    } catch (error) {
      console.error('Failed to create agent:', error)
      toast({
        type: 'error',
        title: 'Creation failed',
        description: error instanceof Error ? error.message : 'Failed to create agent'
      })
    } finally {
      setIsSubmitting(false)
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
        title="Create knowledge agent"
        description="Create a new AI agent that can search and answer questions using your knowledge sources."
        actions={[
          {
            label: "Cancel",
            onClick: onCancel,
            variant: "ghost" as const
          },
          {
            label: "Create agent",
            onClick: handleSubmit(handleFormSubmit),
            loading: isSubmitting,
            disabled: isSubmitting || selectedSources.length === 0
          }
        ]}
      >
        <form className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic information</h3>
            
            <FormField name="name" error={errors.name?.message}>
              <div className="flex items-center gap-2">
                <FormLabel required>Agent name</FormLabel>
                <Tooltip content="Choose a descriptive name that clearly identifies what this agent helps with. This name will be visible to users when they interact with your agent.">
                  <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                </Tooltip>
              </div>
              <FormControl>
                <Input
                  {...register('name')}
                  placeholder="e.g., Product Documentation Agent"
                  aria-invalid={errors.name ? 'true' : 'false'}
                  maxLength={50}
                />
              </FormControl>
              <FormDescription>
                A unique name for your agent that users will see (max 50 characters)
              </FormDescription>
              <FormMessage />
            </FormField>

            <FormField name="description" error={errors.description?.message}>
              <div className="flex items-center gap-2">
                <FormLabel>Description</FormLabel>
                <Tooltip content="Provide a brief description of what this agent does and how it can help users. This appears in the agent listing and helps users understand when to use this agent.">
                  <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                </Tooltip>
              </div>
              <FormControl>
                <Textarea
                  {...register('description')}
                  placeholder="e.g., Helps users find information from product manuals, troubleshooting guides, and technical documentation"
                  rows={3}
                  maxLength={200}
                />
              </FormControl>
              <FormDescription>
                Optional description of the agent's purpose and capabilities (max 200 characters)
              </FormDescription>
              <FormMessage />
            </FormField>
          </div>

          {/* Model Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Model configuration</h3>
            
            <FormField name="model" error={errors.model?.message}>
              <div className="flex items-center gap-2">
                <FormLabel required>AI model</FormLabel>
                <Tooltip content="GPT-4o Mini is recommended for most use cases - it's fast, cost-effective, and great for knowledge retrieval. GPT-4o provides higher quality responses but costs more. Choose based on your quality vs cost requirements.">
                  <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                </Tooltip>
              </div>
              <FormControl>
                <Select
                  value={watchedModel || "gpt-4o-mini"}
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
              <FormDescription>
                Choose the Azure OpenAI model that best fits your quality and cost requirements
              </FormDescription>
              <FormMessage />
            </FormField>

            <FormField name="outputModality" error={errors.outputModality?.message}>
              <div className="flex items-center gap-2">
                <FormLabel required>Output modality</FormLabel>
                <Tooltip content="Extractive Data returns exact quotes from sources with citations. Answer Synthesis creates new responses based on the sources and allows custom answer instructions.">
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
                Choose how the agent processes and returns information from your knowledge sources
              </FormDescription>
              <FormMessage />
            </FormField>

            {/* Answer Instructions - only show for answerSynthesis */}
            {watchedOutputModality === 'answerSynthesis' && (
              <FormField name="answerInstructions" error={errors.answerInstructions?.message}>
                <div className="flex items-center gap-2">
                  <FormLabel>Answer instructions</FormLabel>
                  <Tooltip content="Custom instructions for how the agent should format and structure its synthesized responses. These instructions guide the AI in creating new answers based on your knowledge sources.">
                    <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                  </Tooltip>
                </div>
                <FormControl>
                  <Textarea
                    {...register('answerInstructions')}
                    placeholder="e.g., Always provide step-by-step instructions when possible. Use a professional tone and include relevant examples from the knowledge sources."
                    rows={3}
                    maxLength={500}
                  />
                </FormControl>
                <FormDescription>
                  Instructions for how to synthesize responses from knowledge sources (max 500 characters)
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
                <Tooltip content="Choose the knowledge sources your agent will search through. Selecting multiple sources allows users to get comprehensive answers, but too many sources might slow down responses. Start with your most important sources.">
                  <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                </Tooltip>
              </div>
              <FormControl>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-stroke-divider rounded-md p-3">
                  {knowledgeSources.length === 0 ? (
                    <div className="text-sm text-fg-muted text-center py-8">
                      <div className="mb-2">No knowledge sources available</div>
                      <div className="text-xs">
                        You need to connect knowledge sources before creating an agent
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
                          <span className="text-xs text-fg-muted ml-2">({source.kind})</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Choose which knowledge sources this agent can search ({selectedSources.length} selected)
              </FormDescription>
              <FormMessage />
            </FormField>
          </div>

          {/* Advanced Configuration - Collapsible */}
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
                <Tooltip content="Optional settings that control search behavior, reference handling, and retrieval instructions. The defaults work well for most use cases.">
                  <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                </Tooltip>
              </Button>
            </div>

            {showAdvanced && (
              <div className="space-y-4 ml-4 pl-4 border-l-2 border-stroke-divider">
            
            {/* Reference Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="includeReferences">
                <div className="flex items-center gap-2">
                  <FormLabel>Include references</FormLabel>
                  <Tooltip content="Show source citations with answers. Recommended for transparency and fact-checking.">
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
                    <span className="text-sm">Show source citations in responses</span>
                  </label>
                </FormControl>
              </FormField>

              <FormField name="includeActivity">
                <div className="flex items-center gap-2">
                  <FormLabel>Include activity</FormLabel>
                  <Tooltip content="Show search activity details for debugging and transparency. Useful for understanding how the agent found its answers.">
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
                    <span className="text-sm">Show search activity details</span>
                  </label>
                </FormControl>
              </FormField>
            </div>

            {/* Search Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="maxSubQueries" error={errors.maxSubQueries?.message}>
                <div className="flex items-center gap-2">
                  <FormLabel>Max sub-queries</FormLabel>
                  <Tooltip content="Maximum number of search queries the agent can make. Higher values allow more thorough searching but may be slower.">
                    <Info20Regular className="h-3 w-3 text-fg-muted cursor-help" />
                  </Tooltip>
                </div>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    {...register('maxSubQueries', { valueAsNumber: true })}
                    className="w-full"
                  />
                </FormControl>
                <FormDescription>
                  1-10 queries (recommended: 5)
                </FormDescription>
                <FormMessage />
              </FormField>

              <FormField name="rerankerThreshold" error={errors.rerankerThreshold?.message}>
                <div className="flex items-center gap-2">
                  <FormLabel>Reranker threshold</FormLabel>
                  <Tooltip content="Minimum relevance score for search results. Higher values mean stricter filtering but might miss relevant content.">
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
                <FormDescription>
                  0.0-5.0 (recommended: 2.1)
                </FormDescription>
                <FormMessage />
              </FormField>
            </div>

            {/* Retrieval Instructions */}
            <FormField name="retrievalInstructions" error={errors.retrievalInstructions?.message}>
              <div className="flex items-center gap-2">
                <FormLabel>Retrieval instructions</FormLabel>
                <Tooltip content="Custom instructions for how the agent should search and retrieve information from knowledge sources. Leave empty to use default search behavior.">
                  <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                </Tooltip>
              </div>
              <FormControl>
                <Textarea
                  {...register('retrievalInstructions')}
                  placeholder="e.g., Focus on the most recent information and prioritize official documentation over user-generated content."
                  rows={2}
                  maxLength={300}
                />
              </FormControl>
              <FormDescription>
                Optional instructions for customizing search and retrieval behavior (max 300 characters)
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