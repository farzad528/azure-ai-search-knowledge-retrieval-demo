import * as z from 'zod'

// Knowledge Agent validation schema
export const createAgentSchema = z.object({
  name: z
    .string()
    .min(1, 'Agent name is required')
    .max(100, 'Agent name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Agent name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  model: z
    .string()
    .min(1, 'Model selection is required'),
  
  temperature: z
    .number()
    .min(0, 'Temperature must be at least 0')
    .max(2, 'Temperature must be at most 2')
    .default(0.7),
  
  maxTokens: z
    .number()
    .min(1, 'Max tokens must be at least 1')
    .max(4000, 'Max tokens must be at most 4000')
    .default(1000),
  
  sources: z
    .array(z.string())
    .min(1, 'At least one knowledge source is required'),
  
  systemPrompt: z
    .string()
    .max(2000, 'System prompt must be less than 2000 characters')
    .optional(),
})

export type CreateAgentFormData = z.infer<typeof createAgentSchema>

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