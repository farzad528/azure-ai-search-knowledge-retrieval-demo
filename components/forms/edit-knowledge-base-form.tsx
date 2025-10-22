'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip } from '@/components/ui/tooltip'
import { Info20Regular, ChevronDown20Regular, ChevronUp20Regular, Warning20Regular } from '@fluentui/react-icons'
import { FormField, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form'
import { FormFrame } from '@/components/shared/form-frame'
import { useToast } from '@/components/ui/toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createKnowledgeBaseSchema, CreateKnowledgeBaseFormData } from '@/lib/validations'
import { getSourceKindLabel } from '@/lib/sourceKinds'

interface KnowledgeSourceSummary {
  name: string
  kind: string
}

interface KnowledgeBaseData {
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
      resourceUri?: string
      deploymentId?: string
      modelName?: string
    }
  }>
  outputConfiguration?: {
    modality: 'extractiveData' | 'answerSynthesis'
    answerInstructions?: string | null
    includeActivity?: boolean | null
  }
  retrievalInstructions?: string | null
  requestLimits?: {
    maxRuntimeInSeconds?: number | null
    maxOutputSize?: number | null
  } | null
  ['@odata.etag']?: string
}

interface EditKnowledgeBaseFormProps {
  knowledgeBase: KnowledgeBaseData
  knowledgeSources: KnowledgeSourceSummary[]
  onSubmit: (payload: Partial<KnowledgeBaseData>) => Promise<void>
  onCancel: () => void
  onDelete?: () => Promise<void>
  isEditMode?: boolean
  className?: string
}

