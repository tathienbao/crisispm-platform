'use client'

import { useState, useEffect } from 'react'

/**
 * ENVIRONMENT DEBUG COMPONENT
 * Shows environment variables and configuration for debugging authentication issues.
 * Only visible in development mode for security.
 */
export function EnvironmentDebug() {
  const [isClient, setIsClient] = useState(false)
  
  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }
  
  // Prevent hydration mismatch by only showing client-specific data after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  const envVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
      `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'NOT SET',
    'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL,
    'NODE_ENV': process.env.NODE_ENV
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2 text-yellow-400">🐛 Debug Info (Dev Only)</h3>
      <div className="space-y-1">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-gray-300">{key}:</span>
            <span className={value && value !== 'NOT SET' ? 'text-green-400' : 'text-red-400'}>
              {value || 'NOT SET'}
            </span>
          </div>
        ))}
      </div>
      {isClient && (
        <div className="mt-2 pt-2 border-t border-gray-600 text-gray-400">
          <div>Window location: {window.location.origin}</div>
          <div>Timestamp: {new Date().toLocaleTimeString()}</div>
        </div>
      )}
    </div>
  )
}

/**
 * AUTHENTICATION STATUS DEBUG
 * Shows current authentication state for debugging
 */
export function AuthDebug({ user, session }: { user: any, session: any }) {
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-blue-900 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2 text-blue-400">🔐 Auth Debug (Dev Only)</h3>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-300">User:</span>
          <span className={user ? 'text-green-400' : 'text-red-400'}>
            {user ? `${user.email} (${user.id?.substring(0, 8)}...)` : 'NOT LOGGED IN'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Session:</span>
          <span className={session ? 'text-green-400' : 'text-red-400'}>
            {session ? 'ACTIVE' : 'NONE'}
          </span>
        </div>
        {user?.email_confirmed_at && (
          <div className="flex justify-between">
            <span className="text-gray-300">Confirmed:</span>
            <span className="text-green-400">
              {new Date(user.email_confirmed_at).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}