import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

export default async function DashboardOrdersPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  let orders: Array<{
    id: string
    total: number
    status: string
    createdAt: Date
    orderItems: OrderItem[]
  }> = []

  try {
    // Fetch orders first
    const rawOrders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    // Fetch order items for all orders
    const orderIds = rawOrders.map(o => o.id)
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: { in: orderIds } },
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
        orderId: true,
      },
    })

    // Group items by orderId
    const itemsByOrderId = new Map<string, OrderItem[]>()
    for (const item of orderItems) {
      if (!itemsByOrderId.has(item.orderId)) {
        itemsByOrderId.set(item.orderId, [])
      }
      itemsByOrderId.get(item.orderId)!.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })
    }

    // Combine orders with their items
    orders = rawOrders.map(order => ({
      id: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      orderItems: itemsByOrderId.get(order.id) || [],
    }))
  } catch {
    // Database unavailable
  }

  const statusStyles: Record<string, string> = {
    PENDING: 'bg-[#f59e0b]/20 text-[#f59e0b]',
    PROCESSING: 'bg-[#f59e0b]/20 text-[#f59e0b]',
    COMPLETED: 'bg-[#10b981]/20 text-[#10b981]',
    FAILED: 'bg-[#f43f5e]/20 text-[#f43f5e]',
    REFUNDED: 'bg-[#3b82f6]/20 text-[#3b82f6]',
    CANCELLED: 'bg-[#64748b]/20 text-[#64748b]',
  }

  function formatINR(paise: number): string {
    if (paise === 0) return 'FREE'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(paise / 100)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Order History</h1>
      
      {orders.length === 0 ? (
        <div className="bg-[#1a1a24] border border-[#1e293b] rounded-lg p-12 text-center">
          <p className="text-[#64748b] mb-4">No orders yet</p>
          <Link href="/" className="text-[#f59e0b] hover:text-[#d97706] font-medium">
            Browse Guides
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-[#1a1a24] border border-[#1e293b] rounded-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-[#1e293b]">
                <div>
                  <p className="text-white font-semibold">{order.id}</p>
                  <p className="text-sm text-[#64748b]">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[order.status] || ''}`}>
                    {order.status}
                  </span>
                  <p className="text-xl font-bold text-white">{formatINR(order.total)}</p>
                </div>
              </div>
              {/* Order Items */}
              {Array.isArray(order.orderItems) && order.orderItems.map((item: OrderItem, idx: number) => (
                <div key={idx} className="flex justify-between text-sm py-2">
                  <span className="text-[#cbd5e1]">{item.name} x{item.quantity}</span>
                  <span className="text-white">{formatINR(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatINR(paise: number): string {
  if (paise === 0) return 'FREE'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(paise / 100)
}