'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, ShoppingCart, BookOpen, Loader2 } from 'lucide-react'
import { useCartStore, type CartProduct } from '@/lib/store/cart'
import { useUIStore } from '@/lib/store/ui'
import { formatINR } from '@/lib/utils'
import { ProductsSkeleton } from '@/components/products-skeleton'
import { ProductsError } from '@/components/products-error'

interface ApiProduct {
  id: string
  title: string
  slug: string
  subtitle: string
  description: string
  price: number
  originalPrice: number | null
  coverImage: string | null
  tags: string[]
  isFeatured: boolean
  isActive: boolean
  isFree: boolean
}

interface DisplayProduct {
  id: string
  name: string
  slug: string
  subtitle: string
  description: string
  price: number
  originalPrice: number
  image: string
  benefits: string[]
  featured: boolean
  isFree: boolean
}

function paiseToRupees(paise: number): number {
  return paise / 100
}

function mapApiProduct(api: ApiProduct): DisplayProduct {
  return {
    id: api.id,
    name: api.title,
    slug: api.slug,
    subtitle: api.subtitle,
    description: api.description,
    price: paiseToRupees(api.price),
    originalPrice: paiseToRupees(api.originalPrice ?? api.price),
    image: api.coverImage || '/product-placeholder.png',
    benefits: Array.isArray(api.tags) ? api.tags : (api.tags ? (api.tags as string).split(' ') : []),
    featured: api.isFeatured,
    isFree: api.isFree,
  }
}

