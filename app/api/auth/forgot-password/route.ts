import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateBody } from '@/lib/api-utils'
import { z } from 'zod'
import { apiSuccess, withErrorHandling, AppError } from '@/lib/errors'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import crypto from 'crypto'
import { sendResetPasswordEmail } from '@/lib/email'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(`forgot-password:${ip}`, 3, 60 * 60 * 1000) // 3 per hour

    if (!rateLimitResult.allowed) {
      throw new AppError('Too many requests. Please try again later.', 429, 'RATE_LIMITED')
    }

    const body = await request.json()
    const data = validateBody(body, forgotPasswordSchema)

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return apiSuccess({ message: 'If the email exists, a reset link has been sent' })
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // SECURITY FIX: Hash token before storing (prevents DB leak = account takeover)
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry,
      },
    })

    // Send email with plaintext token (only time it's exposed)
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${resetToken}`
    await sendResetPasswordEmail(user.email, user.name ?? '', resetUrl)

    // SECURITY FIX: Never log tokens or user emails
    // Token logging enables account takeover via log file access
    console.log('Password reset email sent')

    return apiSuccess({ message: 'If the email exists, a reset link has been sent' })
  })
}