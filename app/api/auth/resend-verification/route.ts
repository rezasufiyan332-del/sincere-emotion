import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_INPUT', message: 'Email is required' } }, { status: 400 })
    }

    // Rate limiting: 3 requests per hour
    const rateLimitKey = `resend-verification:${email}`
    if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
      return NextResponse.json({ success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } }, { status: 429 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // For security, always return success message
    const successMessage = { success: true, data: { message: 'If an account with this email exists, a verification link has been sent.' } }

    if (!user) {
      // Don't reveal whether user exists
      return NextResponse.json(successMessage)
    }

    // If already verified, no need to resend
    if (user.emailVerified) {
      return NextResponse.json(successMessage)
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex')
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user with new verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
    })

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`
    await sendVerificationEmail(user.email, user.name ?? '', verificationUrl)

    return NextResponse.json(successMessage)
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ success: false, error: { code: 'RESEND_FAILED', message: 'Failed to resend verification email' } }, { status: 500 })
  }
}