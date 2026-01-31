'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

/**
 * Account Client Component
 * 
 * - Handles all client-side account interactions
 * - Logout functionality
 * - User account UI (order history, profile, addresses, etc.)
 * - Split from server component to allow logout interaction
 */

export default function AccountClient() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState('')

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      setError('')

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to logout')
      }

      // Redirect to login page after successful logout
      router.push('/auth/login')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to logout'
      setError(message)
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">My Account</h1>
        <p className="text-gray-600">Manage your profile, orders, and preferences</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Order History */}
        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/account/orders')}>
          <div className="text-2xl font-bold text-blue-600 mb-2">📦</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Order History</h2>
          <p className="text-gray-600 text-sm">View your past orders and tracking information</p>
        </div>

        {/* Profile */}
        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/account/profile')}>
          <div className="text-2xl font-bold text-blue-600 mb-2">👤</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Profile</h2>
          <p className="text-gray-600 text-sm">Edit your personal information and preferences</p>
        </div>

        {/* Addresses */}
        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/account/addresses')}>
          <div className="text-2xl font-bold text-blue-600 mb-2">📍</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Addresses</h2>
          <p className="text-gray-600 text-sm">Manage your saved delivery addresses</p>
        </div>

        {/* Size Profile */}
        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/account/size-profile')}>
          <div className="text-2xl font-bold text-blue-600 mb-2">📏</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Size Profile</h2>
          <p className="text-gray-600 text-sm">Manage your body measurements for better size suggestions</p>
        </div>
      </div>

      {/* Logout Button */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
        >
          {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  )
}
