import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * SESSION MANAGEMENT MIDDLEWARE
 * Handles Supabase authentication session refresh and route protection.
 * This middleware runs on every request to ensure authentication tokens remain valid
 * and protects routes that require authentication.
 * 
 * Critical functions:
 * - Refreshes expired user sessions automatically
 * - Synchronizes cookies between request/response for authentication state
 * - Redirects unauthenticated users from protected routes
 * - Ensures server components receive valid authentication context
 */
export async function updateSession(request: NextRequest) {
  /**
   * RESPONSE INITIALIZATION
   * Create NextResponse that will be modified with authentication cookies.
   * IMPORTANT: This response object must be returned as-is to maintain session integrity.
   */
  let supabaseResponse = NextResponse.next({
    request,
  })

  /**
   * SUPABASE CLIENT CONFIGURATION
   * Creates server client with cookie synchronization for authentication.
   * Handles both reading existing cookies and setting new ones during session refresh.
   */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * COOKIE READING - Get all cookies from the incoming request
         */
        getAll() {
          return request.cookies.getAll()
        },
        
        /**
         * COOKIE WRITING - Set cookies in both request and response
         * This dual setting ensures proper synchronization between browser and server
         */
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Set cookie in request for current processing
            request.cookies.set(name, value)
            
            // Set cookie in response with proper production settings
            const cookieOptions = {
              ...options,
              secure: true, // Always secure in middleware (production)
              sameSite: 'lax' as const,
              httpOnly: false,
              path: '/'
            }
            supabaseResponse.cookies.set(name, value, cookieOptions)
          })
          
          // Create new response with updated request cookies
          supabaseResponse = NextResponse.next({
            request,
          })
        },
      } as any,
    }
  )

  /**
   * CRITICAL: USER AUTHENTICATION CHECK
   * This MUST be called to refresh expired tokens and validate current session.
   * DO NOT add logic between createServerClient and supabase.auth.getUser()!
   */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  /**
   * ROUTE PROTECTION LOGIC
   * Redirect unauthenticated users away from protected routes.
   * Allow access to public routes (login, auth callbacks, static assets).
   */
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    request.nextUrl.pathname !== '/'
  ) {
    // Redirect to login page with return URL for post-auth navigation
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  /**
   * CRITICAL: Return the supabaseResponse object unchanged
   * This response contains the updated authentication cookies that maintain session state.
   * Any modification could cause authentication failures and random user logouts.
   */
  return supabaseResponse
}