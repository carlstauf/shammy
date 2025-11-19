'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const providers = [
  { name: 'google', label: 'Google', icon: '🔍' },
  { name: 'github', label: 'GitHub', icon: '🐙' },
  { name: 'azure', label: 'Microsoft', icon: '🪟' },
] as const

type ProviderName = (typeof providers)[number]['name']

export default function LoginPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState<ProviderName | null>(null)

  async function signInWithProvider(provider: ProviderName) {
    setLoading(provider)

    const target = `${window.location.origin}/auth/callback`

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: target,
        scopes: getScopes(provider),
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('Error signing in:', error)
      alert('Error signing in. Please try again.')
      setLoading(null)
    }
  }

  function getScopes(provider: ProviderName) {
    switch (provider) {
      case 'google':
        return [
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/drive.readonly',
        ].join(' ')
      case 'github':
        return 'repo read:user read:org'
      case 'azure':
        return 'Mail.Read Calendars.Read Files.Read'
      default:
        return ''
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to Shammy</CardTitle>
          <CardDescription>
            Connect your data sources and unlock complete AI context.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers.map((provider) => (
            <Button
              key={provider.name}
              onClick={() => signInWithProvider(provider.name)}
              disabled={loading !== null}
              className="w-full"
              variant="outline"
              size="lg"
            >
              {loading === provider.name ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <span className="text-2xl">{provider.icon}</span>
                  Sign in with {provider.label}
                </span>
              )}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
