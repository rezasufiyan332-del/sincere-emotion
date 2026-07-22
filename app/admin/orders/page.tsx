'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface Order {
  id: string
  total: number
  status: string
  email: string
  name: string
  createdAt: string
  user?: { id: string; name: string | null; email: string } | null
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface OrdersResponse {
  orders: Order[]
  meta: PaginationMeta
}

const statusStyles: Record<string, string> = {
  PENDING: 'bg-[#f59e0b]/20 text-[#f59e0b]',
  PROCESSING: 'bg-[#f59e0b]/20 text-[#f59e0b]',
  COMPLETED: 'bg-[#10b981]/20 text-[#10b981]',
  FAILED: 'bg-[#f43f5e]/20 text-[#f43f5e]',
  REFUNDED: 'bg-[#3b82f6]/20 text-[#3b82f6]',
  CANCELLED: 'bg-[#64748b]/20 text-[#64748b]',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter && { status: statusFilter }),
      })
      const res = await fetch(`/api/admin/orders?${params}`)
      const data = await res.json()
      if (data.success) {
        setOrders(data.data.orders)
        setMeta(data.data.meta)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, statusFilter])

  // Debounce search
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(value)
      fetchOrders(1)
    }, 300)
  }

  const handleStatusChange = (status: string) => {
    setStatusFilter(status)
    fetchOrders(1)
  }

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          <p className="text-[#64748b]">Manage and track customer orders</p>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="bg-[#1a1a24] border-[#1e293b]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-[#0a0a0f] border-[#1e293b]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#64748b]" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="bg-[#0a0a0f] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f59e0b]"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-[#1a1a24] border-[#1e293b] overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-[#f59e0b] border-t-transparent rounded-full mx-auto" />
              <p className="mt-4 text-[#64748b]">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[#64748b] mb-4">No orders found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1e293b] bg-[#0a0a0f]">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden md:table-cell">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden lg:table-cell">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#0a0a0f] transition-colors">
                        <td className="px-6 py-4">
                          <Link href={`/admin/orders/${order.id}`} className="text-white font-medium hover:text-[#f59e0b] transition-colors">
                            {order.id.slice(0, 20)}...
                          </Link>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div>
                            <p className="text-white font-medium">{order.name}</p>
                            <p className="text-sm text-[#64748b]">{order.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="default" className={statusStyles[order.status] || ''}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <p className="text-white font-medium">${(order.total / 100).toFixed(2)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-[#64748b]">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-[#1e293b] flex items-center justify-between">
                  <p className="text-sm text-[#64748b]">
                    Page {meta.page} of {meta.totalPages} ({meta.total} total)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fetchOrders(meta.page - 1)}
                      disabled={meta.page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fetchOrders(meta.page + 1)}
                      disabled={meta.page === meta.totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}