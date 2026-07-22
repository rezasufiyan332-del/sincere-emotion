import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateBody } from '@/lib/api-utils'
import { z } from 'zod'
import { apiSuccess, withErrorHandling, AppError } from '@/lib/errors'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { hashPassword } from '@/lib/auth'
import crypto from 'crypto'

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be under 128 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(`reset-password:${ip}`, 5, 60 * 60 * 1000) // 5 per hour

    if (!rateLimitResult.allowed) {
      throw new AppError('Too many requests. Please try again later.', 429, 'RATE_LIMITED')
    }

    const body = await request.json()
    const data = validateBody(body, resetPasswordSchema)

    // Hash token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(data.token).digest('hex')

    const user = await prisma.user.findFirst({
      where: {
        resetToken: tokenHash,
        resetTokenExpiry: { gt: new Date() },
      },
    })

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN')
    }

    const passwordHash = await hashPassword(data.password)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return apiSuccess({ message: 'Password has been reset successfully' })
  })
}