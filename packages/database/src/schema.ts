import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  bigint,
  jsonb,
  pgSchema,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const shammy = pgSchema('shammy')

export const users = shammy.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastSeenAt: timestamp('last_seen_at'),
  metadata: jsonb('metadata').default({}).notNull(),
})

export const connections = shammy.table('connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(),
  status: text('status').notNull().default('pending'),
  airbyteSourceId: uuid('airbyte_source_id'),
  airbyteDestinationId: uuid('airbyte_destination_id'),
  airbyteConnectionId: uuid('airbyte_connection_id'),
  config: jsonb('config').default({}).notNull(),
  credentialsEncrypted: text('credentials_encrypted'),
  lastSyncAt: timestamp('last_sync_at'),
  nextSyncAt: timestamp('next_sync_at'),
  syncFrequencyHours: integer('sync_frequency_hours').default(24),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const syncLogs = shammy.table('sync_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  connectionId: uuid('connection_id')
    .notNull()
    .references(() => connections.id, { onDelete: 'cascade' }),
  status: text('status').notNull(),
  recordsSynced: integer('records_synced').default(0),
  bytesSynced: bigint('bytes_synced', { mode: 'number' }).default(0),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata').default({}).notNull(),
})

export const usersRelations = relations(users, ({ many }) => ({
  connections: many(connections),
}))

export const connectionsRelations = relations(connections, ({ one, many }) => ({
  user: one(users, {
    fields: [connections.userId],
    references: [users.id],
  }),
  syncLogs: many(syncLogs),
}))

export const syncLogsRelations = relations(syncLogs, ({ one }) => ({
  connection: one(connections, {
    fields: [syncLogs.connectionId],
    references: [connections.id],
  }),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Connection = typeof connections.$inferSelect
export type NewConnection = typeof connections.$inferInsert
export type SyncLog = typeof syncLogs.$inferSelect
export type NewSyncLog = typeof syncLogs.$inferInsert
