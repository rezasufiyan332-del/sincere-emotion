import { NextRequest } from 'next/server'
import { razorpay, generateReceiptId } from '@/lib/razorpay'
import { prisma } from '@/lib/prisma'
import { validateBody } from '@/lib/api-utils'
import { checkoutSchema } from '@/lib/schemas'
import { apiSuccess, apiError, AppError, withErrorHandling } from '@/lib/errors'
import { checkRateLimit } from '@/lib/rate-limit'
import { getOrCreateRequestId, withRequestContext } from '@/lib/request-id'

export async function POST(request: NextRequest) {
  const requestId = getOrCreateRequestId()

  return withErrorHandling(async () => {
    // Validate Razorpay is configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error(withRequestContext(requestId, 'Razorpay not configured'))
      throw new AppError('Payment system not configured', 500, 'CONFIG_ERROR')
    }

    // Validate BASE_URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      console.error(withRequestContext(requestId, 'BASE_URL not configured'))
      throw new AppError('Server misconfigured', 500, 'CONFIG_ERROR')
    }

    // Parse and validate request
    const body = await request.json()
    const data = validateBody(body, checkoutSchema)

    // Rate limit by email
    const rateLimitResult = checkRateLimit(`checkout:${data.email}`, 10, 60 * 60 * 1000)
    if (!rateLimitResult.allowed) {
      console.warn(withRequestContext(requestId, 'Checkout rate limited', { email: data.email }))
      return apiError(new AppError('Too many checkout attempts. Please try again later.', 429, 'RATE_LIMITED'))
    }

    // Verify ALL prices server-side from database
    const verifiedItems = []
    let totalAmount = 0

    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, title: true, price: true, coverImage: true, subtitle: true, isActive: true, isFree: true },
      })

      if (!product || !product.isActive) {
        throw new AppError(`Product ${item.productId} not found or unavailable`, 400, 'PRODUCT_UNAVAILABLE')
      }

      // Skip free products from payment (they'll be added to library via separate flow)
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

    // If all items are free, handle separately
    if (verifiedItems.length === 0) {
      return apiSuccess({
        allFree: true,
        message: 'All items are free. Redirecting to library...',
        redirectUrl: `${baseUrl}/library`,
      })
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount, // Amount in paise
      currency: 'INR',
      receipt: generateReceiptId(),
      notes: {
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone || '',
        items: JSON.stringify(verifiedItems.map(i => ({
          productId: i.productId,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
        }))),
      },
    })

    console.info(withRequestContext(requestId, 'Razorpay order created', {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
    }))

    return apiSuccess({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      items: verifiedItems,
      customer: {
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
      callbackUrl: `${baseUrl}/payment/success`,
    })
  })
}