import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CrisisScenarioPlatform from './CrisisScenarioPlatform'

/**
 * DASHBOARD PAGE COMPONENT  
 * Protected route that requires user authentication.
 * Main crisis scenario practice platform interface.
 */
export default async function DashboardPage() {
  const supabase = await createClient()
  
  // DEBUG: Add server-side debugging
  console.log('🔍 Dashboard: Checking server-side authentication...')
  
  // GET AUTHENTICATED USER AND SESSION
  console.log('🔍 Dashboard: Trying getSession() first...')
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  console.log('🔍 Dashboard: Session result:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    userEmail: session?.user?.email,
    sessionError: sessionError ? {
      message: sessionError.message,
      status: sessionError.status
    } : null
  })

  // Try getUser() as backup
  console.log('🔍 Dashboard: Trying getUser()...')
  const { data: { user }, error } = await supabase.auth.getUser()
  
  console.log('🔍 Dashboard: Server auth result:', {
    hasUser: !!user,
    userEmail: user?.email,
    error: error ? {
      message: error.message,
      status: error.status
    } : null,
    timestamp: new Date().toISOString()
  })
  
  // Use session user if available, fallback to getUser() result
  const finalUser = session?.user || user

  // REDIRECT IF NO VALID SESSION (backup protection)
  if ((error || !user) && (sessionError || !session)) {
    console.log('❌ Dashboard: No valid session from either method, redirecting to login')
    redirect('/login')
  }
  
  if (!finalUser) {
    console.log('❌ Dashboard: No final user found, redirecting to login')
    redirect('/login')
  }
  
  console.log('✅ Dashboard: Valid session found, rendering dashboard')

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your crisis scenarios...</p>
        </div>
      </div>
    }>
      <CrisisScenarioPlatform userId={finalUser.id} userEmail={finalUser.email || ''} />
    </Suspense>
  )
}