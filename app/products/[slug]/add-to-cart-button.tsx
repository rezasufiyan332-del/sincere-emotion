'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Loader2, Zap } from 'lucide-react'
import { useCartStore, type CartProduct } from '@/lib/store/cart'
import { useUIStore } from '@/lib/store/ui'

interface Props {
  productId: string
  productName: string
  productSubtitle?: string
  productImage?: string
  price: number
  originalPrice: number
}

export function AddToCartButton({ productId, productName, productSubtitle, productImage, price, originalPrice }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const addToast = useUIStore((state) => state.addToast)

  const cartProduct: CartProduct = {
    id: productId,
    name: productName,
    price,
    originalPrice,
    image: productImage || '',
    subtitle: productSubtitle || '',
  }

  const handleBuyNow = () => {
    addItem(cartProduct, 1)
    router.push('/checkout')
  }

  const handleAddToCart = () => {
    addItem(cartProduct, 1)
    addToast('success', `${productName} added to cart!`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <button
        onClick={handleBuyNow}
        disabled={loading}
        className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#f59e0b] to-[#f97316] hover:from-[#d97706] hover:to-[#f59e0b] text-[#0a0a0f] font-bold text-lg rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 cursor-pointer"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Zap className="w-5 h-5" />
        )}
        Buy Now — ${price}
      </button>
      <button
        onClick={handleAddToCart}
        className="inline-flex items-center justify-center gap-2 px-6 py-4 border-2 border-[#f59e0b] text-[#f59e0b] font-semibold rounded-lg hover:bg-[#f59e0b]/10 transition-all duration-300 cursor-pointer"
      >
        <ShoppingCart className="w-5 h-5" />
        Add to Cart
      </button>
    </div>
  )
}
