import React, { useState } from 'react'

type Props = {
  email: string
  password: string
  isEmailValid: boolean
  isPasswordValid: boolean
  isEmailAuthValid: boolean
  error: string
  loading: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSignup: () => Promise<void> | void
  onLogin: () => Promise<void> | void
  onSendEmailOtp: () => Promise<void> | void
  onBack: () => void
}

export default function EmailStep({
  email,
  password,
  isEmailValid,
  isPasswordValid,
  isEmailAuthValid,
  error,
  loading,
  onEmailChange,
  onPasswordChange,
  onSignup,
  onLogin,
  onSendEmailOtp,
  onBack,
}: Props) {
  const [mode, setMode] = useState<'password' | 'magic'>('password')

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Email Login
        </h1>
        <p className="text-gray-600 text-sm">
          Password or verification link
        </p>
      </div>

      <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setMode('password')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            mode === 'password'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode('magic')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            mode === 'magic'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Link
        </button>
      </div>

      {mode === 'magic' && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            onSendEmailOtp()
          }}
        >
          <div className="space-y-2">
            <label htmlFor="email-magic" className="block text-sm font-semibold text-gray-900">
              Email
            </label>
            <input
              id="email-magic"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="name@example.com"
              disabled={loading}
              autoComplete="email"
              className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder-gray-400 transition-all focus:border-accent focus:ring-1 focus:ring-accent/20 disabled:bg-gray-50"
            />
            {email && !isEmailValid && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <span>⚠</span> Invalid email
              </p>
            )}
            {email && isEmailValid && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span>✓</span> Valid email
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 animate-fade-in">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isEmailValid}
            className="w-full h-12 rounded-xl bg-gray-900 text-white font-semibold text-sm transition-all duration-200 hover:bg-accent active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="inline-flex h-4 w-4 animate-spinner rounded-full border-2 border-white border-t-transparent" />
                <span>Sending…</span>
              </>
            ) : (
              'Send Link'
            )}
          </button>

          <p className="text-xs text-gray-600 text-center">
            We'll email you a link to sign in instantly
          </p>
        </form>
      )}

      {mode === 'password' && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            onSignup()
          }}
        >
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="name@example.com"
              disabled={loading}
              autoComplete="email"
              className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder-gray-400 transition-all focus:border-accent focus:ring-1 focus:ring-accent/20 disabled:bg-gray-50"
            />
            {email && !isEmailValid && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <span>⚠</span> Invalid email
              </p>
            )}
            {email && isEmailValid && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span>✓</span> Valid email
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-900">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
              className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder-gray-400 transition-all focus:border-accent focus:ring-1 focus:ring-accent/20 disabled:bg-gray-50"
            />
            {password && !isPasswordValid && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <span>⚠</span> At least 6 characters
              </p>
            )}
            {password && isPasswordValid && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span>✓</span> Strong enough
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 animate-fade-in">
              <p className="text-sm text-red-700 font-medium">{error}</p>
              {error.includes('Email already registered') && (
                <button
                  type="button"
                  onClick={onLogin}
                  className="mt-2 text-xs font-medium text-red-700 hover:underline"
                >
                  Try logging in instead
                </button>
              )}
            </div>
          )}

          <div className="space-y-2">
            <button
              type="submit"
              disabled={loading || !isEmailAuthValid}
              className="w-full h-12 rounded-xl bg-gray-900 text-white font-semibold text-sm transition-all duration-200 hover:bg-accent active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="inline-flex h-4 w-4 animate-spinner rounded-full border-2 border-white border-t-transparent" />
                  <span>Creating…</span>
                </>
              ) : (
                'Sign Up'
              )}
            </button>

            <button
              type="button"
              onClick={onLogin}
              disabled={loading || !isEmailAuthValid}
              className="w-full h-12 rounded-xl border-2 border-gray-900 text-gray-900 font-semibold text-sm transition-all duration-200 hover:bg-gray-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing…' : 'Sign In'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