export function Products() {
  const [products, setProducts] = useState<DisplayProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingId, setAddingId] = useState<string | null>(null)

  const addItem = useCartStore((state) => state.addItem)
  const addToast = useUIStore((state) => state.addToast)
  const toggleCart = useUIStore((state) => state.toggleCart)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/products?limit=10')
      const json = await res.json()
      if (!json.success) {
        throw new Error(json.error?.message || 'Failed to load products')
      }
      const mapped = (json.data.products as ApiProduct[])
        .filter((p) => p.isActive)
        .map(mapApiProduct)
      setProducts(mapped)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleAddToCart = async (product: DisplayProduct) => {
    if (addingId) return // Prevent double-click
    setAddingId(product.id)
    
    if (product.isFree) {
      try {
        const res = await fetch('/api/library/add-free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        })
        const data = await res.json()
        if (data.success) {
          addToast('success', data.message || 'Added to your library!')
          if (data.redirectUrl) {
            setTimeout(() => { window.location.href = data.redirectUrl }, 1000)
          }
        } else {
          addToast('error', data.error?.message || 'Failed to add free book')
        }
      } catch {
        addToast('error', 'Failed to add free book')
      } finally {
        setAddingId(null)
      }
      return
    }

    const cartProduct: CartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      subtitle: product.subtitle,
    }
    addItem(cartProduct, 1)
    addToast('success', `${product.name} added to cart!`)
    setTimeout(() => toggleCart(), 300)
    setAddingId(null)
  }

  const cardBaseClass = "rounded-xl p-8 flex flex-col h-full transition-colors duration-250 relative hover:border-amber-500/30 bg-[#1a1a24] border border-[#1e293b]"

  if (loading) {
    return <ProductsSkeleton />
  }
  if (error) {
    return <ProductsError onRetry={fetchProducts} />
  }

  const regularProducts = products.filter((p) => !p.featured)
  const featuredProduct = products.find((p) => p.featured)

  return (
    <section
      id="product"
      className="py-24 px-4 sm:px-6 lg:px-8"
      style={{ background: 'linear-gradient(180deg, #0f0f18 0%, #0a0a0f 100%)' }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-medium uppercase tracking-widest text-[#f59e0b] mb-4">
            Our Guides
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#f8fafc] mb-4">
            Healing starts with understanding
          </h2>
          <p className="text-lg text-[#64748b] max-w-[500px] mx-auto">
            Transformative digital guides to help you understand your attachment patterns and build secure relationships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {regularProducts.map((product, idx) => (
            <div
              key={product.id}
              className={cardBaseClass}
            >
              {product.isFree && (
                <div className="absolute top-4 left-4 bg-emerald-500 text-black px-3 py-1 rounded-full text-xs font-bold uppercase">
                  FREE
                </div>
              )}
              {product.image && (
                <div className="relative w-full aspect-[4/3] mb-6 rounded-lg overflow-hidden bg-[#22222e]">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="text-lg font-semibold text-[#f8fafc] mb-1">{product.name}</h3>
              <p className="text-sm text-[#f59e0b]/80 mb-3">{product.subtitle}</p>
              <p className="text-sm text-[#64748b] mb-5 line-clamp-2">{product.description}</p>
              <div className="space-y-2.5 mb-6 flex-grow">
                {product.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#cbd5e1]">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="w-full h-px bg-[#1e293b] mb-6" />
              <div className="mb-5">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-bold text-[#f8fafc]">{formatINR(product.price)}</span>
                  {product.originalPrice > product.price && !product.isFree && (
                    <span className="text-sm text-[#64748b] line-through">{formatINR(product.originalPrice)}</span>
                  )}
                </div>
                {product.originalPrice > product.price && !product.isFree && (
                  <p className="text-xs text-emerald-500 mt-1">
                    Save {formatINR(product.originalPrice - product.price)}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleAddToCart(product)}
                disabled={addingId === product.id}
                className={`w-full py-3 font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  product.isFree
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-black'
                    : 'bg-[#f59e0b] hover:bg-[#d97706] text-[#0a0a0f]'
                }`}
              >
                {addingId === product.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : product.isFree ? (
                  <>
                    <BookOpen className="w-5 h-5" />
                    Read Free
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>
              <p className="text-xs text-[#64748b] text-center mt-3">
                {product.isFree ? 'Instant access · No payment needed' : 'Instant access · 30-day guarantee'}
              </p>
            </div>
          ))}
        </div>

        {featuredProduct && (
          <div
            className="relative rounded-xl p-8 transition-colors duration-250 hover:border-amber-500/30 bg-[#1a1a24] border border-[#1e293b]"
          >
            {featuredProduct.isFree && (
              <div className="absolute top-4 left-4 bg-emerald-500 text-black px-3 py-1 rounded-full text-xs font-bold uppercase">
                FREE
              </div>
            )}
            {!featuredProduct.isFree && (
              <div className="absolute top-4 left-4 bg-[#f59e0b] text-[#0a0a0f] px-3 py-1 rounded-full text-xs font-bold uppercase">
                Best Value
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mt-4">
              <div>
                <h3 className="text-2xl font-bold text-[#f8fafc] mb-2">{featuredProduct.name}</h3>
                <p className="text-sm text-[#f59e0b]/80 mb-4">{featuredProduct.subtitle}</p>
                <p className="text-base text-[#cbd5e1] mb-6">{featuredProduct.description}</p>
                <div className="space-y-2.5 mb-8">
                  {featuredProduct.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#cbd5e1]">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2.5 mb-1">
                    <span className="text-3xl font-bold text-[#f8fafc]">{formatINR(featuredProduct.price)}</span>
                    {featuredProduct.originalPrice > featuredProduct.price && !featuredProduct.isFree && (
                      <span className="text-lg text-[#64748b] line-through">{formatINR(featuredProduct.originalPrice)}</span>
                    )}
                  </div>
                  {featuredProduct.originalPrice > featuredProduct.price && !featuredProduct.isFree && (
                    <p className="text-sm text-emerald-500 font-medium">
                      Save {formatINR(featuredProduct.originalPrice - featuredProduct.price)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(featuredProduct)}
                  className={`w-full py-3 font-semibold rounded-lg transition-colors duration-200 ${
                    featuredProduct.isFree
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-black'
                      : 'bg-[#f59e0b] hover:bg-[#d97706] text-[#0a0a0f]'
                  }`}
                >
                  {featuredProduct.isFree ? 'Get Free Access' : 'Get Complete Bundle'}
                </button>
                <p className="text-xs text-[#64748b] text-center mt-3">
                  {featuredProduct.isFree ? 'Instant access · No payment needed' : 'Instant access · 30-day guarantee · Lifetime updates'}
                </p>
              </div>
              {featuredProduct.image && (
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#22222e]">
                  <img src={featuredProduct.image} alt={featuredProduct.name} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="text-[#cbd5e1] mb-6">Not sure which guide is right for you?</p>
          <button className="px-8 py-3 border border-[#64748b] text-[#f8fafc] font-semibold rounded-lg hover:border-[#f59e0b] hover:text-[#f59e0b] transition-colors duration-200">
            Take the Attachment Quiz
          </button>
        </div>
      </div>
</section>
    )
}