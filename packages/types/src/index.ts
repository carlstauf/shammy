import { z } from 'zod'

export const providers = [
  'gmail',
  'github',
  'google-calendar',
  'google-drive',
  'slack',
  'notion',
  'spotify',
  'twitter',
  'linkedin',
] as const

export type Provider = (typeof providers)[number]

export const connectionStatuses = ['pending', 'active', 'failed', 'paused'] as const
export type ConnectionStatus = (typeof connectionStatuses)[number]

export const syncStatuses = ['running', 'success', 'failed'] as const
export type SyncStatus = (typeof syncStatuses)[number]

export const createConnectionSchema = z.object({
  provider: z.enum(providers),
  config: z.record(z.unknown()).optional(),
})

export const updateConnectionSchema = z.object({
  status: z.enum(connectionStatuses).optional(),
  syncFrequencyHours: z.number().positive().optional(),
  config: z.record(z.unknown()).optional(),
})

export const searchHistorySchema = z.object({
  query: z.string(),
  sources: z.array(z.enum(providers)).optional(),
  limit: z.number().positive().default(20),
  offset: z.number().nonnegative().default(0),
})

export const getTimelineSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  providers: z.array(z.enum(providers)).optional(),
})

export const searchEmailsSchema = z.object({
  query: z.string(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  limit: z.number().positive().default(20),
})

export type CreateConnectionInput = z.infer<typeof createConnectionSchema>
export type UpdateConnectionInput = z.infer<typeof updateConnectionSchema>
export type SearchHistoryInput = z.infer<typeof searchHistorySchema>
export type GetTimelineInput = z.infer<typeof getTimelineSchema>
export type SearchEmailsInput = z.infer<typeof searchEmailsSchema>
