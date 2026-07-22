import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { apiSuccess, withErrorHandling, NotFoundError } from '@/lib/errors'
import { z } from 'zod'

const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await requireAdmin()

    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: {
          include: { product: { select: { id: true, name: true, slug: true, image: true } } },
        },
      },
    })

    if (!order) {
      throw new NotFoundError('Order')
    }

    return apiSuccess(order)
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await requireAdmin()

    const { id } = await params
    const body = await request.json()
    const data = updateOrderSchema.parse(body)

    const order = await prisma.order.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: {
          include: { product: { select: { id: true, name: true, slug: true, image: true } } },
        },
      },
    })

    return apiSuccess(order)
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await requireAdmin()

    const { id } = await params
    await prisma.order.delete({ where: { id } })

    return apiSuccess({ success: true })
  })
}