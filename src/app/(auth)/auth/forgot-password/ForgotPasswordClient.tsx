'use client'

import { useState } from 'react'
import Link from 'next/link'
import { auth } from '@/lib/firebase/client'
import { sendPasswordResetEmail } from 'firebase/auth'
import BrandLogo from '@/components/BrandLogo'

// Email validation
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Get readable error message from Firebase error codes
function getFirebaseErrorMessage(error: unknown): string {
  const err = error as any
  const code = err?.code
  const message = err?.message

  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.'
    case 'auth/invalid-email':
      return 'Invalid email address.'
    case 'auth/too-many-requests':
      return 'Too many reset attempts. Please try again later.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.'
    default:
      return message || 'Failed to send reset email. Please try again.'
  }
}

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const isEmailValid = validateEmail(email)

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      if (!isEmailValid) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      // Send password reset email via Firebase
      await sendPasswordResetEmail(auth, email)

      // Show success message
      setSuccess(true)
      setEmail('')
    } catch (err) {
      setError(getFirebaseErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 font-sans">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm lg:px-10">
        <div className="flex items-center">
          <BrandLogo />
        </div>

        <Link href="/auth/login" className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-blue-600">
          Back to Login
        </Link>
      </header>

      <main className="relative flex flex-grow items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
        <div className="absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[100px]" />
        <div className="absolute -right-[10%] -bottom-[10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[120px]" />

        <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
          <div className="h-1.5 w-full bg-blue-600" />

          <div className="p-8 pb-6">
            <div className="mb-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl mx-auto">
                🔐
              </div>
              <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Reset Password</h1>
              <p className="text-sm text-gray-500">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {success ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-green-900">Email sent!</h3>
                      <p className="mt-1 text-sm text-green-700">
                        Check your email for a link to reset your password. The link will expire in 1 hour.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/auth/login"
                  className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleResetPassword}>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-900">
                    Email Address
                  </label>
                  <div className="relative rounded-lg border border-gray-200 shadow-sm transition-all focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError('')
                      }}
                      className="block w-full border-0 bg-transparent py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:ring-0"
                      placeholder="name@example.com"
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>

                  {/* Email validation feedback */}
                  {email && !isEmailValid && (
                    <p className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Invalid email format
                    </p>
                  )}
                  {email && isEmailValid && (
                    <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Valid email
                    </p>
                  )}
                </div>

                {/* Error message */}
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !isEmailValid}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Sending reset link…
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>

                <p className="text-center text-xs text-gray-500">
                  Remember your password?{' '}
                  <Link href="/auth/login" className="font-medium text-blue-600 hover:underline">
                    Back to login
                  </Link>
                </p>
              </form>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200" />
              </div>
            </div>

            <p className="text-center text-xs text-gray-500">
              By continuing, you agree to Crown And Crest&apos;s{' '}
              <a href="#" className="font-medium text-blue-600 hover:underline">
                Terms of Use
              </a>
              {' '}and{' '}
              <a href="#" className="font-medium text-blue-600 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-8 py-4 text-xs font-medium text-gray-500">
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              <span>Fast Reset</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 w-full text-center">
          <p className="text-xs text-gray-400">© 2024 Crown And Crest. All rights reserved.</p>
        </div>
      </main>
    </div>
  )
}
