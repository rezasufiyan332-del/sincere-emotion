import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login?redirect=/dashboard')

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Dashboard Header */}
      <div className="border-b border-[#1e293b] bg-[#0a0a0f]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold text-white">
                Sincere<span className="text-[#f59e0b]">.</span>
              </Link>
              <nav className="hidden sm:flex items-center gap-6">
                <Link href="/" className="text-sm text-[#cbd5e1] hover:text-white transition-colors">
                  Overview
                </Link>
                <Link href="/orders" className="text-sm text-[#cbd5e1] hover:text-white transition-colors">
                  Orders
                </Link>
                <Link href="/profile" className="text-sm text-[#cbd5e1] hover:text-white transition-colors">
                  Profile
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#64748b]">{user.email}</span>
              <Link href="/" className="text-sm text-[#f59e0b] hover:text-[#d97706] transition-colors">
                Back to Shop
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden border-b border-[#1e293b] bg-[#0a0a0f]">
        <div className="flex gap-4 px-4 py-3">
          <Link href="/" className="text-sm text-[#cbd5e1] hover:text-white">Overview</Link>
          <Link href="/orders" className="text-sm text-[#cbd5e1] hover:text-white">Orders</Link>
          <Link href="/profile" className="text-sm text-[#cbd5e1] hover:text-white">Profile</Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
}