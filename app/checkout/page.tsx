'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Trash2, Shield, CreditCard, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'

function formatUSD(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(cents / 100)
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { items, removeItem, clearCart, getTotal, getSavings } = useCartStore()

  // If coming from "Buy Now" with orderId in URL, we'll use those items
  const cartItems = items
  const total = getTotal()

  // If cart is empty and no order param, redirect to products
  useEffect(() => {
    if (cartItems.length === 0 && !orderId) {
      // Don't redirect immediately - let them see the empty state
    }
  }, [cartItems, orderId])

  const handleCheckout = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const checkoutItems = cartItems.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }))

      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          email,
          name: name || email.split('@')[0],
        }),
      })

      const data = await res.json()

      if (data.success && data.data.orderId) {
        // Open Razorpay checkout modal
        const options = {
          key: data.data.keyId,
          amount: data.data.amount,
          currency: data.data.currency || 'INR',
          name: 'Sincere Emotion',
          description: `${cartItems.length} guide(s) - Instant Access`,
          order_id: data.data.orderId,
          handler: function (response: any) {
            // Payment success
            clearCart()
            window.location.href = `/checkout/success?order_id=${response.razorpay_order_id}&payment_id=${response.razorpay_payment_id}`
          },
          prefill: {
            name: name || '',
            email: email || '',
          },
          theme: {
            color: '#f59e0b',
          },
          modal: {
            ondismiss: function () {
              setLoading(false)
            },
          },
        }

        // @ts-ignore
        if (typeof window !== 'undefined' && window.Razorpay) {
          // @ts-ignore
          const rzp = new window.Razorpay(options)
          rzp.open()
        } else {
          // Razorpay SDK not loaded - fallback
          setError('Payment system is loading. Please try again in a moment.')
          setLoading(false)
        }
      } else {
        setError(data.error?.message || 'Failed to create order. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Razorpay SDK */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-[#64748b] hover:text-[#f8fafc] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Order Summary */}
          <div>
            <h1 className="text-3xl font-bold text-[#f8fafc] mb-6">Checkout</h1>

            {cartItems.length === 0 ? (
              <div className="bg-[#1a1a24] border border-[#1e293b] rounded-xl p-8 text-center">
                <ShoppingCart className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
                <p className="text-[#64748b] mb-4">Your cart is empty</p>
                <Link href="/" className="text-[#f59e0b] hover:underline font-semibold">
                  Browse Guides
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="bg-[#1a1a24] border border-[#1e293b] rounded-xl p-4 flex items-center gap-4">
                    <div className="w-16 h-20 bg-[#22222e] rounded-lg flex-shrink-0 overflow-hidden">
                      {item.product.image && (
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-[#f8fafc] font-semibold truncate">{item.product.name}</h3>
                      <p className="text-[#64748b] text-sm">{item.product.subtitle}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[#f59e0b] font-bold">{formatUSD(item.product.price)}</span>
                        {item.product.originalPrice > item.product.price && (
                          <span className="text-[#64748b] line-through text-sm">{formatUSD(item.product.originalPrice)}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-[#64748b] hover:text-red-400 transition-colors p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {cartItems.length > 0 && (
              <div className="bg-[#1a1a24] border border-[#1e293b] rounded-xl p-6 mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-[#64748b]">Subtotal</span>
                  <span className="text-[#f8fafc]">{formatUSD(total)}</span>
                </div>
                {getSavings() > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-emerald-500">You save</span>
                    <span className="text-emerald-500">-{formatUSD(getSavings())}</span>
                  </div>
                )}
                <div className="h-px bg-[#1e293b] my-3" />
                <div className="flex justify-between">
                  <span className="text-[#f8fafc] font-bold text-lg">Total</span>
                  <span className="text-[#f59e0b] font-bold text-lg">{formatUSD(total)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Payment Form */}
          <div>
            <div className="bg-[#1a1a24] border border-[#1e293b] rounded-xl p-8">
              <h2 className="text-xl font-bold text-[#f8fafc] mb-6">Payment Details</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-[#64748b] mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-[#0f0f18] border border-[#1e293b] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:border-[#f59e0b] focus:outline-none transition-colors"
                  />
                  <p className="text-xs text-[#64748b] mt-1">Your guides will be sent to this email</p>
                </div>
                <div>
                  <label className="block text-sm text-[#64748b] mb-2">Name (optional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 bg-[#0f0f18] border border-[#1e293b] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:border-[#f59e0b] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading || cartItems.length === 0}
                className="w-full py-4 bg-gradient-to-r from-[#f59e0b] to-[#f97316] hover:from-[#d97706] hover:to-[#f59e0b] text-[#0a0a0f] font-bold text-lg rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
                {loading ? 'Processing...' : `Pay ${formatUSD(total)}`}
              </button>

              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-[#64748b]">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Instant Access</span>
                <span className="flex items-center gap-1">30-Day Guarantee</span>
              </div>
            </div>

            {/* Trust Section */}
            <div className="mt-6 bg-[#1a1a24] border border-[#1e293b] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-3">What happens after payment?</h3>
              <ul className="space-y-2 text-sm text-[#64748b]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  Instant access to your guides
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  PDF download available immediately
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  Read on any device
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  30-day money-back guarantee
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
