import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { sendOrderConfirmation } from '@/lib/email'
import { getOrCreateRequestId, withRequestContext } from '@/lib/request-id'

export const runtime = 'nodejs'

interface CheckoutMetadata {
  userId?: string
  customerName: string
  customerEmail: string
  items: string
}

interface StoredItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export async function POST(request: NextRequest) {
  const requestId = getOrCreateRequestId()
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  // Verify signature is present
  if (!signature) {
    console.warn(withRequestContext(requestId, 'Webhook request missing signature'))
    return Response.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature for security
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(
      withRequestContext(requestId, 'Webhook signature verification failed', {
        error: errorMsg,
      })
    )
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    console.info(
      withRequestContext(requestId, 'Webhook event received', {
        eventType: event.type,
        eventId: event.id,
      })
    )

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session, requestId)
        break
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent
        console.error(
          withRequestContext(requestId, 'Payment failed', {
            intentId: intent.id,
            status: intent.status,
          })
        )
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        console.info(
          withRequestContext(requestId, 'Charge refunded', {
            chargeId: charge.id,
            refunded: charge.refunded,
          })
        )
        break
      }

      default:
        console.debug(withRequestContext(requestId, `Unhandled event type: ${event.type}`))
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(
      withRequestContext(requestId, 'Error processing webhook event', {
        eventType: event.type,
        error: errorMsg,
      })
    )
    // Still return 200 to prevent Stripe from retrying
  }

  // Always return 200 to prevent Stripe from retrying
  return Response.json({ received: true })
}

async function handleCheckoutComplete(
  session: Stripe.Checkout.Session,
  requestId: string
) {
  const meta = session.metadata as CheckoutMetadata | null

  // Validate metadata
  if (!meta?.customerEmail || !meta?.customerName) {
    console.error(
      withRequestContext(requestId, 'Missing required metadata', {
        sessionId: session.id,
        hasEmail: !!meta?.customerEmail,
        hasName: !!meta?.customerName,
      })
    )
    return
  }

  // Parse items
  let items: StoredItem[]
  try {
    items = JSON.parse(meta.items)
  } catch (err) {
    console.error(
      withRequestContext(requestId, 'Failed to parse items metadata', {
        sessionId: session.id,
        error: err instanceof Error ? err.message : String(err),
      })
    )
    return
  }

  // Validate items array
  if (!Array.isArray(items) || items.length === 0) {
    console.error(
      withRequestContext(requestId, 'Invalid items array', {
        sessionId: session.id,
        isArray: Array.isArray(items),
        length: items?.length,
      })
    )
    return
  }

  // Calculate total
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Check for duplicate order (idempotency)
  const existing = await prisma.order.findFirst({
    where: { stripeSessionId: session.id },
  })

  if (existing) {
    console.info(
      withRequestContext(requestId, 'Order already exists, skipping', {
        sessionId: session.id,
        orderId: existing.id,
      })
    )
    return
  }

  // Determine user ID
  let userId: string = meta.userId || ''
  if (!userId) {
    // Try to find existing user by email
    const existingUser = await prisma.user.findUnique({
      where: { email: meta.customerEmail.toLowerCase() },
    })

    if (existingUser) {
      userId = existingUser.id
      console.info(
        withRequestContext(requestId, 'Found existing user for email', {
          userId,
        })
      )
    } else {
      // Create guest user for order tracking
      const guestUser = await prisma.user.create({
        data: {
          email: meta.customerEmail.toLowerCase(),
          name: meta.customerName,
          passwordHash: '', // No password for guest accounts
        },
      })
      userId = guestUser.id
      console.info(
        withRequestContext(requestId, 'Created guest user for order', {
          userId,
          email: meta.customerEmail,
        })
      )
    }
  }

  // Create order
  await prisma.order.create({
    data: {
      userId: userId,
      email: meta.customerEmail.toLowerCase(),
      name: meta.customerName,
      total,
      status: 'COMPLETED',
      paymentId: (session.payment_intent as string) || null,
      stripeSessionId: session.id,
      items: items.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      orderItems: {
        create: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    },
  })

  console.info(
    withRequestContext(requestId, 'Order created successfully', {
      sessionId: session.id,
      userId,
      total,
      itemCount: items.length,
    })
  )

  // Send confirmation email (non-blocking)
  sendOrderConfirmation(
    meta.customerEmail,
    meta.customerName,
    items.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    total
  ).catch((err) =>
    console.error(
      withRequestContext(requestId, 'Order confirmation email failed', {
        error: err instanceof Error ? err.message : String(err),
      })
    )
  )
}
