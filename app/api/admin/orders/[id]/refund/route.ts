import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { sendRefundEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const { reason } = body

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      )
    }

    if (order.status === 'REFUNDED') {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_REFUNDED', message: 'Order already refunded' } },
        { status: 400 }
      )
    }

    if (order.status === 'FAILED' || order.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: 'Cannot refund a failed or cancelled order' } },
        { status: 400 }
      )
    }

    if (!order.paymentId) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_PAYMENT', message: 'No payment ID found for this order' } },
        { status: 400 }
      )
    }

    // Create Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentId,
      reason: 'requested_by_customer',
      metadata: {
        orderId: id,
        reason: reason || 'Admin initiated refund',
      },
    })

    // Update order status
    await prisma.order.update({
      where: { id },
      data: {
        status: 'REFUNDED',
      },
    })

    // Send refund confirmation email
    sendRefundEmail(
      order.email,
      order.name,
      order.total
    ).catch(() => {})

    return NextResponse.json({
      success: true,
      data: {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process refund'
    return NextResponse.json(
      { success: false, error: { code: 'REFUND_ERROR', message } },
      { status: 500 }
    )
  }
}