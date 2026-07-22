import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateBody } from '@/lib/api-utils'
import { subscribeSchema } from '@/lib/schemas'
import { apiSuccess, withErrorHandling, ConflictError } from '@/lib/errors'
import { sendNewsletterWelcome } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json()
    const data = validateBody(body, subscribeSchema)

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: data.email.toLowerCase() },
    })

    if (existing) {
      if (existing.unsubscribedAt) {
        // Re-subscribe if previously unsubscribed
        const unsubscribeToken = crypto.randomBytes(32).toString('hex')
        const tokenHash = crypto.createHash('sha256').update(unsubscribeToken).digest('hex')
        
        await prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: {
            unsubscribedAt: null,
            unsubscribeToken: tokenHash,
            subscribedAt: new Date(),
          },
        })
        
        // Send welcome email with unsubscribe link
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/newsletter/unsubscribe/${unsubscribeToken}`
        sendNewsletterWelcome(data.email, unsubscribeUrl).catch(() => {})
        
        return apiSuccess({ message: 'Successfully resubscribed to newsletter' }, 201)
      }
      throw new ConflictError('You are already subscribed to our newsletter')
    }

    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(unsubscribeToken).digest('hex')

    await prisma.newsletterSubscriber.create({
      data: {
        email: data.email.toLowerCase(),
        source: data.source,
        unsubscribeToken: tokenHash,
      },
    })

    // Send welcome email with unsubscribe link
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/newsletter/unsubscribe/${unsubscribeToken}`
    sendNewsletterWelcome(data.email, unsubscribeUrl).catch(() => {})

    return apiSuccess({ message: 'Successfully subscribed to newsletter' }, 201)
  })
}
