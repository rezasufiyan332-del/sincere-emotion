import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function AdminSettingsPage() {
  await requireAdmin()

  const [userCount, productCount, orderCount] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-[#64748b]">Manage admin settings and view system information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Stats */}
        <Card className="bg-[#1a1a24] border-[#1e293b] lg:col-span-2">
          <CardHeader className="border-b border-[#1e293b]">
            <CardTitle className="text-white">System Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0a0a0f] border border-[#1e293b] rounded-lg p-6">
                <p className="text-sm text-[#64748b] mb-1">Total Users</p>
                <p className="text-3xl font-bold text-white">{userCount.toLocaleString()}</p>
              </div>
              <div className="bg-[#0a0a0f] border border-[#1e293b] rounded-lg p-6">
                <p className="text-sm text-[#64748b] mb-1">Total Products</p>
                <p className="text-3xl font-bold text-white">{productCount.toLocaleString()}</p>
              </div>
              <div className="bg-[#0a0a0f] border border-[#1e293b] rounded-lg p-6">
                <p className="text-sm text-[#64748b] mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-white">{orderCount.toLocaleString()}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#1e293b]">
              <h3 className="text-lg font-semibold text-white mb-4">Environment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0a0a0f] border border-[#1e293b] rounded-lg p-4">
                  <p className="text-sm text-[#64748b]">Node Environment</p>
                  <p className="text-white font-medium">{process.env.NODE_ENV || 'development'}</p>
                </div>
                <div className="bg-[#0a0a0f] border border-[#1e293b] rounded-lg p-4">
                  <p className="text-sm text-[#64748b]">Database</p>
                  <p className="text-white font-medium">{process.env.DATABASE_URL ? 'Connected' : 'Not configured'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-[#1a1a24] border-[#1e293b]">
          <CardHeader className="border-b border-[#1e293b]">
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="/admin/products/new" className="block p-4 bg-[#0a0a0f] border border-[#1e293b] rounded-lg hover:border-[#f59e0b]/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f59e0b]/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">➕</span>
                </div>
                <div>
                  <p className="text-white font-medium">Add Product</p>
                  <p className="text-sm text-[#64748b]">Create a new guide</p>
                </div>
              </div>
            </a>
            <Link href="/admin/users" className="block p-4 bg-[#0a0a0f] border border-[#1e293b] rounded-lg hover:border-[#f59e0b]/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">👥</span>
                </div>
                <div>
                  <p className="text-white font-medium">Manage Users</p>
                  <p className="text-sm text-[#64748b]">View and edit users</p>
                </div>
              </div>
            </Link>
            <Link href="/admin/orders" className="block p-4 bg-[#0a0a0f] border border-[#1e293b] rounded-lg hover:border-[#f59e0b]/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#10b981]/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📦</span>
                </div>
                <div>
                  <p className="text-white font-medium">Manage Orders</p>
                  <p className="text-sm text-[#64748b]">View and update orders</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Admin Users */}
      <Card className="bg-[#1a1a24] border-[#1e293b]">
        <CardHeader className="border-b border-[#1e293b]">
          <CardTitle className="text-white">Admin Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#64748b] mb-4">Users with admin access to this dashboard</p>
          <AdminUsersList />
        </CardContent>
      </Card>
    </div>
  )
}

async function AdminUsersList() {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-3">
      {admins.map((admin: typeof admins[0]) => (
        <div key={admin.id} className="flex items-center justify-between p-4 bg-[#0a0a0f] border border-[#1e293b] rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#f59e0b]/20 flex items-center justify-center">
              <span className="text-[#f59e0b] font-medium">
                {admin.name?.[0]?.toUpperCase() || admin.email[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">{admin.name || 'No name'}</p>
              <p className="text-sm text-[#64748b]">{admin.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="warning">Admin</Badge>
            {admin.emailVerified && (
              <Badge variant="success" className="text-xs">Verified</Badge>
            )}
            <span className="text-xs text-[#64748b]">
              Joined {new Date(admin.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
