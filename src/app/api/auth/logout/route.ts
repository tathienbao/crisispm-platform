import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * LOGOUT API ROUTE
 * Handles user logout by clearing authentication session and cookies.
 * Redirects to home page after successful logout.
 */
export async function POST() {
  try {
    const supabase = await createClient()
    
    // SIGN OUT USER AND CLEAR SESSION
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error.message)
      return NextResponse.json(
        { error: 'Failed to logout' },
        { status: 500 }
      )
    }

    // SUCCESSFUL LOGOUT - REDIRECT TO HOME
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
    
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}