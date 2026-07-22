import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token is required' } }, { status: 400 })
    }

    // Hash the received token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with matching hashed token that hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired verification link' } }, { status: 400 })
    }

    // Set emailVerified and clear verification token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    })

    return NextResponse.json({ success: true, data: { message: 'Email verified successfully' } })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ success: false, error: { code: 'VERIFICATION_FAILED', message: 'Failed to verify email' } }, { status: 500 })
  }
}