export function EditKnowledgeBaseForm({
  knowledgeBase,
  knowledgeSources,
  onSubmit,
  onCancel,
  onDelete,
  isEditMode = true,
  className,
}: EditKnowledgeBaseFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = React.useState('')
  const initialSources = React.useMemo(() => 
    knowledgeBase.knowledgeSources?.map((ks) => ks.name) || [], 
    [knowledgeBase.knowledgeSources]
  )
  const [selectedSources, setSelectedSources] = React.useState<string[]>(initialSources)
  const { toast } = useToast()

  // Handle both outputMode (API response) and outputConfiguration.modality (form)
  const outputModality = (knowledgeBase as any).outputMode || knowledgeBase.outputConfiguration?.modality || 'extractiveData'
  const answerInstructions = (knowledgeBase as any).answerInstructions || knowledgeBase.outputConfiguration?.answerInstructions || ''
  
  const form = useForm<CreateKnowledgeBaseFormData>({
    resolver: zodResolver(createKnowledgeBaseSchema),
    defaultValues: {
      name: knowledgeBase.name,
      description: knowledgeBase.description || '',
      modelDeployment:
        knowledgeBase.models?.[0]?.azureOpenAIParameters?.modelName || 'gpt-4o-mini',
      sources: selectedSources,
      outputModality: outputModality as 'extractiveData' | 'answerSynthesis',
      answerInstructions,
      retrievalInstructions: knowledgeBase.retrievalInstructions || '',
    },
  })

  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = form
  const watchedModel = watch('modelDeployment')
  const watchedOutputModality = watch('outputModality')

  // Track changes
  React.useEffect(() => {
    setSelectedSources(initialSources)
    setValue('sources', initialSources, { shouldDirty: false })
  }, [initialSources, setValue])

  const toggleSource = (sourceName: string) => {
    setSelectedSources((prev) => {
      const updated = prev.includes(sourceName)
        ? prev.filter((name) => name !== sourceName)
        : [...prev, sourceName]
      setValue('sources', updated, { shouldDirty: true })
      return updated
    })
  }

  const buildPayload = (data: CreateKnowledgeBaseFormData): KnowledgeBaseData => {
    const knowledgeSourcesPayload = selectedSources.map((name) => ({ name }))
    const existingModel = knowledgeBase.models?.[0]?.azureOpenAIParameters || (knowledgeBase.models?.[0] as any)?.azureAIParameters
    const resourceUri = existingModel?.resourceUri || process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT || ''

    return {
      name: knowledgeBase.name,
      description: data.description?.trim() || undefined,
      models: [
        {
          kind: 'azureOpenAI',
          azureOpenAIParameters: {
            resourceUri,
            deploymentId: data.modelDeployment,
            modelName: data.modelDeployment,
            ...(existingModel?.apiKey ? { apiKey: existingModel.apiKey } : {}),
          },
        },
      ],
      knowledgeSources: knowledgeSourcesPayload,
      outputMode: data.outputModality,
      answerInstructions:
        data.outputModality === 'answerSynthesis'
          ? (data.answerInstructions?.trim() || undefined)
          : undefined,
      retrievalInstructions: data.retrievalInstructions?.trim() || undefined,
      ['@odata.etag']: knowledgeBase['@odata.etag'],
    } as any
  }

  const handleFormSubmit = async (data: CreateKnowledgeBaseFormData) => {
    try {
      setIsSubmitting(true)

      if (selectedSources.length === 0) {
        throw new Error('Select at least one knowledge source')
      }

      const payload = buildPayload(data)
      await onSubmit(payload)

      toast({
        type: 'success',
        title: 'Changes saved',
        description: `Knowledge base "${knowledgeBase.name}" has been updated successfully.`,
      })
    } catch (error) {
      console.error('Failed to update knowledge base:', error)
      toast({
        type: 'error',
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update knowledge base',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
    setDeleteConfirmName('')
  }

  const handleDeleteConfirm = async () => {
    if (!onDelete || deleteConfirmName !== knowledgeBase.name) return

    try {
      setIsDeleting(true)
      setShowDeleteDialog(false)
      await onDelete()
      toast({
        type: 'success',
        title: 'Knowledge base deleted',
        description: `"${knowledgeBase.name}" has been permanently removed.`,
      })
    } catch (error) {
      console.error('Failed to delete knowledge base:', error)
      toast({
        type: 'error',
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete knowledge base',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={className}>
      <FormFrame
        title={isEditMode ? `Edit ${knowledgeBase.name}` : `View ${knowledgeBase.name}`}
        description={isEditMode ? "Update your knowledge base configuration." : "View your knowledge base configuration."}
        actions={isEditMode ? [
          ...(onDelete
            ? [
                {
                  label: 'Delete knowledge base',
                  onClick: handleDeleteClick,
                  variant: 'outline' as const,
                  loading: isDeleting,
                  disabled: isSubmitting || isDeleting,
                },
              ]
            : []),
          {
            label: 'Cancel',
            onClick: onCancel,
            variant: 'ghost' as const,
          },
          {
            label: 'Save changes',
            onClick: handleSubmit(handleFormSubmit),
            loading: isSubmitting,
            disabled: isSubmitting || isDeleting || selectedSources.length === 0,
          },
        ] : [
          {
            label: 'Back',
            onClick: onCancel,
            variant: 'ghost' as const,
          },
        ]}
      >
        <form className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic information</h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <FormField name="name">
                <FormLabel required>Name (immutable)</FormLabel>
                <FormControl>
                  <Input {...register('name')} disabled />
                </FormControl>
                <FormDescription>
                  Knowledge base names cannot be changed after creation.
                </FormDescription>
              </FormField>

              <FormField name="modelDeployment">
                <div className="flex items-center gap-2">
                  <FormLabel required>Azure OpenAI deployment</FormLabel>
                  <Tooltip content="These are the supported models for knowledge base query planning. Please ensure the one selected is deployed on your Foundry resource.">
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
                    disabled={!isEditMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a deployment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4.1-mini">GPT-4.1 Mini</SelectItem>
                      <SelectItem value="gpt-4.1">GPT-4.1</SelectItem>
                      <SelectItem value="gpt-5-mini">GPT-5 Mini</SelectItem>
                      <SelectItem value="gpt-5">GPT-5</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>Choose the model that best fits your performance and cost needs.</FormDescription>
              </FormField>

              <FormField name="outputModality">
                <div className="flex items-center gap-2">
                  <FormLabel required>Output mode</FormLabel>
                  <Tooltip content="Extractive returns relevant text chunks from sources. Answer synthesis creates complete, conversational responses.">
                    <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                  </Tooltip>
                </div>
                <FormControl>
                  <Select
                    value={watchedOutputModality || 'extractiveData'}
                    onValueChange={(value) => {
                      setValue('outputModality', value as 'extractiveData' | 'answerSynthesis')
                    }}
                    disabled={!isEditMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select output mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="extractiveData">Extractive data - Return relevant chunks</SelectItem>
                      <SelectItem value="answerSynthesis">Answer synthesis - Generate full answers</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>Choose how responses are formatted and presented.</FormDescription>
              </FormField>
            </div>

            <FormField name="description" error={errors.description?.message}>
              <div className="flex items-center gap-2">
                <FormLabel>Description</FormLabel>
                <Tooltip content="A brief explanation of what this knowledge base contains and its intended use.">
                  <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                </Tooltip>
              </div>
              <FormControl>
                <Textarea
                  {...register('description')}
                  placeholder="e.g., 'Product documentation and support articles for customer service team'"
                  rows={3}
                  disabled={!isEditMode}
                />
              </FormControl>
              <FormDescription>Helps team members understand the knowledge base purpose.</FormDescription>
              <FormMessage />
            </FormField>
          </div>

          <div className="space-y-4">

            {watchedOutputModality === 'answerSynthesis' && (
              <FormField name="answerInstructions">
                <div className="flex items-center gap-2">
                  <FormLabel>Answer instructions</FormLabel>
                  <Tooltip content="Custom guidelines for how the AI should format and present synthesized answers.">
                    <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                  </Tooltip>
                </div>
                <FormControl>
                  <Textarea
                    {...register('answerInstructions')}
                    placeholder="e.g., 'Always start with a summary. Use bullet points for lists. Keep responses under 3 paragraphs.'"
                    rows={4}
                    maxLength={500}
                    disabled={!isEditMode}
                  />
                </FormControl>
                <FormDescription>Optional instructions to customize response style and tone.</FormDescription>
              </FormField>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Knowledge sources</h3>
            <FormField name="sources" error={errors.sources?.message}>
              <div className="flex items-center gap-2">
                <FormLabel required>Select sources</FormLabel>
                <Tooltip content="Data sources that this knowledge base can search and retrieve information from.">
                  <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                </Tooltip>
              </div>
              <FormControl>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-stroke-divider rounded-md p-3">
                  {knowledgeSources.length === 0 ? (
                    <div className="text-sm text-fg-muted text-center py-8">No knowledge sources available</div>
                  ) : (
                    knowledgeSources.map((source) => (
                      <label
                        key={source.name}
                        className={`flex items-center space-x-3 p-2 rounded ${isEditMode ? 'hover:bg-bg-hover cursor-pointer' : 'cursor-default'}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSources.includes(source.name)}
                          onChange={() => toggleSource(source.name)}
                          className="rounded border-stroke-divider"
                          disabled={!isEditMode}
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
                Add or remove sources that this knowledge base can access.
              </FormDescription>
              <FormMessage />
            </FormField>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Retrieval configuration</h3>
            <FormField name="retrievalInstructions" error={errors.retrievalInstructions?.message}>
              <div className="flex items-center gap-2">
                <FormLabel>Retrieval instructions</FormLabel>
                <Tooltip content="Guide how the system prioritizes and searches across knowledge sources for better results.">
                  <Info20Regular className="h-4 w-4 text-fg-muted cursor-help" />
                </Tooltip>
              </div>
              <FormControl>
                <Textarea
                  {...register('retrievalInstructions')}
                  placeholder="e.g., 'For product questions, prioritize the documentation source. For pricing, use the pricing database.'"
                  rows={4}
                  maxLength={500}
                  disabled={!isEditMode}
                />
              </FormControl>
              <FormDescription>Optional instructions to customize how information is retrieved from your sources.</FormDescription>
              <FormMessage />
            </FormField>
          </div>
        </form>
      </FormFrame>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <Warning20Regular className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Delete Knowledge Base</DialogTitle>
            </div>
            <DialogDescription className="mt-3">
              This action cannot be undone. This will permanently delete the knowledge base and remove all associated configurations.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-6 pb-4 space-y-3">
            <FormLabel className="block text-sm font-medium">
              Type <span className="font-mono font-semibold text-fg-default">{knowledgeBase.name}</span> to confirm:
            </FormLabel>
            <Input
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder={knowledgeBase.name}
              className="w-full"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setDeleteConfirmName('')
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteConfirmName !== knowledgeBase.name || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Knowledge Base'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
