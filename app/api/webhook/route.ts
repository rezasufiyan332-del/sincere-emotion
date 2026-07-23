import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/razorpay-utils'
import { sendOrderConfirmation } from '@/lib/email'
import { getOrCreateRequestId, withRequestContext } from '@/lib/request-id'

export const runtime = 'nodejs'

interface RazorpayWebhookEvent {
  event: string
  payload: {
    payment: {
      entity: {
        id: string
        order_id: string
        amount: number
        status: string
        notes?: Record<string, string>
      }
      order?: {
        entity: {
          id: string
          amount: number
          status: string
          notes?: Record<string, string>
        }
      }
    }
    order?: {
      entity: {
        id: string
        amount: number
        status: string
        notes?: Record<string, string>
      }
    }
    refund?: {
      entity: {
        id: string
        amount: number
        status: string
        payment_id: string
      }
    }
  }
}

export async function POST(request: NextRequest) {
  const requestId = getOrCreateRequestId()
  const body = await request.text()
  const signature = request.headers.get('x-razorpay-signature')

  // Verify webhook signature
  if (!signature) {
    console.warn(withRequestContext(requestId, 'Webhook request missing signature'))
    return Response.json({ error: 'Missing signature' }, { status: 400 })
  }

  if (!verifyWebhookSignature(body, signature, process.env.RAZORPAY_WEBHOOK_SECRET!)) {
    console.error(withRequestContext(requestId, 'Webhook signature verification failed'))
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: RazorpayWebhookEvent
  try {
    event = JSON.parse(body)
  } catch (err) {
    console.error(withRequestContext(requestId, 'Failed to parse webhook body', { error: String(err) }))
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  console.info(withRequestContext(requestId, 'Webhook event received', {
    eventType: event.event,
    eventId: event.payload.payment.entity.id,
  }))

  try {
    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity
        await handlePaymentCaptured(payment, requestId)
        break
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity
        console.error(
          withRequestContext(requestId, 'Payment failed', {
            paymentId: payment.id,
            status: payment.status,
          })
        )
        break
      }

      case 'order.paid': {
        const order = event.payload.order?.entity
        if (order) {
          console.info(withRequestContext(requestId, 'Order paid', { orderId: order.id }))
        }
        break
      }

      case 'refund.created': {
        const refund = event.payload.payment?.entity
        console.info(withRequestContext(requestId, 'Refund created', { refundId: refund?.id }))
        break
      }

      default:
        console.debug(withRequestContext(requestId, `Unhandled event type: ${event.event}`))
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(
      withRequestContext(requestId, 'Error processing webhook event', {
        eventType: event.event,
        error: errorMsg,
      })
    )
  }

  // Always return 200 to prevent Razorpay from retrying
  return Response.json({ received: true })
}

async function handlePaymentCaptured(payment: RazorpayWebhookEvent['payload']['payment']['entity'], requestId: string) {
  const orderId = payment.order_id
  const paymentId = payment.id
  const amount = payment.amount
  const notes = payment.notes || {}

  console.info(withRequestContext(requestId, 'Payment captured', { orderId, paymentId, amount }))

  // Find the order in our database
  const order = await prisma.order.findUnique({
    where: { razorpayOrderId: orderId },
  })

  if (!order) {
    console.warn(withRequestContext(requestId, 'Order not found for payment', { orderId }))
    return
  }

  // Update order status if not already completed
  if (order.status !== 'COMPLETED') {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'COMPLETED',
        razorpayPaymentId: paymentId,
      },
    })
  }

  // Ensure library entries exist for all items
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId: order.id },
  })

  for (const item of orderItems) {
    await prisma.userLibrary.create({
      data: {
        userId: order.userId,
        productId: item.productId,
        source: 'PURCHASED',
        orderId: order.id,
      },
    }).catch(() => {}) // Ignore duplicates
  }

  // Send confirmation email
  if (notes.customerEmail && notes.customerName) {
    const items = orderItems.map(i => ({
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    }))
    sendOrderConfirmation(notes.customerEmail, notes.customerName, items, amount).catch(() => {})
  }

  console.info(withRequestContext(requestId, 'Order fulfilled', {
    orderId: order.id,
    userId: order.userId,
    total: order.total,
    itemCount: orderItems.length,
  }))
}