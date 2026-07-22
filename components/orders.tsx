'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Package, Mail } from 'lucide-react'

interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  items: OrderItem[]
  total: number
  email: string
  name: string
  status: string
  createdAt: string
}

const statusStyles: Record<string, string> = {
  PENDING: 'bg-gray-500/10 text-gray-400',
  PROCESSING: 'bg-amber-500/10 text-amber-400',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400',
  FAILED: 'bg-rose-500/10 text-rose-400',
  REFUNDED: 'bg-blue-500/10 text-blue-400',
  CANCELLED: 'bg-gray-500/10 text-gray-400',
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div key={i} className="border border-border rounded-xl p-6 animate-pulse" style={{ background: '#1a1a24' }}>
          <div className="flex justify-between mb-5 pb-5 border-b border-border">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-32" />
              <div className="h-3 bg-muted rounded w-24" />
            </div>
            <div className="h-6 bg-muted rounded-full w-20" />
          </div>
          <div className="space-y-2 mb-5">
            <div className="h-10 bg-muted rounded-lg" />
            <div className="h-10 bg-muted rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders')
        const data = await res.json()
        if (data.success) {
          setOrders(data.data.orders)
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ background: '#0a0a0f' }}>
      <div className="max-w-[900px] mx-auto px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Your Orders</h1>
        <p className="text-muted-foreground mb-10">View all your purchases and confirmations.</p>

        {loading ? (
          <LoadingSkeleton />
        ) : orders.length === 0 ? (
          <div className="border border-border rounded-xl p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No orders yet</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Start your healing journey by exploring our guides.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-border rounded-xl p-6"
                style={{ background: '#1a1a24' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 pb-5 border-b border-border">
                  <div>
                    <h3 className="text-base font-semibold text-white">{order.id}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={`mt-3 sm:mt-0 inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[order.status] || statusStyles.PENDING}`}
                  >
                    {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                  </span>
                </div>

                <div className="space-y-2 mb-5">
                  {order.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between items-center text-sm py-2 px-3 rounded-lg bg-background"
                    >
                      <div>
                        <span className="text-foreground font-medium">{item.name}</span>
                        <span className="text-muted-foreground ml-2">&times;{item.quantity}</span>
                      </div>
                      <span className="text-foreground font-medium">
                        ${((item.price * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-5 border-t border-border gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {order.email}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-0.5">Total</p>
                    <p className="text-lg font-bold text-white">${(order.total / 100).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
