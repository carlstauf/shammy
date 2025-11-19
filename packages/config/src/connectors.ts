import type { Provider } from '@shammy/types'

export interface ConnectorConfig {
  name: string
  displayName: string
  description: string
  icon: string
  category: 'email' | 'productivity' | 'code' | 'social' | 'storage' | 'other'
  airbyteSourceDefinitionId: string
  oauthScopes: string[]
  syncStreams: string[]
  requiredCredentials: string[]
}

export const connectorConfigs: Record<Provider, ConnectorConfig> = {
  gmail: {
    name: 'gmail',
    displayName: 'Gmail',
    description: 'Sync your email history',
    icon: '📧',
    category: 'email',
    airbyteSourceDefinitionId: 'TBD',
    oauthScopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    syncStreams: ['messages', 'labels', 'threads'],
    requiredCredentials: ['access_token', 'refresh_token'],
  },
  github: {
    name: 'github',
    displayName: 'GitHub',
    description: 'Sync repositories, commits, and issues',
    icon: '🐙',
    category: 'code',
    airbyteSourceDefinitionId: 'TBD',
    oauthScopes: ['repo', 'read:user', 'read:org'],
    syncStreams: ['commits', 'pull_requests', 'issues', 'repositories'],
    requiredCredentials: ['personal_access_token'],
  },
  'google-calendar': {
    name: 'google-calendar',
    displayName: 'Google Calendar',
    description: 'Sync your calendar events',
    icon: '📅',
    category: 'productivity',
    airbyteSourceDefinitionId: 'TBD',
    oauthScopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    syncStreams: ['events'],
    requiredCredentials: ['access_token', 'refresh_token'],
  },
  'google-drive': {
    name: 'google-drive',
    displayName: 'Google Drive',
    description: 'Sync files and metadata',
    icon: '📁',
    category: 'storage',
    airbyteSourceDefinitionId: 'TBD',
    oauthScopes: ['https://www.googleapis.com/auth/drive.readonly'],
    syncStreams: ['files', 'permissions'],
    requiredCredentials: ['access_token', 'refresh_token'],
  },
  slack: {
    name: 'slack',
    displayName: 'Slack',
    description: 'Sync channels and messages',
    icon: '💬',
    category: 'productivity',
    airbyteSourceDefinitionId: 'TBD',
    oauthScopes: ['channels:history', 'groups:history', 'im:history'],
    syncStreams: ['channels', 'messages', 'users'],
    requiredCredentials: ['bot_token'],
  },
  notion: {
    name: 'notion',
    displayName: 'Notion',
    description: 'Sync pages and databases',
    icon: '🧱',
    category: 'productivity',
    airbyteSourceDefinitionId: 'TBD',
    oauthScopes: ['databases.read', 'pages.read'],
    syncStreams: ['pages', 'databases'],
    requiredCredentials: ['integration_token'],
  },
  spotify: {
    name: 'spotify',
    displayName: 'Spotify',
    description: 'Sync listening history',
    icon: '🎧',
    category: 'other',
    airbyteSourceDefinitionId: 'TBD',
    oauthScopes: ['user-read-recently-played'],
    syncStreams: ['recently_played', 'top_artists'],
    requiredCredentials: ['access_token', 'refresh_token'],
  },
  twitter: {
    name: 'twitter',
    displayName: 'Twitter',
    description: 'Sync tweets and DMs',
    icon: '🐦',
    category: 'social',
    airbyteSourceDefinitionId: 'TBD',
    oauthScopes: ['tweet.read', 'dm.read'],
    syncStreams: ['tweets', 'direct_messages'],
    requiredCredentials: ['bearer_token'],
  },
  linkedin: {
    name: 'linkedin',
    displayName: 'LinkedIn',
    description: 'Sync connections and activity',
    icon: '💼',
    category: 'social',
    airbyteSourceDefinitionId: 'TBD',
    oauthScopes: ['r_liteprofile', 'r_emailaddress'],
    syncStreams: ['connections', 'activities'],
    requiredCredentials: ['access_token', 'refresh_token'],
  },
}
