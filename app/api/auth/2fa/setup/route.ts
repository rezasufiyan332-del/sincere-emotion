import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateTOTPSecret, generateTOTPQRCodeURL, generateBackupCodes } from '@/lib/totp'
import crypto from 'crypto'

export async function GET() {
  try {
    const session = await requireAuth()
    
    // Check if 2FA is already enabled
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { twoFactorEnabled: true, twoFactorSecret: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA is already enabled' }, { status: 400 })
    }

    // Generate new TOTP secret
    const secret = generateTOTPSecret()
    const qrCodeUrl = generateTOTPQRCodeURL(session.user.email, secret)
    
    // Generate backup codes (plain text - will be hashed when 2FA is enabled)
    const backupCodes = generateBackupCodes(8)
    
    // Store secret temporarily (will be confirmed when 2FA is enabled)
    // Store as a pending 2FA setup
    await prisma.user.update({
      where: { id: session.userId },
      data: { twoFactorSecret: secret },
    })

    return NextResponse.json({
      success: true,
      data: {
        secret,
        qrCodeUrl,
        backupCodes,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to setup 2FA'
    return NextResponse.json({ success: false, error: { code: 'TWO_FA_ERROR', message } }, { status: 500 })
  }
}