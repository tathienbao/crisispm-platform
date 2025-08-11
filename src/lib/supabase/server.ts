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
        /**
         * COOKIE READING CONFIGURATION
         * Retrieves all cookies from Next.js cookie store for authentication state management.
         */
        getAll() {
          return cookieStore.getAll()
        },
        
        /**
         * COOKIE WRITING CONFIGURATION  
         * Handles session cookie updates during authentication state changes.
         * Includes error handling for Server Component context where cookie writing may fail.
         */
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Ensure cookies work in production HTTPS
              const cookieOptions = {
                ...options,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
                httpOnly: false, // Allow JavaScript access
                path: '/'
              }
              cookieStore.set(name, value, cookieOptions)
            })
          } catch (error) {
            /**
             * EXPECTED BEHAVIOR: Cookie setting may fail in Server Components
             * This is normal when called from RSC context - middleware handles session refresh
             */
            console.log('Cookie setting failed (expected in RSC):', error)
          }
        },
      } as any,
    }
  )
}