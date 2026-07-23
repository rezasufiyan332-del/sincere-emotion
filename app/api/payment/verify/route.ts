import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPaymentSignature } from '@/lib/razorpay-utils'
import { apiSuccess, apiError, AppError, withErrorHandling } from '@/lib/errors'
import { getOrCreateRequestId, withRequestContext } from '@/lib/request-id'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const requestId = getOrCreateRequestId()

  return withErrorHandling(async () => {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, customer } = body

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new AppError('Missing payment verification data', 400, 'VALIDATION_ERROR')
    }

    // Verify signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET!
    )

    if (!isValid) {
      console.error(withRequestContext(requestId, 'Payment signature verification failed', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      }))
      throw new AppError('Invalid payment signature', 400, 'INVALID_SIGNATURE')
    }

    console.info(withRequestContext(requestId, 'Payment signature verified', {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    }))

    // Check for duplicate order (idempotency)
    const existingOrder = await prisma.order.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    })

    if (existingOrder) {
      console.info(withRequestContext(requestId, 'Order already exists, skipping', {
        orderId: existingOrder.id,
      }))

      // Still need to ensure library entries exist
      await ensureLibraryEntries(existingOrder.id, razorpay_payment_id)

      return apiSuccess({
        orderId: existingOrder.id,
        message: 'Order already processed',
      })
    }

    // Parse items from request
    const parsedItems = items || []
    const customerData = customer || {}

    // Calculate total
    const total = parsedItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

    // FIRST: Check for existing session (logged in user)
    let userId = ''
    let user = null

    // Try to get session from cookie
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session-token')?.value

    if (sessionToken) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      })
      if (session && session.expires > new Date()) {
        user = session.user
        userId = user.id
      }
    }

    // If no session, try to find user by email
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: customerData.email.toLowerCase() },
      })
    }

    // If still no user, create guest user
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: customerData.email.toLowerCase(),
          name: customerData.name,
          passwordHash: '', // No password for guest
        },
      })
      console.info(withRequestContext(requestId, 'Created guest user', { userId: user.id }))
    }

    userId = user.id

    // Create order first
    const order = await prisma.order.create({
      data: {
        userId,
        email: customerData.email.toLowerCase(),
        name: customerData.name,
        phone: customerData.phone,
        total,
        status: 'COMPLETED',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      },
    })

    // Create order items separately
    await prisma.orderItem.createMany({
      data: parsedItems.map((item: any) => ({
        orderId: order.id,
        productId: item.productId,
        name: item.title,
        price: item.price,
        quantity: item.quantity,
      })),
    })

    // Create library entries for each purchased product
    for (const item of parsedItems) {
      await prisma.userLibrary.create({
        data: {
          userId,
          productId: item.productId,
          source: 'PURCHASED',
          orderId: order.id,
        },
      }).catch(() => {
        // Ignore duplicate library entries
      })
    }

    console.info(withRequestContext(requestId, 'Order created successfully', {
      orderId: order.id,
      userId,
      total,
      itemCount: parsedItems.length,
    }))

    return apiSuccess({
      orderId: order.id,
      redirectUrl: `/library`,
    })
  })
}

async function ensureLibraryEntries(orderId: string, paymentId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (order) {
    // Fetch order items separately
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
    })

    for (const item of orderItems) {
      await prisma.userLibrary.create({
        data: {
          userId: order.userId,
          productId: item.productId,
          source: 'PURCHASED',
          orderId: order.id,
        },
      }).catch(() => {})
    }
  }
}