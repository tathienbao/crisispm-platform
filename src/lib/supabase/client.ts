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
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
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