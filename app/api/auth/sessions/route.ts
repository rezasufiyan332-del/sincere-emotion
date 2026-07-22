import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const currentSession = await requireAuth()
    
    const sessions = await prisma.session.findMany({
      where: { userId: currentSession.userId },
      select: {
        id: true,
        sessionToken: true,
        expires: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Format sessions for response (truncate token for security)
    const formattedSessions = sessions.map((session: typeof sessions[0]) => ({
      id: session.id,
      tokenPreview: `${session.sessionToken.slice(0, 8)}...${session.sessionToken.slice(-4)}`,
      isCurrentSession: session.sessionToken === currentSession.sessionToken,
      expires: session.expires,
      createdAt: session.createdAt,
      lastActive: session.createdAt, // You could add a lastActive field to Session model
    }))

    return NextResponse.json({
      success: true,
      data: formattedSessions,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch sessions'
    return NextResponse.json(
      { success: false, error: { code: 'SESSIONS_ERROR', message } },
      { status: 401 }
    )
  }
}
