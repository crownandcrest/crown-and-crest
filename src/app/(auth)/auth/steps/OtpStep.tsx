import React, { useEffect } from 'react'

type Props = {
  code: string
  error: string
  loading: boolean
  resendTimer: number
  resendLoading: boolean
  setCode: (value: string) => void
  onVerify: () => void
  onResend: () => void
  onBack: () => void
  inputRef?: React.RefObject<HTMLInputElement>
}

export default function OtpStep({
  code,
  error,
  loading,
  resendTimer,
  resendLoading,
  setCode,
  onVerify,
  onResend,
  onBack,
  inputRef,
}: Props) {
  const canResend = resendTimer === 0 && !resendLoading

  useEffect(() => {
    if (inputRef?.current && !inputRef.current.value) {
      inputRef.current.focus()
    }
  }, [inputRef])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Enter OTP
        </h1>
        <p className="text-gray-600 text-sm">
          We sent a code to your phone
        </p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <label htmlFor="otp" className="block text-sm font-semibold text-gray-900">
            One-Time Code
          </label>
          <input
            ref={inputRef}
            id="otp"
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => {
              const normalized = e.target.value.replace(/\D/g, '').slice(0, 6)
              setCode(normalized)
            }}
            placeholder="000000"
            maxLength={6}
            disabled={loading}
            className="w-full h-14 rounded-xl border border-gray-300 bg-white px-4 text-center text-2xl font-semibold tracking-widest text-gray-900 placeholder-gray-400 transition-all focus:border-accent focus:ring-1 focus:ring-accent/20 disabled:bg-gray-50"
          />
          {code && code.length !== 6 && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <span>⚠</span> Enter 6 digits
            </p>
          )}
          {code && code.length === 6 && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span>✓</span> Valid code
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 animate-fade-in">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={onVerify}
          disabled={loading || code.length !== 6}
          className="w-full h-12 rounded-xl bg-gray-900 text-white font-semibold text-sm transition-all duration-200 hover:bg-accent active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="inline-flex h-4 w-4 animate-spinner rounded-full border-2 border-white border-t-transparent" />
              <span>Verifying…</span>
            </>
          ) : (
            'Verify Code'
          )}
        </button>

        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-center">
          {resendTimer > 0 ? (
            <p className="text-sm text-gray-600">
              Resend available in <span className="font-semibold text-accent">{resendTimer}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={onResend}
              disabled={!canResend}
              className="w-full px-4 py-2 rounded-lg border border-gray-900 text-gray-900 font-semibold text-sm transition-all hover:bg-gray-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? 'Resending…' : 'Resend Code'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
