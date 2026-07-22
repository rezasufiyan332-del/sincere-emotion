'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be under 128 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

interface ResetPasswordFormProps {
  searchParams: Promise<{ token?: string }>
}

export default function ResetPasswordForm({ searchParams }: ResetPasswordFormProps) {
  const router = useRouter()
  const toast = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [tokenValid, setTokenValid] = useState(true)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const password = watch('password')

  useEffect(() => {
    async function checkToken() {
      const params = await searchParams
      const t = params.token
      if (!t) {
        setTokenValid(false)
        return
      }
      setToken(t)
    }
    checkToken()
  }, [searchParams])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password, confirmPassword: data.confirmPassword }),
      })

      const result = await res.json()

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to reset password')
      }

      toast('Password Reset', 'Your password has been updated successfully', 'success')
      router.push('/auth/login?reset=true')
      router.refresh()
    } catch (err) {
      toast('Error', err instanceof Error ? err.message : 'Failed to reset password', 'destructive')
    } finally {
      setLoading(false)
    }
  }

  if (!tokenValid || !token) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="text-center space-y-1">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-rose-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Invalid or Expired Link</CardTitle>
          <p className="text-muted-foreground">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={() => router.push('/auth/forgot-password')}>
            Request New Reset Link
          </Button>
          <Button className="w-full" variant="secondary" onClick={() => router.push('/auth/login')}>
            Back to Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
        <p className="text-muted-foreground">Your new password must be different from previous ones</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              New Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={loading}
                {...register('password')}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : 'password-hint'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p id="password-hint" className="text-xs text-muted-foreground">
              At least 8 characters, 1 uppercase letter, 1 number
            </p>
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              disabled={loading}
              {...register('confirmPassword')}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
            />
            {errors.confirmPassword && (
              <p id="confirm-error" className="text-sm text-destructive" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full py-2.5"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Password...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Back to Login
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}