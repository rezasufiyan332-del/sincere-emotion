import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, withErrorHandling, NotFoundError } from '@/lib/errors'
import crypto from 'crypto'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  return withErrorHandling(async () => {
    const { token } = await params

    if (!token) {
      throw new NotFoundError('Unsubscribe token')
    }

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const subscriber = await prisma.newsletterSubscriber.findFirst({
      where: { unsubscribeToken: tokenHash },
    })

    if (!subscriber) {
      throw new NotFoundError('Invalid unsubscribe token')
    }

    if (subscriber.unsubscribedAt) {
      return apiSuccess({ message: 'Already unsubscribed' })
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { unsubscribedAt: new Date() },
    })

    return apiSuccess({ message: 'Successfully unsubscribed' })
  })
}