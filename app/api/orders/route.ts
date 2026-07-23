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

    // Create order first
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        email: data.email,
        name: data.name,
        total,
        status: 'PENDING',
      },
    })

    // Create order items separately
    await prisma.orderItem.createMany({
      data: data.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    })

    // Fetch order items separately
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
    })

    const orderWithItems = { ...order, orderItems }

    return apiSuccess(orderWithItems, 201)
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    // Fetch order items for all orders
    const orderIds = orders.map(o => o.id)
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: { in: orderIds } },
    })

    // Group items by orderId
    const itemsByOrderId = new Map<string, typeof orderItems>()
    for (const item of orderItems) {
      if (!itemsByOrderId.has(item.orderId)) {
        itemsByOrderId.set(item.orderId, [])
      }
      itemsByOrderId.get(item.orderId)!.push(item)
    }

    // Combine orders with their items
    const ordersWithItems = orders.map(order => ({
      ...order,
      orderItems: itemsByOrderId.get(order.id) || [],
    }))

    return apiSuccess({
      orders: ordersWithItems,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  })
}