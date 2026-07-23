import { prisma } from './prisma'
import { AppError } from './errors'

/**
 * Utility functions for safe database operations with proper error handling
 */

/**
 * Safely get a product or throw 404
 */
export async function getProductOrThrow(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new AppError(`Product not found: ${productId}`, 404, 'PRODUCT_NOT_FOUND')
  }

  if (!product.isActive) {
    throw new AppError('Product is no longer available', 404, 'PRODUCT_UNAVAILABLE')
  }

  return product
}

/**
 * Safely get a user or throw 404
 */
export async function getUserOrThrow(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  return user
}

/**
 * Safely get an order or throw 404
 */
export async function getOrderOrThrow(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND')
  }

  // Fetch order items separately
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId: order.id },
  })

  return { ...order, orderItems }
}

/**
 * Safely verify user owns order before allowing access
 */
export async function verifyOrderOwnership(orderId: string, userId: string) {
  const order = await getOrderOrThrow(orderId)

  if (order.userId !== userId) {
    throw new AppError('Access denied: this order does not belong to you', 403, 'FORBIDDEN')
  }

  return order
}

/**
 * Get all active products
 */
export async function getActiveProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get user with all related data
 */
export async function getUserWithRelations(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      sessions: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  // Fetch order items for all orders
  const rawOrders = user.orders
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

  // Combine orders with their items
  const ordersWithItems = rawOrders.map(order => ({
    ...order,
    orderItems: itemsByOrderId.get(order.id) || [],
  }))

  return {
    ...user,
    orders: ordersWithItems,
  }
}

/**
 * Create order from checkout items
 */
export async function createOrderFromCheckout(data: {
  userId?: string | null
  email: string
  name: string
  items: Array<{ productId: string; name: string; price: number; quantity: number }>
  razorpaySessionId?: string
  paymentId?: string
}) {
  const total = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Check for duplicate order (idempotency)
  if (data.razorpaySessionId) {
    const existing = await prisma.order.findFirst({
      where: { razorpayOrderId: data.razorpaySessionId },
    })
    if (existing) {
      return existing
    }
  }

  // Create order with conditional userId
  const order = await prisma.order.create(
    {
      data: {
        ...(data.userId && { userId: data.userId }),
        email: data.email.toLowerCase(),
        name: data.name,
        total,
        status: 'COMPLETED',
        paymentId: data.paymentId || null,
        razorpayOrderId: data.razorpaySessionId || null,
        orderItems: {
          create: data.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { orderItems: true },
    } as Parameters<typeof prisma.order.create>[0]
  )

  return order
}

/**
 * Update order status with validation
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
) {
  const order = await getOrderOrThrow(orderId)

  // Validate status transitions
  const validTransitions: Record<string, string[]> = {
    PENDING: ['COMPLETED', 'FAILED'],
    COMPLETED: ['REFUNDED'],
    FAILED: ['PENDING'],
    REFUNDED: [],
  }

  if (!validTransitions[order.status]?.includes(newStatus)) {
    throw new AppError(
      `Cannot transition from ${order.status} to ${newStatus}`,
      400,
      'INVALID_STATUS_TRANSITION'
    )
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  })
}

/**
 * Atomically check if user has permission for resource
 * Used for authorization checks
 */
export async function checkUserPermission(
  userId: string,
  resourceType: 'order' | 'session' | 'profile',
  resourceId: string
): Promise<boolean> {
  switch (resourceType) {
    case 'order': {
      const order = await prisma.order.findUnique({
        where: { id: resourceId },
        select: { userId: true },
      })
      return order?.userId === userId
    }

    case 'session': {
      const session = await prisma.session.findUnique({
        where: { sessionToken: resourceId },
        select: { userId: true },
      })
      return session?.userId === userId
    }

    case 'profile': {
      return resourceId === userId
    }

    default:
      return false
  }
}