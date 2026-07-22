'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setErrorMessage('No verification token provided')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (data.success) {
          setStatus('success')
        } else {
          setStatus('error')
          setErrorMessage(data.error?.message || 'Invalid or expired verification link')
        }
      } catch {
        setStatus('error')
        setErrorMessage('An unexpected error occurred')
      }
    }

    verifyEmail()
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafafa',
        padding: '20px',
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '400px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f59e0b',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            margin: '0 auto 24px',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ color: '#64748b', fontSize: '16px' }}>Verifying your email...</p>
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafafa',
        padding: '20px',
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '480px',
          background: 'white',
          padding: '48px',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#fef3c7',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1a1a2e',
            marginBottom: '12px',
          }}>Email Verified!</h1>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            lineHeight: '1.6',
            marginBottom: '32px',
          }}>
            Your email address has been verified. You can now access all features of Sincere Emotion.
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              backgroundColor: '#f59e0b',
              color: '#000',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
            }}
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fafafa',
      padding: '20px',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '480px',
        background: 'white',
        padding: '48px',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#fef2f2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
        </div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1a1a2e',
          marginBottom: '12px',
        }}>Verification Failed</h1>
        <p style={{
          fontSize: '16px',
          color: '#64748b',
          lineHeight: '1.6',
          marginBottom: '32px',
        }}>
          {errorMessage}
        </p>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center',
        }}>
          <Link
            href="/login"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              backgroundColor: '#f59e0b',
              color: '#000',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
            }}
          >
            Go to Login
          </Link>
          <Link
            href="/auth/resend-verification"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              backgroundColor: 'transparent',
              color: '#f59e0b',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
              border: '2px solid #f59e0b',
            }}
          >
            Resend Verification Email
          </Link>
        </div>
      </div>
    </div>
  )
}