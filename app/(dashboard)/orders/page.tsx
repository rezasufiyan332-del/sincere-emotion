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

interface Order {
  id: string
  total: number
  status: string
  createdAt: Date
  items: OrderItem[] | unknown
}

export default async function DashboardOrdersPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  let orders: Order[] = []
  try {
    orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })
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
                  <p className="text-xl font-bold text-white">${(order.total / 100).toFixed(2)}</p>
                </div>
              </div>
              {/* Order Items */}
              {Array.isArray(order.items) && (order.items as OrderItem[]).map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm py-2">
                  <span className="text-[#cbd5e1]">{item.name} x{item.quantity}</span>
                  <span className="text-white">${((item.price * item.quantity) / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}