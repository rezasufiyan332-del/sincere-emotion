import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { Home, Package, ShoppingCart, Users, Settings } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  const nav = [
    { href: '/admin', label: 'Overview', icon: Home },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1a24] border-r border-[#1e293b] flex flex-col">
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#1e293b]">
          <span className="text-xl font-bold text-white">
            Sincere<span className="text-[#f59e0b]">.</span>
          </span>
          <span className="px-2 py-0.5 text-xs font-semibold bg-[#f59e0b]/20 text-[#f59e0b] rounded">
            Admin
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#cbd5e1] hover:bg-[#1e293b] hover:text-white transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[#1e293b]">
          <Link href="/" className="text-sm text-[#64748b] hover:text-white transition-colors">
            &larr; Back to Shop
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <header className="sticky top-0 z-40 bg-[#0a0a0f] border-b border-[#1e293b]">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </main>
    </div>
  )
}