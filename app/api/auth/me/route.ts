import { getCurrentUser } from '@/lib/auth'
import { apiSuccess, withErrorHandling, UnauthorizedError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

async function getUserByToken(token: string) {
  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    })
    if (!session || session.expires < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
      }
      return null
    }
    return session.user
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    let user = await getCurrentUser()
    if (!user) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        user = await getUserByToken(token)
      }
    }
    if (!user) {
      throw new UnauthorizedError('Not logged in')
    }
    return apiSuccess(user)
  })
}