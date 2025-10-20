import * as z from 'zod'

// Knowledge base creation validation schema aligned with Search 2025-11-01-preview.
export const createKnowledgeBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Knowledge base name is required')
    .max(64, 'Knowledge base name must be 64 characters or less')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  modelDeployment: z
    .string()
    .min(1, 'Model selection is required'),
  outputModality: z.enum(['extractiveData', 'answerSynthesis']),
  answerInstructions: z
    .string()
    .max(500, 'Answer instructions must be 500 characters or less')
    .optional(),
  retrievalInstructions: z
    .string()
    .max(500, 'Retrieval instructions must be 500 characters or less')
    .optional(),
  includeReferences: z.boolean(),
  includeReferenceSourceData: z.boolean(),
  alwaysQuerySource: z.boolean(),
  maxSubQueries: z
    .number()
    .min(1, 'Minimum 1 sub-query')
  .max(20, 'Maximum 20 sub-queries'),
  rerankerThreshold: z
    .number()
    .min(0, 'Minimum threshold is 0.0')
    .max(5, 'Maximum threshold is 5.0'),
  includeActivity: z.boolean(),
  sources: z
    .array(z.string())
    .min(1, 'Select at least one knowledge source'),
})

export type CreateKnowledgeBaseFormData = z.infer<typeof createKnowledgeBaseSchema>

// Knowledge Source validation schema  
export const createSourceSchema = z.object({
  name: z
    .string()
    .min(1, 'Source name is required')
    .max(100, 'Source name must be less than 100 characters'),
  
  type: z.enum(['searchIndex', 'web', 'azureBlob']),
  
  endpoint: z
    .string()
    .url('Please enter a valid URL')
    .optional(),
  
  apiKey: z
    .string()
    .min(1, 'API key is required')
    .optional(),
  
  indexName: z
    .string()
    .min(1, 'Index name is required')
    .optional(),
  
  containerName: z
    .string()
    .min(1, 'Container name is required')
    .optional(),
})

export type CreateSourceFormData = z.infer<typeof createSourceSchema>

// User settings validation schema
export const userSettingsSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be less than 50 characters'),
  
  email: z
    .string()
    .email('Please enter a valid email address'),
  
  theme: z.enum(['light', 'dark', 'system']),
  
  notifications: z.object({
    email: z.boolean().default(true),
    desktop: z.boolean().default(false),
    mobile: z.boolean().default(true),
  }),
  
  preferences: z.object({
    defaultModel: z.string().optional(),
    autoSave: z.boolean().default(true),
    compactMode: z.boolean().default(false),
  }),
})

export type UserSettingsFormData = z.infer<typeof userSettingsSchema>