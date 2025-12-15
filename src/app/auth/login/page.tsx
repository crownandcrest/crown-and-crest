'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase/client'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendOtp() {
    setLoading(true)

    if (!(window as any).recaptchaVerifier) {
      ;(window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        { size: 'invisible' }
      )
    }

    const appVerifier = (window as any).recaptchaVerifier

    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        `+91${phone}`,
        appVerifier
      )

      ;(window as any).confirmationResult = confirmationResult
      router.push('/auth/otp')
    } catch (err: any) {
      alert(err.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md border p-6 rounded">
        <h1 className="text-xl font-semibold mb-4">Login or Sign Up</h1>

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
