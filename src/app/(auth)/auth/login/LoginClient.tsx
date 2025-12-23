'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import BrandLogo from '@/components/BrandLogo'
import { auth } from '@/lib/firebase/client'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth'

// Phone validation: Indian phone numbers (10 digits)
function validatePhoneNumber(phone: string): boolean {
  return /^\d{10}$/.test(phone)
}

// Normalize phone input: remove non-digits, limit to 10
function normalizePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10)
}

// Email validation
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation: at least 6 characters
function validatePassword(password: string): boolean {
  return password.length >= 6
}

// Get readable error message from Firebase error codes
function getFirebaseErrorMessage(error: unknown): string {
  const err = error as any
  const code = err?.code
  const message = err?.message

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email already registered. Please login instead.'
    case 'auth/invalid-email':
      return 'Invalid email address.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/user-not-found':
      return 'Email not registered. Please sign up first.'
    case 'auth/wrong-password':
      return 'Incorrect password.'
    case 'auth/too-many-requests':
      return 'Too many login attempts. Please try again later.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.'
    case 'auth/invalid-credential':
      return 'Invalid email or password.'
    default:
      return message || 'An error occurred. Please try again.'
  }
}

export default function LoginClient() {
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [recaptchaLoading, setRecaptchaLoading] = useState(false)
  const [error, setError] = useState('')
  const [authMethod, setAuthMethod] = useState<'phone' | 'email' | 'email-otp'>('phone')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || '/'

  useEffect(() => {
    // Check if we have a stored redirect URL from session
    const storedRedirect = sessionStorage.getItem('auth_redirect')
    if (storedRedirect) {
      // Keep it for after login
    }
  }, [])

  // Phone validation
  const isPhoneValid = validatePhoneNumber(phone)

  // Email validation
  const isEmailValid = validateEmail(email)
  const isPasswordValid = validatePassword(password)
  const isEmailAuthValid = isEmailValid && isPasswordValid

  async function sendOtp() {
    setError('')
    setRecaptchaLoading(true)
    setLoading(true)

    try {
      // Validate phone before Firebase call
      if (!isPhoneValid) {
        setError('Please enter a valid 10-digit mobile number')
        setRecaptchaLoading(false)
        setLoading(false)
        return Promise.reject(new Error('Invalid phone number'))
      }

      // Store redirect intent for after login
      sessionStorage.setItem('auth_redirect', redirectUrl)

      // Get reCAPTCHA container (use existing one from JSX)
      let container = document.getElementById('recaptcha-container') as HTMLElement | null
      if (!container) {
        container = document.createElement('div')
        container.id = 'recaptcha-container'
        container.style.position = 'absolute'
        container.style.visibility = 'hidden'
        document.body.appendChild(container)
      }

      // Initialize reCAPTCHA with error handling (only if not already initialized)
      if (!window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
          })
        } catch (err) {
          setError('Failed to initialize security. Please refresh the page.')
          setRecaptchaLoading(false)
          setLoading(false)
          window.recaptchaVerifier = undefined
          return Promise.reject(err)
        }
      }

      // After reCAPTCHA is ready, hide loading
      setRecaptchaLoading(false)

      const result = await signInWithPhoneNumber(
        auth,
        `+91${phone}`,
        window.recaptchaVerifier
      )

      window.confirmationResult = result
      router.push('/auth/otp')
    } catch (err) {
      // Clean up verifier on error
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear()
        } catch {
          // Ignore cleanup errors
        }
        window.recaptchaVerifier = undefined
      }

      const errorMessage = (err as Error).message

      // Parse Firebase errors
      if (errorMessage.includes('invalid-phone-number')) {
        setError('Invalid phone number format')
      } else if (errorMessage.includes('too-many-requests')) {
        setError('Too many login attempts. Please try again later.')
      } else if (errorMessage.includes('network')) {
        setError('Network error. Please check your connection.')
      } else {
        setError(errorMessage || 'Failed to send OTP. Please try again.')
      }

      setRecaptchaLoading(false)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function signupWithEmail() {
    setError('')
    setLoading(true)

    try {
      if (!isEmailValid) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      if (!isPasswordValid) {
        setError('Password must be at least 6 characters')
        setLoading(false)
        return
      }

      // Store redirect intent
      sessionStorage.setItem('auth_redirect', redirectUrl)

      // Create user with Firebase
      const result = await createUserWithEmailAndPassword(auth, email, password)

      // Get ID token
      const idToken = await result.user.getIdToken()

      // Create session via secure API
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create session')
      }

      // Session created successfully, redirect
      // Use redirect from URL parameter first, then sessionStorage as fallback
      const storedRedirect = sessionStorage.getItem('auth_redirect')
      const finalRedirect = storedRedirect || redirectUrl || '/'
      sessionStorage.removeItem('auth_redirect')

      // Use router.push instead of router.replace to ensure proper page load
      router.push(finalRedirect)
    } catch (err) {
      setError(getFirebaseErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function loginWithEmail() {
    setError('')
    setLoading(true)

    try {
      if (!isEmailValid) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      if (!isPasswordValid) {
        setError('Password must be at least 6 characters')
        setLoading(false)
        return
      }

      // Store redirect intent
      sessionStorage.setItem('auth_redirect', redirectUrl)

      // Sign in with Firebase
      const result = await signInWithEmailAndPassword(auth, email, password)

      // Get ID token
      const idToken = await result.user.getIdToken()

      // Create session via secure API
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create session')
      }

      // Session created successfully, redirect
      // Use redirect from URL parameter first, then sessionStorage as fallback
      const storedRedirect = sessionStorage.getItem('auth_redirect')
      const finalRedirect = storedRedirect || redirectUrl || '/'
      sessionStorage.removeItem('auth_redirect')

      // Use router.push instead of router.replace to ensure proper page load
      router.push(finalRedirect)
    } catch (err) {
      setError(getFirebaseErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function sendEmailOtp() {
    setError('')
    setLoading(true)

    try {
      // Validate email before Firebase call
      if (!isEmailValid) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      // Store redirect intent
      sessionStorage.setItem('auth_redirect', redirectUrl)

      // Configure email link settings
      const actionCodeSettings = {
        // URL to redirect to after email link is clicked
        url: `${window.location.origin}/auth/email-verify?redirect=${encodeURIComponent(redirectUrl)}`,
        handleCodeInApp: true,
      }

      // Send sign-in link to email
      await sendSignInLinkToEmail(auth, email, actionCodeSettings)

      // Store email in localStorage to retrieve after redirect
      window.localStorage.setItem('emailForSignIn', email)

      // Show success message
      setError('') // Clear any errors
      alert(`Verification link sent to ${email}. Please check your inbox (and spam folder).`)
    } catch (err) {
      setError(getFirebaseErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Determine if signup or login based on error history
    // Try signup first, if email exists error will guide user to login
    await signupWithEmail()
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setError('') // Clear error when user changes input
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setError('') // Clear error when user changes input
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizePhone(e.target.value)
    setPhone(normalized)
    setError('') // Clear error when user changes input
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 font-sans">
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6">
            <Link href="/" className="flex items-center flex-shrink-0 text-neutral-900 hover:text-accent transition-colors duration-200" aria-label="Home">
              <BrandLogo />
            </Link>

            <a href="#" className="font-inter text-sm font-medium text-neutral-600 hover:text-accent transition-colors duration-200">
              Need Help?
            </a>
          </div>
        </div>
      </header>

      <main className="relative flex flex-grow items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
        <div className="absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[100px]" />
        <div className="absolute -right-[10%] -bottom-[10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[120px]" />

        <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
          <div className="h-1.5 w-full bg-blue-600" />

          <div className="p-8 pb-6">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Login or Sign Up</h1>
              <p className="text-sm text-gray-500">Choose your preferred login method</p>
            </div>

            {/* Auth Method Tabs */}
            <div className="mb-6 flex gap-2 rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => { setAuthMethod('phone'); setError('') }}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${authMethod === 'phone'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Phone OTP
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('email-otp'); setError('') }}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${authMethod === 'email-otp'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Email OTP
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('email'); setError('') }}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${authMethod === 'email'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Password
              </button>
            </div>

            {/* Phone OTP Form */}
            {authMethod === 'phone' && (
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label htmlFor="mobile" className="mb-2 block text-sm font-semibold text-gray-900">
                    Mobile Number
                  </label>
                  <div className="flex rounded-lg border border-gray-200 shadow-sm transition-all focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
                    <span className="inline-flex select-none items-center rounded-l-lg border-r border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="block w-full min-w-0 flex-1 border-0 bg-transparent py-3 px-4 text-gray-900 placeholder-gray-400 focus:ring-0 sm:text-sm"
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      disabled={loading}
                    />
                  </div>

                  {/* Phone validation feedback */}
                  {phone && !isPhoneValid && (
                    <p className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Enter exactly 10 digits
                    </p>
                  )}
                  {phone && isPhoneValid && (
                    <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Valid phone number
                    </p>
                  )}
                </div>

                {/* Error message */}
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                  </div>
                )}

                {/* reCAPTCHA loading state */}
                {recaptchaLoading && (
                  <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4 border border-blue-200">
                    <div className="animate-spin">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-blue-700">Securing login with reCAPTCHA…</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading || !isPhoneValid || recaptchaLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0h6m0 0h-6m0 0h-6" />
                      </svg>
                      Sending OTP…
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>

                <p className="text-center text-xs text-gray-500">
                  By continuing, you agree to Crown And Crest&apos;s{' '}
                  <a href="#" className="font-medium text-blue-600 hover:underline">Terms of Use</a>
                  {' '}and{' '}
                  <a href="#" className="font-medium text-blue-600 hover:underline">Privacy Policy</a>.
                </p>
              </form>
            )}

            {/* Email OTP Form */}
            {authMethod === 'email-otp' && (
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); sendEmailOtp(); }}>
                <div>
                  <label htmlFor="email-otp" className="mb-2 block text-sm font-semibold text-gray-900">
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
                      id="email-otp"
                      name="email"
                      value={email}
                      onChange={handleEmailChange}
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
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0h6m0 0h-6m0 0h-6" />
                      </svg>
                      Sending verification link…
                    </>
                  ) : (
                    'Send Verification Link'
                  )}
                </button>

                <p className="text-center text-xs text-gray-500">
                  We&apos;ll send a verification link to your email. Click the link to login instantly.
                </p>
              </form>
            )}

            {/* Email/Password Form */}
            {authMethod === 'email' && (
              <form className="space-y-4" onSubmit={handleEmailAuthSubmit}>
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
                      onChange={handleEmailChange}
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

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-900">
                    Password
                  </label>
                  <div className="relative rounded-lg border border-gray-200 shadow-sm transition-all focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={password}
                      onChange={handlePasswordChange}
                      className="block w-full border-0 bg-transparent py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:ring-0"
                      placeholder="••••••••"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                  </div>

                  {/* Password validation feedback */}
                  {password && !isPasswordValid && (
                    <p className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      At least 6 characters required
                    </p>
                  )}
                  {password && isPasswordValid && (
                    <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Valid password
                    </p>
                  )}

                  <div className="mt-2 flex justify-end">
                    <Link href="/auth/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {/* Error message for email auth */}
                {error && authMethod === 'email' && (
                  <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                    {error.includes('Email already registered') && (
                      <button
                        type="button"
                        onClick={loginWithEmail}
                        className="mt-2 text-xs font-medium text-red-700 hover:text-red-800 hover:underline"
                      >
                        Login instead
                      </button>
                    )}
                  </div>
                )}

                {/* Submit button for email auth */}
                <button
                  type="submit"
                  disabled={loading || !isEmailAuthValid}
                  className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Signing up…
                    </>
                  ) : (
                    'Sign Up or Login'
                  )}
                </button>
              </form>
            )}
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
              <span>Easy Returns</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 w-full text-center">
          <p className="text-xs text-gray-400">© 2024 Crown And Crest. All rights reserved.</p>
        </div>
      </main>

      <div id="recaptcha-container" style={{ position: 'absolute', visibility: 'hidden' }} />
    </div>
  )
}