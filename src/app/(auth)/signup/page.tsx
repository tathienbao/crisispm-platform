'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

/**
 * SIGNUP PAGE COMPONENT
 * Handles new user registration with email/password using Supabase Auth.
 * Creates user account and profile, then redirects to onboarding flow.
 */
export default function SignupPage() {
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  /**
   * REGISTRATION HANDLER
   * Processes signup form with validation, account creation, and profile setup.
   * Handles email confirmation flow and initial user onboarding.
   */
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // FORM VALIDATION
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long')
        return
      }

      const supabase = createClient()
      
      // CREATE USER ACCOUNT
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            email: email.trim(),
          }
        }
      })

      if (authError) {
        setError(authError.message)
        return
      }

      // SUCCESS STATE - EMAIL CONFIRMATION REQUIRED
      setSuccess(true)
      
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Signup error:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * SUCCESS CONFIRMATION VIEW
   * Displays email confirmation instructions after successful registration.
   */
  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg 
            className="h-6 w-6 text-green-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth="1.5" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Check your email
        </h2>
        
        <p className="mt-2 text-gray-600">
          We&apos;ve sent a confirmation link to:
        </p>
        <p className="font-medium text-gray-900">
          {email}
        </p>
        
        <p className="mt-4 text-sm text-gray-500">
          Click the link in your email to activate your account and start your crisis management training.
        </p>

        <div className="mt-6">
          <Link 
            href="/login"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Return to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* PAGE HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Start mastering crisis management today
        </p>
      </div>

      {/* SIGNUP FORM */}
      <form onSubmit={handleSignup} className="space-y-6">
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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Create a password (min 6 characters)"
            disabled={loading}
          />
        </div>

        {/* CONFIRM PASSWORD INPUT */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Confirm your password"
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

        {/* TERMS OF SERVICE */}
        <div className="text-sm text-gray-500">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-blue-600 hover:text-blue-500">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
            Privacy Policy
          </Link>
        </div>

        {/* SUBMIT BUTTON */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </div>

        {/* LOGIN LINK */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}