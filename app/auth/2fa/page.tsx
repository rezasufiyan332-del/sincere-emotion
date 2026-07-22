'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Shield, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function TwoFactorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get('userId')
    if (id) {
      setUserId(id)
    }
  }, [searchParams])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId) {
      toast('Error', 'Missing user information', 'destructive')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, userId }),
      })

      const result = await res.json()

      if (!result.success) {
        throw new Error(result.error?.message || 'Verification failed')
      }

      setVerified(true)
      toast('Verified!', 'Two-factor authentication successful', 'success')
      
      // Redirect to dashboard after successful verification
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err) {
      toast('Verification Failed', err instanceof Error ? err.message : 'Invalid code', 'destructive')
    } finally {
      setLoading(false)
    }
  }

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold">Verification Successful</h2>
              <p className="text-muted-foreground">
                Redirecting you to your dashboard...
              </p>
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
          <p className="text-muted-foreground">
            Enter the 6-digit code from your authenticator app
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="token" className="text-sm font-medium">
                Verification Code
              </label>
              <Input
                id="token"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
                disabled={loading}
                aria-invalid={token.length > 0 && token.length !== 6}
              />
              {token.length > 0 && token.length !== 6 && (
                <p className="text-sm text-destructive" role="alert">
                  Code must be 6 digits
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || token.length !== 6}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Lost access to your authenticator?
            </p>
            <button
              type="button"
              className="text-sm text-primary hover:underline mt-1"
              onClick={() => {
                // TODO: Implement backup code flow
                toast('Coming Soon', 'Backup code verification will be available soon', 'default')
              }}
            >
              Use a backup code
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}