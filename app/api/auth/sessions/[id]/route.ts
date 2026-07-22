import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentSession = await requireAuth()
    const { id } = await params

    // Find the session to delete
    const sessionToDelete = await prisma.session.findUnique({
      where: { id },
    })

    if (!sessionToDelete) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      )
    }

    // Prevent deleting current session (require re-auth for security)
    if (sessionToDelete.sessionToken === currentSession.sessionToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'CANNOT_DELETE_CURRENT', 
            message: 'Cannot delete current session. Please log out instead.' 
          } 
        },
        { status: 400 }
      )
    }

    // Verify the session belongs to the same user
    if (sessionToDelete.userId !== currentSession.userId) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      )
    }

    // Delete the session
    await prisma.session.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete session'
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_ERROR', message } },
      { status: 500 }
    )
  }
}
