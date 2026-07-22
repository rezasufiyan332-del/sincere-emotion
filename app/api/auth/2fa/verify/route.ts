import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTOTPToken } from '@/lib/totp'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, userId } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Token is required' } }, { status: 400 })
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'User ID is required' } }, { status: 400 })
    }

    // Get user 2FA data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, { status: 404 })
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ success: false, error: { code: 'NOT_ENABLED', message: '2FA is not enabled' } }, { status: 400 })
    }

    // Verify the token
    const isValid = verifyTOTPToken(token, user.twoFactorSecret)

    if (!isValid) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid 2FA code' } }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: { 
        verified: true,
        message: '2FA verification successful',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to verify 2FA'
    return NextResponse.json({ success: false, error: { code: 'TWO_FA_ERROR', message } }, { status: 500 })
  }
}