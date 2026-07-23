import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { validateBody } from '@/lib/api-utils'
import { checkoutSchema } from '@/lib/schemas'
import { apiSuccess, apiError, AppError, withErrorHandling } from '@/lib/errors'
import { checkRateLimit } from '@/lib/rate-limit'
import { getOrCreateRequestId, withRequestContext } from '@/lib/request-id'

export async function POST(request: NextRequest) {
  const requestId = getOrCreateRequestId()

  return withErrorHandling(async () => {
    // Validate Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('dummy')) {
      console.error(
        withRequestContext(requestId, 'Stripe not configured', {
          hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        })
      )
      throw new AppError(
        'Stripe not configured. Contact support.',
        500,
        'CONFIG_ERROR'
      )
    }

    // Validate BASE_URL is configured
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      console.error(
        withRequestContext(requestId, 'BASE_URL not configured')
      )
      throw new AppError(
        'Server misconfigured. Contact support.',
        500,
        'CONFIG_ERROR'
      )
    }

    // Parse and validate request
    const body = await request.json()
    const data = validateBody(body, checkoutSchema)

    // Rate limit by email
    const rateLimitResult = checkRateLimit(`checkout:${data.email}`, 10, 60 * 60 * 1000)

    if (!rateLimitResult.allowed) {
      console.warn(
        withRequestContext(requestId, 'Checkout rate limited', {
          email: data.email.substring(0, 3) + '***', // Don't log full email
          retryAfterMs: rateLimitResult.retryAfterMs,
        })
      )
      return apiError(
        new AppError('Too many checkout attempts. Please try again later.', 429, 'RATE_LIMITED')
      )
    }

    // Verify ALL prices server-side from database
    // CRITICAL: Never trust client-provided prices
    const verifiedItems = []
    let totalAmount = 0

    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, title: true, price: true, coverImage: true, subtitle: true, isActive: true, isFree: true },
      })

      if (!product || !product.isActive) {
        throw new AppError(
          `Product ${item.productId} not found or unavailable`,
          400,
          'PRODUCT_UNAVAILABLE'
        )
      }

      // Skip free products (they should be handled via free book flow)
      if (product.isFree) {
        continue
      }

      // Use only database price (never client price)
      const itemTotal = product.price * item.quantity
      totalAmount += itemTotal

      verifiedItems.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        coverImage: product.coverImage,
        subtitle: product.subtitle,
      })
    }

    // SECURITY: Generate deterministic idempotency key
    // Prevents double-charges if request is retried
    const idempotencyKey = `${data.email}-${verifiedItems.map((i) => `${i.productId}:${i.quantity}`).join('|')}-${Math.floor(Date.now() / (5 * 60 * 1000))}`

    console.info(
      withRequestContext(requestId, 'Creating Stripe checkout session', {
        email: data.email.substring(0, 3) + '***',
        itemCount: verifiedItems.length,
        totalAmount,
      })
    )

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create(
      {
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: data.email,
        line_items: verifiedItems.map((item) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.title,
              description: item.subtitle || undefined,
              images: item.coverImage ? [`${baseUrl}${item.coverImage}`] : [],
            },
            unit_amount: item.price, // Database price - verified
          },
          quantity: item.quantity,
        })),
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout/cancel`,
        metadata: {
          customerName: data.name,
          customerEmail: data.email,
          items: JSON.stringify(
            verifiedItems.map((item) => ({
              productId: item.productId,
              title: item.title,
              price: item.price,
              quantity: item.quantity,
            }))
          ),
        },
      },
      {
        idempotencyKey, // Prevents duplicate charges
      }
    )

    console.info(
      withRequestContext(requestId, 'Checkout session created', {
        sessionId: checkoutSession.id,
        totalAmount,
      })
    )

    return apiSuccess({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  })
}
