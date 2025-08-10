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
  
  // GET AUTHENTICATED USER
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // REDIRECT IF NO VALID SESSION (backup protection)
  if (error || !user) {
    redirect('/login')
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your crisis scenarios...</p>
        </div>
      </div>
    }>
      <CrisisScenarioPlatform userId={user.id} userEmail={user.email || ''} />
    </Suspense>
  )
}