import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, AppError, withErrorHandling } from '@/lib/errors'
import { checkRateLimit } from '@/lib/rate-limit'
import { getOrCreateRequestId, withRequestContext } from '@/lib/request-id'

export async function POST(request: NextRequest) {
  const requestId = getOrCreateRequestId()

  return withErrorHandling(async () => {
    // Rate limit
    const rateLimitResult = checkRateLimit(`free-book:${request.headers.get('x-forwarded-for') || 'unknown'}`, 5, 60 * 60 * 1000)
    if (!rateLimitResult.allowed) {
      return apiError(new AppError('Too many requests. Try again later.', 429, 'RATE_LIMITED'))
    }

    const body = await request.json()
    const { productId } = body

    if (!productId) {
      throw new AppError('Product ID required', 400, 'VALIDATION_ERROR')
    }

    // Get product and verify it's free
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw new AppError('Product not found', 404, 'NOT_FOUND')
    }

    if (!product.isFree) {
      throw new AppError('This product is not free', 400, 'NOT_FREE')
    }

    if (!product.isActive) {
      throw new AppError('Product unavailable', 404, 'UNAVAILABLE')
    }

    // Get user from session (cookie or Authorization header)
    let user = null

    // Try cookie first
    const cookieStore = await (await import('next/headers')).cookies()
    const sessionToken = cookieStore.get('session-token')?.value

    if (sessionToken) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      })
      if (session && session.expires > new Date()) {
        user = session.user
      }
    }

    // Try Authorization header if no cookie session
    if (!user) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        const session = await prisma.session.findUnique({
          where: { sessionToken: token },
          include: { user: true },
        })
        if (session && session.expires > new Date()) {
          user = session.user
        }
      }
    }

    if (!user) {
      throw new AppError('Please log in to add free books to your library', 401, 'UNAUTHORIZED')
    }

    // Check if already in library
    const existing = await prisma.userLibrary.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    })

    if (existing) {
      return {
        message: 'Already in your library',
        redirectUrl: `/read/${product.slug}`,
      }
    }

    // Add to library
    await prisma.userLibrary.create({
      data: {
        userId: user.id,
        productId,
        source: 'FREE',
      },
    })

    console.info(withRequestContext(requestId, 'Free book added to library', {
      userId: user.id,
      productId,
    }))

    return {
      message: 'Added to your library!',
      redirectUrl: `/read/${product.slug}`,
    }
  })
}