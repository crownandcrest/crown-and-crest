'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import EnterStep from './steps/EnterStep'
import OtpStep from './steps/OtpStep'
import EmailStep from './steps/EmailStep'
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

export type AuthStep = 'enter' | 'otp' | 'email'

function validatePhoneNumber(phone: string): boolean {
  return /^\d{10}$/.test(phone)
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10)
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePassword(password: string): boolean {
  return password.length >= 6
}

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

export default function AuthClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const otpInputRef = useRef<HTMLInputElement>(null!)

  const redirectUrl = useMemo(() => searchParams.get('redirect') || '/', [searchParams])

  const [step, setStep] = useState<AuthStep>('enter')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [recaptchaLoading, setRecaptchaLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [resendLoading, setResendLoading] = useState(false)

  // Focus OTP input when entering OTP step
  useEffect(() => {
    if (step === 'otp' && otpInputRef.current) {
      otpInputRef.current.focus()
    }
  }, [step])

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const id = window.setInterval(() => setResendTimer((prev) => prev - 1), 1000)
    return () => window.clearInterval(id)
  }, [resendTimer])

  const isPhoneValid = validatePhoneNumber(phone)
  const isEmailValid = validateEmail(email)
  const isPasswordValid = validatePassword(password)
  const isEmailAuthValid = isEmailValid && isPasswordValid

  const finalRedirect = () => {
    const storedRedirect = sessionStorage.getItem('auth_redirect')
    const target = storedRedirect || redirectUrl || '/'
    sessionStorage.removeItem('auth_redirect')
    return target
  }



  async function sendOtp() {
    setError('')
    setRecaptchaLoading(true)
    setLoading(true)

    try {
      if (!validatePhoneNumber(phone)) {
        setError('Please enter a valid 10-digit mobile number')
        return
      }

      sessionStorage.setItem('auth_redirect', redirectUrl)

      let container = document.getElementById('recaptcha-container') as HTMLElement | null
      if (!container) {
        container = document.createElement('div')
        container.id = 'recaptcha-container'
        container.style.position = 'absolute'
        container.style.visibility = 'hidden'
        document.body.appendChild(container)
      }

      if (!window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
          })
        } catch (err) {
          setError('Failed to initialize security. Please refresh the page.')
          window.recaptchaVerifier = undefined
          return
        }
      }

      setRecaptchaLoading(false)

      const result = await signInWithPhoneNumber(auth, `+91${phone}`, window.recaptchaVerifier)

      window.confirmationResult = result
      setResendTimer(45)
      setStep('otp')
    } catch (err) {
      try {
        window.recaptchaVerifier?.clear()
      } catch (clearError) {
        // Ignore clear errors
      }
      window.recaptchaVerifier = undefined

      const errorMessage = (err as Error).message

      if (errorMessage.includes('invalid-phone-number')) {
        setError('Invalid phone number format')
      } else if (errorMessage.includes('too-many-requests')) {
        setError('Too many login attempts. Please try again later.')
      } else if (errorMessage.includes('network')) {
        setError('Network error. Please check your connection.')
      } else {
        setError(errorMessage || 'Failed to send OTP. Please try again.')
      }
    } finally {
      setLoading(false)
      setRecaptchaLoading(false)
    }
  }

  async function verifyOtp() {
    setError('')

    if (!window.confirmationResult) {
      setError('OTP session expired. Please login again.')
      setStep('enter')
      return
    }

    if (!code.trim()) {
      setError('Please enter the OTP code')
      return
    }

    if (code.length !== 6) {
      setError('OTP must be 6 digits')
      return
    }

    setLoading(true)

    try {
      const result = await window.confirmationResult.confirm(code)
      const idToken = await result.user.getIdToken()

      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Session creation failed')
      }

      router.push(finalRedirect())
    } catch (err) {
      const errorMessage = (err as Error).message

      if (errorMessage.includes('invalid-verification-code')) {
        setError('Invalid OTP. Please check and try again.')
      } else if (errorMessage.includes('code-expired')) {
        setError('OTP expired. Please request a new code.')
      } else if (errorMessage.includes('too-many-requests')) {
        setError('Too many attempts. Please try again later.')
      } else if (errorMessage.includes('network')) {
        setError('Network error. Please check your connection.')
      } else {
        setError(errorMessage || 'Failed to verify OTP. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function resendOtp() {
    setError('')
    setResendLoading(true)

    try {
      if (!window.confirmationResult) {
        setError('Session expired. Please login again.')
        setStep('enter')
        return
      }

      await sendOtp()
    } catch (err) {
      setError((err as Error).message || 'Failed to resend OTP')
    } finally {
      setResendLoading(false)
    }
  }

  async function signupWithEmail() {
    setError('')
    setLoading(true)

    try {
      if (!validateEmail(email)) {
        setError('Please enter a valid email address')
        return
      }

      if (!validatePassword(password)) {
        setError('Password must be at least 6 characters')
        return
      }

      sessionStorage.setItem('auth_redirect', redirectUrl)

      const result = await createUserWithEmailAndPassword(auth, email, password)
      const idToken = await result.user.getIdToken()

      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create session')
      }

      router.push(finalRedirect())
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
      if (!validateEmail(email)) {
        setError('Please enter a valid email address')
        return
      }

      if (!validatePassword(password)) {
        setError('Password must be at least 6 characters')
        return
      }

      sessionStorage.setItem('auth_redirect', redirectUrl)

      const result = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await result.user.getIdToken()

      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create session')
      }

      router.push(finalRedirect())
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
      if (!isEmailValid) {
        setError('Please enter a valid email address')
        return
      }

      sessionStorage.setItem('auth_redirect', redirectUrl)

      const actionCodeSettings = {
        url: `${window.location.origin}/auth/email-verify?redirect=${encodeURIComponent(redirectUrl)}`,
        handleCodeInApp: true,
      }

      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      window.localStorage.setItem('emailForSignIn', email)
      setError('')
      alert(`Verification link sent to ${email}. Please check your inbox (and spam folder).`)
    } catch (err) {
      setError(getFirebaseErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const onBackToEnter = () => {
    setStep('enter')
    setError('')
    setCode('')
    setPhone('')
    setEmail('')
    setPassword('')
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Back button & top bar */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white px-4 py-3">
        {step !== 'enter' && (
          <button
            type="button"
            onClick={onBackToEnter}
            className="flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 active:bg-gray-200"
            aria-label="Go back"
          >
            <svg className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-sm space-y-6">
          {step === 'enter' && (
            <EnterStep
              phone={phone}
              isPhoneValid={validatePhoneNumber(phone)}
              error={error}
              recaptchaLoading={recaptchaLoading}
              loading={loading}
              onPhoneChange={(value) => {
                setPhone(normalizePhone(value))
                setError('')
              }}
              onSendOtp={sendOtp}
              onGoEmail={() => {
                setStep('email')
                setError('')
                setPhone('')
              }}
            />
          )}

          {step === 'otp' && (
            <OtpStep
              code={code}
              error={error}
              loading={loading}
              resendTimer={resendTimer}
              resendLoading={resendLoading}
              setCode={setCode}
              onVerify={verifyOtp}
              onResend={resendOtp}
              onBack={onBackToEnter}
              inputRef={otpInputRef}
            />
          )}

          {step === 'email' && (
            <EmailStep
              email={email}
              password={password}
              isEmailValid={validateEmail(email)}
              isPasswordValid={validatePassword(password)}
              isEmailAuthValid={validateEmail(email) && validatePassword(password)}
              error={error}
              loading={loading}
              onEmailChange={(value) => {
                setEmail(value)
                setError('')
              }}
              onPasswordChange={(value) => {
                setPassword(value)
                setError('')
              }}
              onSignup={signupWithEmail}
              onLogin={loginWithEmail}
              onSendEmailOtp={sendEmailOtp}
              onBack={onBackToEnter}
            />
          )}
        </div>
      </main>

      {/* Footer with trust markers */}
      <footer className="border-t border-gray-200 bg-gray-50 px-4 py-4 text-center text-xs text-gray-600">
        <p>🔒 Secure &nbsp;|&nbsp; Your data is encrypted</p>
      </footer>
    </div>
  )
}

// Support email link verification if the user returns to /auth after clicking an email link
if (typeof window !== 'undefined') {
  if (isSignInWithEmailLink(auth, typeof window !== 'undefined' ? window.location.href : '')) {
    const emailForSignIn = window.localStorage.getItem('emailForSignIn')
    if (emailForSignIn) {
      signInWithEmailLink(auth, emailForSignIn, window.location.href)
        .then(async (result) => {
          const idToken = await result.user.getIdToken()
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          })
        })
        .catch(() => { })
    }
  }
}