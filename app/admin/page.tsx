import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { AdminAnalytics } from '@/components/admin-analytics'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [ordersCount, revenue, usersCount, productsCount] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: 'COMPLETED' } }),
    prisma.user.count(),
    prisma.product.count({ where: { active: true } }),
  ])

  const stats = [
    { label: 'Total Orders', value: ordersCount.toLocaleString(), icon: '📦', href: '/admin/orders' },
    { label: 'Total Revenue', value: `$${(Number(revenue._sum.total || 0) / 100).toLocaleString()}`, icon: '💰', href: '/admin/orders' },
    { label: 'Total Users', value: usersCount.toLocaleString(), icon: '👥', href: '/admin/users' },
    { label: 'Active Products', value: productsCount.toLocaleString(), icon: '📚', href: '/admin/products' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-[#64748b]">Welcome to the admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-[#1a1a24] border border-[#1e293b] rounded-lg p-6 hover:border-[#f59e0b]/30 transition-colors">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{stat.icon}</span>
              <div>
                <p className="text-sm text-[#64748b]">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Analytics Charts */}
      <AdminAnalytics />

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/admin/products/new" className="bg-[#1a1a24] border border-[#1e293b] rounded-lg p-6 hover:border-[#f59e0b]/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f59e0b]/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">➕</span>
              </div>
              <div>
                <p className="text-white font-medium">Add Product</p>
                <p className="text-sm text-[#64748b]">Create a new guide</p>
              </div>
            </div>
          </Link>
          <Link href="/admin/orders" className="bg-[#1a1a24] border border-[#1e293b] rounded-lg p-6 hover:border-[#f59e0b]/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#10b981]/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <p className="text-white font-medium">Manage Orders</p>
                <p className="text-sm text-[#64748b]">View and update orders</p>
              </div>
            </div>
          </Link>
          <Link href="/admin/users" className="bg-[#1a1a24] border border-[#1e293b] rounded-lg p-6 hover:border-[#f59e0b]/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <p className="text-white font-medium">Manage Users</p>
                <p className="text-sm text-[#64748b]">View and manage users</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}