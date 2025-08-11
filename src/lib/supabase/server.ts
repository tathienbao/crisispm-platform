import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

/**
 * SERVER-SIDE SUPABASE CLIENT
 * Creates an authenticated Supabase client for server-side operations in Next.js App Router.
 * Handles cookie-based authentication and session management for server components and API routes.
 * 
 * Usage contexts:
 * - Server Components (React Server Components)  
 * - Route Handlers (API routes)
 * - Server Actions
 * - Middleware functions
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      } as any,
    }
  )
}