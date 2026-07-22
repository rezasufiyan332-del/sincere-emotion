import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')
  const now = new Date()

  let recentOrders: Array<{ id: string; total: number; status: string; createdAt: Date }> = []
  try {
    recentOrders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })
  } catch {
    // Database unavailable
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user.name || 'there'}
        </h1>
        <p className="text-[#64748b]">
          Manage your account and view your orders.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1a1a24] border border-[#1e293b] rounded-lg p-6">
          <p className="text-sm text-[#64748b] mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-white">{recentOrders.length}</p>
        </div>
        <div className="bg-[#1a1a24] border border-[#1e293b] rounded-lg p-6">
          <p className="text-sm text-[#64748b] mb-1">Member Since</p>
          <p className="text-2xl font-bold text-white">
            {now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="bg-[#1a1a24] border border-[#1e293b] rounded-lg p-6">
          <p className="text-sm text-[#64748b] mb-1">Account</p>
          <p className="text-lg font-bold text-white truncate">{user.email}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Recent Orders</h2>
          <Link href="/orders" className="text-sm text-[#f59e0b] hover:text-[#d97706]">
            View All
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="bg-[#1a1a24] border border-[#1e293b] rounded-lg p-8 text-center">
            <p className="text-[#64748b] mb-4">No orders yet</p>
            <Link href="/" className="text-[#f59e0b] hover:text-[#d97706] font-medium">
              Browse Guides
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="bg-[#1a1a24] border border-[#1e293b] rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{order.id.slice(0, 20)}...</p>
                  <p className="text-sm text-[#64748b]">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">${(order.total / 100).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'COMPLETED' ? 'bg-[#10b981]/20 text-[#10b981]' :
                    order.status === 'PENDING' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                    'bg-[#64748b]/20 text-[#64748b]'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}