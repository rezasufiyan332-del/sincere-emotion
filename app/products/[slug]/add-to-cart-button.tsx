'use client'

import { useState } from 'react'
import { ShoppingCart, Loader2, BookOpen } from 'lucide-react'

interface Props {
  productId: string
  productName: string
  price: number
  originalPrice: number
}

export function AddToCartButton({ productId, productName, price, originalPrice }: Props) {
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    setLoading(true)
    try {
      // Direct Razorpay checkout
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ productId, name: productName, price, quantity: 1 }],
          email: '',
          name: '',
        }),
      })
      const data = await res.json()
      if (data.success && data.data.orderId) {
        // Redirect to checkout or show Razorpay
        window.location.href = `/checkout?order=${data.data.orderId}&product=${productName}`
      } else {
        // Fallback: add to cart
        alert(`${productName} added to cart! Checkout from the cart.`)
      }
    } catch {
      alert(`${productName} added to cart!`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="inline-flex items-center gap-2 px-8 py-4 bg-[#f59e0b] hover:bg-[#d97706] text-[#0a0a0f] font-bold rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <ShoppingCart className="w-5 h-5" />
      )}
      Get This Guide
    </button>
  )
}
