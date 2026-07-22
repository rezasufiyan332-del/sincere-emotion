'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import { useCartStore, type CartProduct } from '@/lib/store/cart'
import { useUIStore } from '@/lib/store/ui'
import { ProductsSkeleton } from '@/components/products-skeleton'
import { ProductsError } from '@/components/products-error'

interface ApiProduct {
  id: string
  name: string
  slug: string
  subtitle: string
  description: string
  price: number
  originalPrice: number | null
  image: string | null
  features: string[]
  bestseller: boolean
  featured: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

interface DisplayProduct {
  id: string
  name: string
  subtitle: string
  description: string
  price: number
  originalPrice: number
  image: string
  benefits: string[]
  bestseller: boolean
  featured: boolean
}

function centsToDollars(cents: number): number {
  return cents / 100
}

function formatDollars(dollars: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars)
}

function mapApiProduct(api: ApiProduct): DisplayProduct {
  return {
    id: api.id,
    name: api.name,
    subtitle: api.subtitle,
    description: api.description,
    price: centsToDollars(api.price),
    originalPrice: centsToDollars(api.originalPrice ?? api.price),
    image: api.image || '/product-placeholder.png',
    benefits: api.features,
    bestseller: api.bestseller,
    featured: api.featured,
  }
}

export function Products() {
  const [products, setProducts] = useState<DisplayProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        .filter((p) => p.active)
        .map(mapApiProduct)
      setProducts(mapped)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  // PERFORMANCE FIX: Use existing fetchProducts callback, no duplicate logic
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleAddToCart = (product: DisplayProduct) => {
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
  }

  if (loading) return <ProductsSkeleton />
  if (error) return <ProductsError onRetry={fetchProducts} />

  const regularProducts = products.filter((p) => !p.featured)
  const featuredProduct = products.find((p) => p.featured)

  const cardStyle = {
    backgroundColor: '#1a1a24',
    border: '1px solid #1e293b',
    borderRadius: '0.75rem',
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)'
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.borderColor = '#1e293b'
  }

  return (
    <section
      id="product"
      className="py-24 px-4 sm:px-6 lg:px-8"
      style={{ background: 'linear-gradient(180deg, #0f0f18 0%, #0a0a0f 100%)' }}
    >
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-[#f59e0b] mb-4">
            Our Guides
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#f8fafc] mb-4">
            Healing starts with understanding
          </h2>
          <p className="text-lg text-[#64748b] max-w-[500px] mx-auto">
            Evidence-based guides to help you understand your attachment patterns and build secure relationships.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {regularProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-xl p-8 flex flex-col h-full transition-colors duration-250"
              style={cardStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {product.image && (
                <div className="relative w-full aspect-[4/3] mb-6 rounded-lg overflow-hidden bg-[#22222e]">
                  <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 380px" />
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
                  <span className="text-2xl font-bold text-[#f8fafc]">{formatDollars(product.price)}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-[#64748b] line-through">{formatDollars(product.originalPrice)}</span>
                  )}
                </div>
                {product.originalPrice > product.price && (
                  <p className="text-xs text-emerald-500 mt-1">
                    Save {formatDollars(product.originalPrice - product.price)}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleAddToCart(product)}
                className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-[#0a0a0f] font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <p className="text-xs text-[#64748b] text-center mt-3">Instant access · 30-day guarantee</p>
            </motion.div>
          ))}
        </div>

        {featuredProduct && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative rounded-xl p-8 transition-colors duration-250"
            style={cardStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="absolute top-4 left-4 bg-[#f59e0b] text-[#0a0a0f] px-3 py-1 rounded-full text-xs font-bold uppercase">
              Best Value
            </div>
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
                    <span className="text-3xl font-bold text-[#f8fafc]">{formatDollars(featuredProduct.price)}</span>
                    {featuredProduct.originalPrice > featuredProduct.price && (
                      <span className="text-lg text-[#64748b] line-through">{formatDollars(featuredProduct.originalPrice)}</span>
                    )}
                  </div>
                  {featuredProduct.originalPrice > featuredProduct.price && (
                    <p className="text-sm text-emerald-500 font-medium">
                      Save {formatDollars(featuredProduct.originalPrice - featuredProduct.price)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(featuredProduct)}
                  className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-[#0a0a0f] font-semibold rounded-lg transition-colors duration-200"
                >
                  Get Complete Bundle
                </button>
                <p className="text-xs text-[#64748b] text-center mt-3">
                  Instant access · 30-day guarantee · Lifetime updates
                </p>
              </div>
              {featuredProduct.image && (
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#22222e]">
                  <Image src={featuredProduct.image} alt={featuredProduct.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-[#cbd5e1] mb-6">Not sure which guide is right for you?</p>
          <button className="px-8 py-3 border border-[#64748b] text-[#f8fafc] font-semibold rounded-lg hover:border-[#f59e0b] hover:text-[#f59e0b] transition-colors duration-200">
            Take the Attachment Quiz
          </button>
        </motion.div>
      </div>
    </section>
  )
}
