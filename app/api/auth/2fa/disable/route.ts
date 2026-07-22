import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, verifyPassword } from '@/lib/auth'
import { verifyTOTPToken } from '@/lib/totp'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { password, token } = body

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Password is required' } }, { status: 400 })
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { 
        twoFactorSecret: true, 
        twoFactorEnabled: true,
        passwordHash: true,
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, { status: 404 })
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json({ success: false, error: { code: 'NOT_ENABLED', message: '2FA is not enabled' } }, { status: 400 })
    }

    // Verify password (OAuth users without password cannot disable 2FA this way)
    if (!user.passwordHash) {
      return NextResponse.json({ success: false, error: { code: 'NO_PASSWORD', message: 'OAuth users cannot disable 2FA with password' } }, { status: 400 })
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.passwordHash)
    if (!passwordValid) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Invalid password' } }, { status: 400 })
    }

    // Disable 2FA - clear secret and enabled status
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    })

    return NextResponse.json({
      success: true,
      data: { message: '2FA disabled successfully' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to disable 2FA'
    return NextResponse.json({ success: false, error: { code: 'TWO_FA_ERROR', message } }, { status: 500 })
  }
}