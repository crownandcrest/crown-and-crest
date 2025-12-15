'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function OtpPage() {
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  async function verifyOtp() {
    setLoading(true)

    try {
      const confirmationResult = (window as any).confirmationResult
      const result = await confirmationResult.confirm(otp)

      const user = result.user
      console.log('Firebase UID:', user.uid)

      const idToken = await user.getIdToken()

      await fetch('/api/session/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      router.push('/cart')
    } catch (err: any) {
      alert('Invalid OTP')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md border p-6 rounded">
        <h1 className="text-xl font-semibold mb-4">Verify OTP</h1>

        <input
          className="w-full border p-2 rounded mb-4"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button
          onClick={verifyOtp}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded"
        >
          Verify & Continue
        </button>
      </div>
    </div>
  )
}
