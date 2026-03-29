'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState<'sms' | 'email' | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [method, setMethod] = useState<'sms' | 'email' | null>(null)
  const [userEmail, setUserEmail] = useState('')

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) return digits.length ? `(${digits}` : ''
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
  }

  const getRawPhone = () => {
    const digits = phone.replace(/\D/g, '')
    return `+1${digits}`
  }

  const handleSendSMS = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }
    setLoading('sms')
    setError('')
    setMessage('')

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithOtp({
        phone: getRawPhone(),
      })
      if (authError) throw authError
      setCodeSent(true)
      setMethod('sms')
      setMessage('Code sent via SMS!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send SMS code'
      setError(msg)
    } finally {
      setLoading(null)
    }
  }

  const handleSendEmail = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }
    setLoading('email')
    setError('')
    setMessage('')

    try {
      // Look up email by phone number via API
      const res = await fetch('/api/auth/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: getRawPhone() }),
      })

      // Handle non-JSON responses gracefully
      let data
      try {
        data = await res.json()
      } catch {
        throw new Error('Server error. Please try again in a moment.')
      }

      if (!res.ok || !data.email) {
        throw new Error(data?.error || 'Phone number not found. Only authorized TC staff can log in.')
      }

      // Store email for verification step
      setUserEmail(data.email)

      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: data.email,
      })
      if (authError) throw authError
      setCodeSent(true)
      setMethod('email')
      setMessage(`Code sent to ${data.email}!`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send email code'
      setError(msg)
    } finally {
      setLoading(null)
    }
  }

  const handleVerifyCode = async () => {
    if (!otpCode || otpCode.length < 6) {
      setError('Please enter the 6-digit code')
      return
    }
    setLoading(method)
    setError('')

    try {
      const supabase = createClient()

      if (method === 'sms') {
        const { error: authError } = await supabase.auth.verifyOtp({
          phone: getRawPhone(),
          token: otpCode,
          type: 'sms',
        })
        if (authError) throw authError
      } else {
        const { error: authError } = await supabase.auth.verifyOtp({
          email: userEmail,
          token: otpCode,
          type: 'email',
        })
        if (authError) throw authError
      }

      window.location.href = '/dashboard'
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid code. Please try again.'
      setError(msg)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-start gap-3 mb-6">
            <div className="text-purple-600 mt-1">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Sign in</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {codeSent ? 'Enter the code we sent you' : 'Enter your number to receive a code'}
              </p>
            </div>
          </div>

          {!codeSent ? (
            <>
              {/* Phone Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(555) 000-0000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  maxLength={14}
                />
              </div>

              {/* SMS Button */}
              <button
                onClick={handleSendSMS}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                {loading === 'sms' ? 'Sending...' : 'Send code via SMS'}
              </button>

              {/* Email Button */}
              <button
                onClick={handleSendEmail}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-500 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                {loading === 'email' ? 'Sending...' : 'Send code to my email'}
              </button>
            </>
          ) : (
            <>
              {/* OTP Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Verification code
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 text-center text-2xl tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  maxLength={6}
                  autoFocus
                />
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerifyCode}
                disabled={loading !== null}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                {loading ? 'Verifying...' : 'Verify code'}
              </button>

              {/* Back Button */}
              <button
                onClick={() => { setCodeSent(false); setOtpCode(''); setMessage(''); setError(''); setUserEmail('') }}
                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-500 font-medium rounded-xl transition-colors"
              >
                Try a different number
              </button>
            </>
          )}

          {/* Messages */}
          {error && (
            <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
          )}
          {message && (
            <p className="mt-4 text-sm text-green-600 text-center">{message}</p>
          )}

          {/* Footer */}
          <p className="mt-6 text-xs text-gray-400 text-center">
            Only authorized TC staff can log in
          </p>
        </div>
      </div>
    </div>
  )
}
