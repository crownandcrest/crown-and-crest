import React from 'react'

type Props = {
  phone: string
  isPhoneValid: boolean
  error: string
  recaptchaLoading: boolean
  loading: boolean
  onPhoneChange: (value: string) => void
  onSendOtp: () => void
  onGoEmail: () => void
}

export default function EnterStep({
  phone,
  isPhoneValid,
  error,
  recaptchaLoading,
  loading,
  onPhoneChange,
  onSendOtp,
  onGoEmail,
}: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600 text-sm">
          Choose how you'd like to sign in
        </p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-900">
            Mobile Number
          </label>
          <div className="relative">
            <div className="flex rounded-xl border border-gray-300 overflow-hidden transition-all focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/20">
              <span className="inline-flex items-center px-4 text-sm font-medium text-gray-600 bg-gray-50 border-r border-gray-300">
                +91
              </span>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                placeholder="Enter 10-digit number"
                maxLength={10}
                disabled={loading || recaptchaLoading}
                className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-400 bg-white border-0 focus:ring-0 disabled:bg-gray-50"
              />
            </div>
            {phone && !isPhoneValid && (
              <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                <span>⚠</span> Must be 10 digits
              </p>
            )}
            {phone && isPhoneValid && (
              <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                <span>✓</span> Valid number
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 animate-fade-in">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {recaptchaLoading && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 flex items-center gap-2 animate-fade-in">
            <div className="inline-flex h-4 w-4 animate-spinner rounded-full border-2 border-blue-600 border-t-transparent" />
            <span className="text-sm text-blue-700">Securing login…</span>
          </div>
        )}

        <button
          type="button"
          onClick={onSendOtp}
          disabled={loading || !isPhoneValid || recaptchaLoading}
          className="w-full h-12 rounded-xl bg-gray-900 text-white font-semibold text-sm transition-all duration-200 hover:bg-accent active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="inline-flex h-4 w-4 animate-spinner rounded-full border-2 border-white border-t-transparent" />
              <span>Sending…</span>
            </>
          ) : (
            'Continue with Phone'
          )}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-600">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoEmail}
          disabled={loading}
          className="w-full h-12 rounded-xl border-2 border-gray-900 text-gray-900 font-semibold text-sm transition-all duration-200 hover:bg-gray-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue with Email
        </button>
      </form>

      <div className="text-center space-y-3">
        <p className="text-xs text-gray-600">
          By continuing, you agree to our{' '}
          <a href="#" className="text-accent font-semibold hover:underline">
            Terms
          </a>
          {' '}and{' '}
          <a href="#" className="text-accent font-semibold hover:underline">
            Privacy Policy
          </a>
        </p>
        <p className="text-xs text-gray-500">
          © 2024 Crown And Crest
        </p>
      </div>
    </div>
  )
}
