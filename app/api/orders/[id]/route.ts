import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { apiSuccess, withErrorHandling, NotFoundError, ForbiddenError } from '@/lib/errors'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const session = await requireAuth()
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    })

    if (!order) {
      throw new NotFoundError('Order')
    }

    if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have access to this order')
    }

    return apiSuccess(order)
  })
}
