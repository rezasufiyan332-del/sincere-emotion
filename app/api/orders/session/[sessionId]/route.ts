import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, withErrorHandling } from '@/lib/errors'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  return withErrorHandling(async () => {
    const { sessionId } = await params

    if (!sessionId) {
      return apiSuccess({ success: false, error: { message: 'Session ID required' } }, 400)
    }

    // Try to find order by razorpay order ID (used as session ID in Razorpay flow)
    const order = await prisma.order.findFirst({
      where: {
        razorpayOrderId: sessionId,
      },
    })

    if (!order) {
      return apiSuccess({ success: false, error: { message: 'Order not found' } }, 404)
    }

    // Fetch order items separately
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
    })

    return apiSuccess({
      id: order.id,
      email: order.email,
      name: order.name,
      total: order.total,
      status: order.status,
      items: orderItems.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      createdAt: order.createdAt.toISOString(),
    })
  })
}