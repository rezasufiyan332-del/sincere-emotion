import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/razorpay-utils'
import { getOrCreateRequestId, withRequestContext } from '@/lib/request-id'

export async function POST(request: NextRequest) {
  const requestId = getOrCreateRequestId()
  const body = await request.text()
  const signature = request.headers.get('x-razorpay-signature')

  // Verify webhook signature
  if (!signature) {
    console.warn(withRequestContext(requestId, 'Webhook missing signature'))
    return Response.json({ error: 'Missing signature' }, { status: 400 })
  }

  if (!verifyWebhookSignature(body, signature, process.env.RAZORPAY_WEBHOOK_SECRET!)) {
    console.error(withRequestContext(requestId, 'Webhook signature verification failed'))
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: any
  try {
    event = JSON.parse(body)
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  console.info(withRequestContext(requestId, 'Webhook event received', {
    eventType: event.event,
    eventId: event.id,
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
        console.error(withRequestContext(requestId, 'Payment failed', {
          paymentId: payment.id,
          errorCode: payment.error_code,
          errorDescription: payment.error_description,
        }))
        break
      }

      case 'order.paid': {
        const order = event.payload.order.entity
        console.info(withRequestContext(requestId, 'Order paid', { orderId: order.id }))
        break
      }

      case 'refund.created': {
        const refund = event.payload.refund.entity
        console.info(withRequestContext(requestId, 'Refund created', { refundId: refund.id }))
        break
      }

      default:
        console.debug(withRequestContext(requestId, `Unhandled event: ${event.event}`))
    }
  } catch (err) {
    console.error(withRequestContext(requestId, 'Error processing webhook', {
      eventType: event.event,
      error: err instanceof Error ? err.message : String(err),
    }))
  }

  // Always return 200 to prevent Razorpay retries
  return Response.json({ received: true })
}

async function handlePaymentCaptured(payment: any, requestId: string) {
  const orderId = payment.order_id
  const paymentId = payment.id
  const amount = payment.amount

  console.info(withRequestContext(requestId, 'Payment captured', { orderId, paymentId, amount }))

  // Find the order in our database
  const order = await prisma.order.findUnique({
    where: { razorpayOrderId: orderId },
    include: { items: true },
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
  for (const item of order.items) {
    await prisma.userLibrary.create({
      data: {
        userId: order.userId,
        productId: item.productId,
        source: 'PURCHASED',
        orderId: order.id,
      },
    }).catch(() => {}) // Ignore duplicates
  }

  console.info(withRequestContext(requestId, 'Library entries ensured', {
    orderId: order.id,
    userId: order.userId,
  }))
}