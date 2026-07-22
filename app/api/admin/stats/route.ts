import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    // Get revenue by day (last 30 days)
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: 'COMPLETED',
      },
      select: { total: true, createdAt: true },
    })

    const revenueByDay = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dayRevenue = orders
        .filter((o: typeof orders[0]) => o.createdAt.toISOString().split('T')[0] === dateStr)
        .reduce((sum: number, o: typeof orders[0]) => sum + o.total, 0)
      return { date: dateStr.slice(5), revenue: Math.round(dayRevenue / 100) }
    })

    // Get top products by revenue
    const orderItems = await prisma.orderItem.groupBy({
      by: ['name'],
      _sum: { price: true, quantity: true },
      orderBy: { _sum: { price: 'desc' } },
      take: 5,
    })

    const topProducts = orderItems.map((item: typeof orderItems[0]) => ({
      name: item.name.length > 15 ? item.name.slice(0, 15) + '...' : item.name,
      revenue: Math.round((item._sum.price || 0) / 100),
      quantity: item._sum.quantity || 0,
    }))

    // Get user growth (last 30 days)
    const users = await prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    })

    const userGrowth = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const count = users.filter((u: typeof users[0]) => u.createdAt.toISOString().split('T')[0] === dateStr).length
      return { date: dateStr.slice(5), users: count }
    })

    return NextResponse.json({
      success: true,
      data: {
        ordersByStatus: ordersByStatus.map((item: typeof ordersByStatus[0]) => ({
          status: item.status,
          count: item._count.id,
        })),
        revenueByDay,
        topProducts,
        userGrowth,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch stats'
    return NextResponse.json({ success: false, error: { code: 'STATS_ERROR', message } }, { status: 500 })
  }
}
