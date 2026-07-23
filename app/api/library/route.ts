import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, withErrorHandling } from '@/lib/errors'
import { getOrCreateRequestId, withRequestContext } from '@/lib/request-id'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestId = getOrCreateRequestId()

  return withErrorHandling(async () => {
    // Get session from cookie or Authorization header
    let sessionToken = null

    // Try cookie first
    const cookieStore = await cookies()
    sessionToken = cookieStore.get('session-token')?.value

    // Try Authorization header if no cookie
    if (!sessionToken) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7)
      }
    }

    if (!sessionToken) {
      return apiSuccess({ data: [], message: 'No session found' })
    }

    // Validate session
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    })

    if (!session || session.expires < new Date()) {
      return apiSuccess({ data: [], message: 'Invalid session' })
    }

    // Get user's library
    const library = await prisma.userLibrary.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            price: true,
            format: true,
          },
        },
      },
      orderBy: { acquiredAt: 'desc' },
    })

    console.info(withRequestContext(requestId, 'Library fetched', {
      userId: session.user.id,
      count: library.length,
    }))

    return apiSuccess({
      data: library.map((item) => ({
        id: item.id,
        title: item.product.title,
        slug: item.product.slug,
        coverImage: item.product.coverImage,
        price: item.product.price,
        format: item.product.format,
        acquiredAt: item.acquiredAt.toISOString(),
        source: item.source,
      })),
    })
  })
}