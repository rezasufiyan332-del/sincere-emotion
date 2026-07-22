import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { verifyTOTPToken } from '@/lib/totp'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { token } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Token is required' } }, { status: 400 })
    }

    // Get user with 2FA secret
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, { status: 404 })
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json({ success: false, error: { code: 'ALREADY_ENABLED', message: '2FA is already enabled' } }, { status: 400 })
    }

    if (!user.twoFactorSecret) {
      return NextResponse.json({ success: false, error: { code: 'NO_SETUP', message: 'Please setup 2FA first' } }, { status: 400 })
    }

    // Verify the token
    const isValid = verifyTOTPToken(token, user.twoFactorSecret)

    if (!isValid) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid 2FA code' } }, { status: 400 })
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        twoFactorEnabled: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: { message: '2FA enabled successfully' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to enable 2FA'
    return NextResponse.json({ success: false, error: { code: 'TWO_FA_ERROR', message } }, { status: 500 })
  }
}