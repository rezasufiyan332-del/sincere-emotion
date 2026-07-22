import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Package, User, Mail, Calendar, CreditCard, ChevronLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const statusStyles: Record<string, string> = {
  PENDING: 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30',
  PROCESSING: 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30',
  COMPLETED: 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30',
  FAILED: 'bg-[#f43f5e]/20 text-[#f43f5e] border-[#f43f5e]/30',
  REFUNDED: 'bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/30',
  CANCELLED: 'bg-[#64748b]/20 text-[#64748b] border-[#64748b]/30',
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  })

  if (!order) {
    notFound()
  }

  const items = order.items as Array<{ name: string; price: number; quantity: number; productId: string }>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Order {id.slice(0, 12)}...</h1>
            <p className="text-[#64748b]">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={statusStyles[order.status]} style={{ borderWidth: 1, borderStyle: 'solid' }}>
            {order.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card className="bg-[#1a1a24] border-[#1e293b]">
            <CardHeader className="border-b border-[#1e293b]">
              <CardTitle className="text-white">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#1e293b]">
                {items.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <Package className="w-10 h-10 text-[#64748b] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate">{item.name}</p>
                        <p className="text-sm text-[#64748b]">Qty: {item.quantity} × ${(item.price / 100).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">${((item.price * item.quantity) / 100).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card className="bg-[#1a1a24] border-[#1e293b]">
            <CardHeader className="border-b border-[#1e293b]">
              <CardTitle className="text-white">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#64748b]">Name</p>
                  <p className="text-white font-medium">{order.name}</p>
                </div>
                <div>
                  <p className="text-sm text-[#64748b]">Email</p>
                  <p className="text-white font-medium">{order.email}</p>
                </div>
              </div>
              {order.user && (
                <div className="pt-4 border-t border-[#1e293b]">
                  <p className="text-sm text-[#64748b] mb-2">Linked Account</p>
                  <div className="flex items-center gap-3">
                    <User className="w-8 h-8 text-[#64748b]" />
                    <div>
                      <p className="text-white font-medium">{order.user.name || 'No name'}</p>
                      <p className="text-sm text-[#64748b]">{order.user.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary & Actions */}
        <div className="space-y-6">
          <Card className="bg-[#1a1a24] border-[#1e293b] sticky top-24">
            <CardHeader className="border-b border-[#1e293b]">
              <CardTitle className="text-white">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">Subtotal</span>
                <span className="text-white">${(order.total / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">Total</span>
                <span className="text-white font-bold text-lg">${(order.total / 100).toFixed(2)}</span>
              </div>

              <div className="pt-4 border-t border-[#1e293b] space-y-3">
                <label className="block text-sm font-medium text-[#cbd5e1]">Update Status</label>
                <select
                  defaultValue={order.status}
                  onChange={(e) => updateOrderStatus(id, e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#f59e0b]"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a24] border-[#1e293b]">
            <CardHeader className="border-b border-[#1e293b]">
              <CardTitle className="text-white">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Order ID</span>
                <span className="text-white font-mono text-xs">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Payment ID</span>
                <span className="text-white font-mono text-xs">{order.paymentId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Stripe Session</span>
                <span className="text-white font-mono text-xs">{order.stripeSessionId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Created</span>
                <span className="text-white">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Updated</span>
                <span className="text-white">{new Date(order.updatedAt).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

async function updateOrderStatus(orderId: string, status: string) {
  try {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    window.location.reload()
  } catch (error) {
    console.error('Failed to update order:', error)
  }
}