import { NextRequest, NextResponse } from 'next/server'
import { login, rotateSession } from '@/lib/auth'
import { validateBody } from '@/lib/api-utils'
import { loginSchema } from '@/lib/schemas'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { getOrCreateRequestId, withRequestContext } from '@/lib/request-id'
import { AppError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  const requestId = getOrCreateRequestId()
  const ip = getClientIp(request)

  try {
    // Rate limit check
    const rateLimitResult = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000)

    if (!rateLimitResult.allowed) {
      console.warn(
        withRequestContext(requestId, 'Login rate limit exceeded', {
          ip,
          retryAfterMs: rateLimitResult.retryAfterMs,
        })
      )
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMITED', message: 'Too many login attempts. Please try again in a few minutes.' } },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const data = validateBody(body, loginSchema)

    // Perform login
    const loginResult = await login(data)

    // Rotate session to invalidate previous ones
    const token = await rotateSession(loginResult.user.id)

    console.info(
      withRequestContext(requestId, 'User login successful', {
        userId: loginResult.user.id,
        email: loginResult.user.email,
      })
    )

    const response = NextResponse.json(
      {
        success: true,
        data: { user: loginResult.user, token },
      },
      { status: 200 }
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
    const errorMessage = error instanceof Error ? error.message : 'Login failed'
    const statusCode = error instanceof AppError ? error.statusCode : 401

    console.error(
      withRequestContext(requestId, 'Login error', {
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
