'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/firebase/client'
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'

function EmailVerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    async function verifyEmailLink() {
      try {
        // Check if the URL is a sign-in with email link
        if (!isSignInWithEmailLink(auth, window.location.href)) {
          setStatus('error')
          setError('Invalid verification link')
          return
        }

        // Get the email from localStorage
        let email = window.localStorage.getItem('emailForSignIn')

        // If email is not in localStorage, prompt user to enter it
        if (!email) {
          email = window.prompt('Please provide your email for confirmation')
        }

        if (!email) {
          setStatus('error')
          setError('Email is required to complete verification')
          return
        }

        // Sign in with email link
        const result = await signInWithEmailLink(auth, email, window.location.href)

        // Get the ID token
        const idToken = await result.user.getIdToken()

        // Create session via API
        const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        })

        if (!response.ok) {
          throw new Error('Failed to create session')
        }

        // Clear the email from localStorage
        window.localStorage.removeItem('emailForSignIn')

        // Get redirect URL from query params or session storage
        const redirectUrl = searchParams.get('redirect') ||
          sessionStorage.getItem('auth_redirect') ||
          '/account'

        // Clear session storage
        sessionStorage.removeItem('auth_redirect')

        setStatus('success')

        // Redirect after a brief delay
        setTimeout(() => {
          router.push(redirectUrl)
        }, 1500)

      } catch (err: unknown) {
        console.error('Email verification error:', err)
        setStatus('error')
        const errorMessage = err instanceof Error ? err.message : 'Failed to verify email link'
        setError(errorMessage)
      }
    }

    verifyEmailLink()
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        {status === 'verifying' && (
          <>
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <h2 className="mb-2 text-xl font-bold text-gray-900">Verifying Email</h2>
            <p className="text-sm text-gray-600">Please wait while we verify your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">Email Verified!</h2>
            <p className="text-sm text-gray-600">Redirecting you now...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">Verification Failed</h2>
            <p className="mb-4 text-sm text-gray-600">{error}</p>
            <button
              onClick={() => router.push('/auth')}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function EmailVerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    }>
      <EmailVerifyContent />
    </Suspense>
  )
}
