'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle, Package, Mail, ArrowLeft } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'

interface OrderData {
  id: string
  email: string
  name: string
  total: number
  status: string
  items: Array<{ name: string; price: number; quantity: number }>
  createdAt: string
}

function formatINR(rupees: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees)
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setError('No order ID found')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/orders/${orderId}`)
        const data = await res.json()

        if (!data.success || data.error) {
          throw new Error(data.error?.message || 'Order not found')
        }

        setOrder(data.data)
        clearCart()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, clearCart])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Verifying your order...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Order Not Found</h1>
          <p className="text-muted-foreground">
            {error || "We couldn't find an order for this ID. Your payment may still be processing."}
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Link
              href="/checkout/cancel"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get Help
            </Link>
            <Link
              href="/"
              className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 max-w-3xl mx-auto px-4 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Thank You for Your Order!</h1>
        <p className="text-muted-foreground">
          Your payment has been confirmed. A confirmation email has been sent to{' '}
          <span className="text-foreground font-medium">{order.email}</span>
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>
          <span className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</span>
        </div>

        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="font-medium text-foreground">
                {formatINR(item.price)}
              </span>
            </div>
          ))}

          <div className="border-t border-border pt-3 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span>Confirmation sent to {order.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Package className="w-4 h-4" />
            <span>Order placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/library"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Package className="w-4 h-4" />
          Go to Library
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Need help?{' '}
        <a href="mailto:support@sincereemotion.com" className="text-primary hover:underline">
          Contact Support
        </a>
      </p>
    </div>
  )
}