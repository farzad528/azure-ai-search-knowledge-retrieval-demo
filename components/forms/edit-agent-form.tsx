'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAgentSchema, type CreateAgentFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form'
import { FormFrame } from '@/components/shared/form-frame'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

interface AgentData {
  name: string
  description?: string
  knowledgeSources: Array<{
    name: string
    includeReferences: boolean
  }>
  models: Array<{
    kind: string
    azureOpenAIParameters?: {
      resourceUri: string
      deploymentId: string
      modelName: string
    }
  }>
  outputConfiguration?: {
    modality: string
  }
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
      temperature: 0.7,
      maxTokens: 1000,
      sources: selectedSources,
      systemPrompt: '',
    },
  })

  const { register, handleSubmit, formState: { errors }, setValue, watch } = form

  const watchedModel = watch('model')
  const watchedTemperature = watch('temperature')
  const watchedMaxTokens = watch('maxTokens')

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)

      // Convert form data to Azure AI Search agent format
      const agentData: Partial<AgentData> = {
        name: data.name,
        description: data.description,
        knowledgeSources: selectedSources.map(name => ({
          name,
          includeReferences: true
        })),
        models: [{
          kind: 'azureOpenAI',
          azureOpenAIParameters: {
            resourceUri: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT || '',
            deploymentId: data.model || 'gpt-4o-mini',
            modelName: data.model || 'gpt-4o-mini'
          }
        }],
        outputConfiguration: {
          modality: 'extractiveData'
        }
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
              <FormLabel required>Agent name</FormLabel>
              <FormControl>
                <Input
                  {...register('name')}
                  placeholder="My knowledge assistant"
                  aria-invalid={errors.name ? 'true' : 'false'}
                />
              </FormControl>
              <FormDescription>
                A friendly name for your agent that users will see
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

          {/* Model Configuration - Read-only for editing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Model configuration</h3>
            
            <FormField name="model">
              <FormLabel>AI model</FormLabel>
              <FormControl>
                <div className="p-3 bg-bg-subtle rounded-md border border-stroke-divider">
                  <span className="text-sm text-fg-muted">
                    {agent.models?.[0]?.azureOpenAIParameters?.modelName || 'gpt-4o-mini'}
                  </span>
                  <p className="text-xs text-fg-muted mt-1">
                    Model configuration cannot be changed after creation
                  </p>
                </div>
              </FormControl>
            </FormField>
          </div>

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
                          <span className="text-xs text-fg-muted ml-2">({source.kind})</span>
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
        </form>
      </FormFrame>
    </div>
  )
}