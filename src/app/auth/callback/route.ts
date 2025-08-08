import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * AUTHENTICATION CALLBACK HANDLER
 * Processes email confirmation links and redirects after successful auth.
 * Handles the OAuth flow completion for Supabase authentication.
 * 
 * This route is called when users click email confirmation links.
 * It exchanges the auth code for a valid session and redirects appropriately.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    // EXCHANGE CODE FOR SESSION
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error.message)
      
      // REDIRECT TO ERROR PAGE WITH MESSAGE
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`
      )
    }
  }

  // SUCCESSFUL AUTHENTICATION - REDIRECT TO INTENDED DESTINATION
  return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)
}