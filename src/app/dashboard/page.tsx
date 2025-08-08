import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * DASHBOARD PAGE COMPONENT  
 * Protected route that requires user authentication.
 * Displays user profile info, progress tracking, and logout functionality.
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
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user.email}
            </p>
          </div>
          
          {/* LOGOUT BUTTON */}
          <form action="/api/auth/logout" method="POST">
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Logout
            </button>
          </form>
        </div>

        {/* USER PROFILE CARD */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">
            ✅ Authentication System Active
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">User Information</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email Verified:</strong> {user.email_confirmed_at ? 'Yes' : 'Pending'}</p>
                <p><strong>Last Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Next Steps</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Set up Supabase project with environment variables</li>
                <li>• Create database schema and RLS policies</li>
                <li>• Build crisis scenario generation system</li>
                <li>• Implement AI scoring with Groq integration</li>
              </ul>
            </div>
          </div>
        </div>

        {/* DEVELOPMENT STATUS */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">
            🚧 Development Status
          </h2>
          <p className="text-blue-700 mb-4">
            Authentication system complete! Ready for database setup and core features.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded">
              <div className="text-green-600 font-medium">✅ Completed</div>
              <ul className="mt-1 text-gray-600 space-y-1">
                <li>• Next.js 15 + TypeScript setup</li>
                <li>• Supabase client configuration</li>
                <li>• Authentication middleware</li>
                <li>• Login/Signup pages</li>
              </ul>
            </div>
            
            <div className="bg-white p-3 rounded">
              <div className="text-yellow-600 font-medium">🚧 In Progress</div>
              <ul className="mt-1 text-gray-600 space-y-1">
                <li>• Database schema design</li>
                <li>• User profile management</li>
                <li>• Crisis scenario system</li>
              </ul>
            </div>
            
            <div className="bg-white p-3 rounded">
              <div className="text-gray-500 font-medium">📋 Planned</div>
              <ul className="mt-1 text-gray-600 space-y-1">
                <li>• AI assessment integration</li>
                <li>• Progress tracking</li>
                <li>• Payment system</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}