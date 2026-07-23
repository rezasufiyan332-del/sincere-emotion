import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateBody } from '@/lib/api-utils'
import { z } from 'zod'
import { apiSuccess, withErrorHandling, UnauthorizedError, ConflictError } from '@/lib/errors'

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
})

async function getUserByToken(token: string) {
  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    })
    if (!session || session.expires < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
      }
      return null
    }
    return session.user
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    let user = await getCurrentUser()
    if (!user) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        user = await getUserByToken(token)
      }
    }
    if (!user) throw new UnauthorizedError()

    // Fetch orders without include, then fetch items separately
    const rawOrders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    const orderIds = rawOrders.map(o => o.id)
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

    const orders = rawOrders.map(o => ({
      ...o,
      orderItems: itemsByOrderId.get(o.id) || [],
    }))

    const totalOrders = orders.length
    const totalSpent = orders.reduce((sum: number, o: typeof orders[0]) => sum + o.total, 0)

    return apiSuccess({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      orders: orders.map((o: typeof orders[0]) => ({
        id: o.id,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
        orderItems: o.orderItems.map((i: typeof orderItems[0]) => ({ name: i.name, price: i.price, quantity: i.quantity } as const)),
      })),
      stats: { totalOrders, totalSpent },
    })
  })
}

export async function PUT(request: NextRequest) {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    if (!user) throw new UnauthorizedError()

    const body = await request.json()
    const data = validateBody(body, updateProfileSchema)

    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })
      if (existing) throw new ConflictError('Email already in use')
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email.toLowerCase() }),
      },
    })

    return apiSuccess({ id: updated.id, email: updated.email, name: updated.name, role: updated.role })
  })
}