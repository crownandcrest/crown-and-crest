'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase/client'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth'

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier
    confirmationResult?: ConfirmationResult
  }
}

export default function LoginClient() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

 async function sendOtp() {
  setLoading(true)

  try {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => {},
        }
      )
    }

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      `+91${phone}`,
      window.recaptchaVerifier
    )

    window.confirmationResult = confirmationResult
    router.push('/auth/otp')
  } catch (err) {
    alert((err as Error).message)
  }

  setLoading(false)
}

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md border p-6 rounded">
        <h1 className="text-xl font-semibold mb-4">
          Login or Sign Up
        </h1>

        <input
          className="w-full border p-2 rounded mb-4"
          placeholder="Enter mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button
          onClick={sendOtp}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded"
        >
          Send OTP
        </button>

        <div id="recaptcha-container"></div>
      </div>
    </div>
  )
}
