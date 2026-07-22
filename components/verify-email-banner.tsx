'use client'

import { useState, useEffect } from 'react'

interface VerifyEmailBannerProps {
  emailVerified: Date | null
  email: string
}

export default function VerifyEmailBanner({ emailVerified, email }: VerifyEmailBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem('verify-email-banner-dismissed')
    if (dismissed) {
      setIsDismissed(true)
    }
  }, [])

  // Don't show if email is verified or if user has dismissed
  if (emailVerified || isDismissed) {
    return null
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setResendSuccess(true)
      }
    } catch {
      // Silently fail - we don't want to show errors for resend
    } finally {
      setIsResending(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('verify-email-banner-dismissed', 'true')
  }

  return (
    <div style={{
      backgroundColor: '#fef3c7',
      borderBottom: '1px solid #f59e0b',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      flexWrap: 'wrap',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span style={{
          color: '#92400e',
          fontSize: '14px',
          fontWeight: '500',
        }}>
          Please verify your email address. Check your inbox or{' '}
          {resendSuccess ? (
            <span style={{ color: '#166534', fontWeight: '600' }}>
              verification email sent!
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              style={{
                background: 'none',
                border: 'none',
                color: '#92400e',
                fontWeight: '600',
                textDecoration: 'underline',
                cursor: isResending ? 'not-allowed' : 'pointer',
                padding: 0,
                fontSize: '14px',
              }}
            >
              {isResending ? 'Sending...' : 'click here to resend'}
            </button>
          )}
        </span>
      </div>
      <button
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: '#92400e',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '8px',
        }}
        aria-label="Dismiss banner"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}