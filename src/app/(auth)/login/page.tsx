'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

/**
 * LOGIN FORM COMPONENT (WITH SEARCH PARAMS)
 * Handles user authentication with email/password using Supabase Auth.
 * Includes form validation, error handling, and post-auth redirection.
 */
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * AUTHENTICATION HANDLER
   * Processes login form submission with comprehensive error handling.
   * Redirects to intended destination after successful authentication.
   */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      // Successful authentication - redirect to intended page
      router.push(redirectTo as any)
      router.refresh()
      
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* PAGE HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Continue your crisis management training
        </p>
      </div>

      {/* LOGIN FORM */}
      <form onSubmit={handleLogin} className="space-y-6">
        {/* EMAIL INPUT */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
            disabled={loading}
          />
        </div>

        {/* PASSWORD INPUT */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
            disabled={loading}
          />
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              {error}
            </div>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>

        {/* SIGNUP LINK */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link 
              href="/signup" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </form>

      {/* DEBUG INFO - REMOVE IN PRODUCTION */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
        <strong>Debug Info:</strong><br />
        Redirect destination: {redirectTo}<br />
        Form state: {loading ? 'Loading...' : 'Ready'}
      </div>
    </div>
  )
}

/**
 * LOGIN PAGE WRAPPER WITH SUSPENSE
 * Wraps LoginForm in Suspense boundary to handle useSearchParams() properly
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}