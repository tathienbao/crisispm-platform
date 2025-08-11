import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * CLIENT-SIDE SUPABASE CLIENT
 * Creates a Supabase client optimized for browser environments and client-side operations.
 * Handles authentication state, real-time subscriptions, and user interactions.
 * 
 * Usage contexts:
 * - Client Components ('use client')
 * - Real-time subscriptions  
 * - Interactive user authentication (login/signup forms)
 * - File uploads and storage operations
 * - Client-side data mutations
 */
export function createClient() {
  console.log('🔧 Creating Supabase client with config:', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)
  })

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )

  // Add auth state change listener for debugging
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔐 Auth State Change:', {
      event,
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      timestamp: new Date().toISOString()
    })
  })

  return supabase
}

/**
 * SINGLETON CLIENT INSTANCE
 * Provides a cached client instance to avoid creating multiple connections in client components.
 * Useful for React hooks and components that need consistent client reference.
 */
let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getClient() {
  if (!client) {
    client = createClient()
  }
  return client
}