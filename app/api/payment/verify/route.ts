import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { razorpay } from '@/lib/razorpay'
import { verifyPaymentSignature } from '@/lib/razorpay-utils'
import { apiSuccess, AppError, withErrorHandling } from '@/lib/errors'
import { getOrCreateRequestId, withRequestContext } from '@/lib/request-id'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const requestId = getOrCreateRequestId()

  return withErrorHandling(async () => {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    // SECURITY: Only trust razorpay_order_id, razorpay_payment_id, razorpay_signature
    // Everything else must come from Razorpay server-side API (order notes)

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
      await ensureLibraryEntries(existingOrder.id, razorpay_payment_id)
      return apiSuccess({
        orderId: existingOrder.id,
        redirectUrl: `/library`,
      })
    }

    // SECURITY: Fetch order from Razorpay API to get verified data
    // This ensures items/prices come from our server, not the client
    let razorpayOrder: any
    try {
      razorpayOrder = await razorpay.orders.fetch(razorpay_order_id)
    } catch (err) {
      console.error(withRequestContext(requestId, 'Failed to fetch Razorpay order', { orderId: razorpay_order_id }))
      throw new AppError('Could not verify order with Razorpay', 500, 'RAZORPAY_FETCH_ERROR')
    }

    if (!razorpayOrder || razorpayOrder.status !== 'paid') {
      console.error(withRequestContext(requestId, 'Razorpay order not paid', {
        orderId: razorpay_order_id,
        status: razorpayOrder?.status,
      }))
      throw new AppError('Payment not completed', 400, 'PAYMENT_NOT_COMPLETED')
    }

    // SECURITY: Reconstruct order data from Razorpay order notes (server-verified)
    const notes = razorpayOrder.notes || {}
    const verifiedItems = JSON.parse(notes.items || '[]') as Array<{
      productId: string
      title: string
      price: number
      quantity: number
    }>

    if (verifiedItems.length === 0) {
      throw new AppError('No items found in order notes', 400, 'NO_ITEMS')
    }

    // Calculate total from VERIFIED server-side prices (not client-provided)
    const total = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Get customer data from verified Razorpay order notes
    const customerEmail = notes.customerEmail || razorpayOrder.receipt || ''
    const customerName = notes.customerName || 'Guest'
    const customerPhone = notes.customerPhone || ''

    if (!customerEmail) {
      throw new AppError('No customer email found in order', 400, 'NO_EMAIL')
    }

    // SECURITY: Check for existing session (logged in user)
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

    // If no session, find user by email
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: customerEmail.toLowerCase() },
      })
    }

    // If still no user, create guest user (with email, no password)
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: customerEmail.toLowerCase(),
          name: customerName,
          passwordHash: '',
        },
      })
      console.info(withRequestContext(requestId, 'Created guest user', { userId: user.id }))
    }

    userId = user.id

    // SECURITY: Use transaction for order + library creation (atomic)
    const order = await prisma.$transaction(async (tx) => {
      // Create order with VERIFIED data from Razorpay
      const newOrder = await tx.order.create({
        data: {
          userId,
          email: customerEmail.toLowerCase(),
          name: customerName,
          phone: customerPhone,
          total,
          status: 'COMPLETED',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        },
      })

      // Create order items from VERIFIED server data
      await tx.orderItem.createMany({
        data: verifiedItems.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          name: item.title,
          price: item.price,  // VERIFIED server price
          quantity: item.quantity,
        })),
      })

      // Create library entries for each purchased product
      for (const item of verifiedItems) {
        await tx.userLibrary.create({
          data: {
            userId,
            productId: item.productId,
            source: 'PURCHASED',
            orderId: newOrder.id,
          },
        }).catch(() => {
          // Ignore duplicate library entries (idempotent)
        })
      }

      return newOrder
    })

    console.info(withRequestContext(requestId, 'Order created successfully', {
      orderId: order.id,
      userId,
      total,
      itemCount: verifiedItems.length,
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