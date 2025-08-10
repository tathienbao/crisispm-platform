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
    <div className="max-w-md mx-auto">
      {/* PAGE HEADER */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">CM</span>
          </div>
          <span className="font-bold text-2xl text-gray-900">CrisisPM</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back
        </h1>
        <p className="text-gray-600">
          Continue your crisis management journey
        </p>
      </div>

      {/* LOGIN FORM */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <form onSubmit={handleLogin} className="space-y-6">
          {/* EMAIL INPUT */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          {/* PASSWORD INPUT */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </button>

          {/* SIGNUP LINK */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              New to CrisisPM?{' '}
              <Link 
                href="/signup" 
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Create free account
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* FEATURES REMINDER */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-4">Join thousands of PMs mastering crisis management</p>
        <div className="flex justify-center space-x-8 text-xs text-gray-400">
          <div className="flex items-center">
            <span className="mr-1">🎯</span>
            44k+ scenarios
          </div>
          <div className="flex items-center">
            <span className="mr-1">🧠</span>
            Expert assessment
          </div>
          <div className="flex items-center">
            <span className="mr-1">📊</span>
            Progress tracking
          </div>
        </div>
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