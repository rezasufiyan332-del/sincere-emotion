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

    const order = await prisma.order.findFirst({
      where: {
        stripeSessionId: sessionId,
      },
      include: {
        orderItems: true,
      },
    })

    if (!order) {
      return apiSuccess({ success: false, error: { message: 'Order not found' } }, 404)
    }

    return apiSuccess({
      id: order.id,
      email: order.email,
      name: order.name,
      total: order.total,
      status: order.status,
      items: order.orderItems.map((item: typeof order.orderItems[0]) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      createdAt: order.createdAt.toISOString(),
    })
  })
}
