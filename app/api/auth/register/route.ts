import { NextRequest, NextResponse } from 'next/server'
import { register, rotateSession } from '@/lib/auth'
import { validateBody } from '@/lib/api-utils'
import { registerSchema } from '@/lib/schemas'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { getOrCreateRequestId, withRequestContext } from '@/lib/request-id'
import { AppError } from '@/lib/errors'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const requestId = getOrCreateRequestId()
  const ip = getClientIp(request)

  try {
    // Rate limit check
    const rateLimitResult = checkRateLimit(`register:${ip}`, 3, 60 * 60 * 1000)

    if (!rateLimitResult.allowed) {
      console.warn(
        withRequestContext(requestId, 'Registration rate limit exceeded', { ip })
      )
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many registration attempts. Please try again later.',
          },
        },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const data = validateBody(body, registerSchema)

    // Register user (data includes confirmPassword which is validated)
    const registerResult = await register(data)

    // Send welcome email (non-blocking)
    sendWelcomeEmail(data.email, data.name || 'User').catch((err) =>
      console.error(
        withRequestContext(requestId, 'Welcome email failed', { error: String(err) })
      )
    )

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const hashedVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex')
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Store verification token (hashed for security)
    await prisma.user.update({
      where: { id: registerResult.user.id },
      data: {
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
    })

    // Build verification URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      throw new AppError(
        'Server misconfigured: missing NEXT_PUBLIC_BASE_URL',
        500,
        'CONFIG_ERROR'
      )
    }

    const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`

    // Send verification email (non-blocking)
    sendVerificationEmail(data.email, data.name || 'User', verificationUrl).catch((err) =>
      console.error(
        withRequestContext(requestId, 'Verification email failed', { error: String(err) })
      )
    )

    // Create session token
    const token = await rotateSession(registerResult.user.id)

    console.info(
      withRequestContext(requestId, 'User registered successfully', {
        userId: registerResult.user.id,
        email: registerResult.user.email,
      })
    )

    const response = NextResponse.json(
      {
        success: true,
        data: { user: registerResult.user, token },
      },
      { status: 201 }
    )

    // Set secure session cookie
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    response.cookies.set('session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires,
      path: '/',
    })

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Registration failed'
    const statusCode = error instanceof AppError ? error.statusCode : 400

    console.error(
      withRequestContext(requestId, 'Registration error', {
        ip,
        error: errorMessage,
        statusCode,
      })
    )

    return NextResponse.json(
      {
        success: false,
        error: {
          code: error instanceof AppError ? error.code : 'AUTH_ERROR',
          message: errorMessage,
        },
      },
      { status: statusCode }
    )
  }
}
