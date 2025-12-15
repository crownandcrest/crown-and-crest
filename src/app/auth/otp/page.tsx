'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OtpPage() {
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  async function verifyOtp() {
    setLoading(true)

    try {
      const confirmationResult = window.confirmationResult
      if (!confirmationResult) {
        throw new Error('OTP session expired')
      }

      await confirmationResult.confirm(otp)
      router.push('/')
    } catch (err) {
      alert((err as Error).message)
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
          Verify
        </button>
      </div>
    </div>
  )
}
