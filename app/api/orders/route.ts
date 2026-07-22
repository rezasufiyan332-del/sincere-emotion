import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { validateBody } from '@/lib/api-utils'
import { createOrderSchema } from '@/lib/schemas'
import { apiSuccess, withErrorHandling } from '@/lib/errors'

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const session = await requireAuth()
    const body = await request.json()
    const data = validateBody(body, createOrderSchema)

    const total = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        email: data.email,
        name: data.name,
        items: data.items,
        total,
        status: 'PENDING',
        orderItems: {
          create: data.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    })

    return apiSuccess(order, 201)
  })
}

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '10'))
    const skip = (page - 1) * limit

    const where = { userId: session.user.id }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { orderItems: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return apiSuccess({
      orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  })
}
