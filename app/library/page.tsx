'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Loader2, BookOpen, ShoppingCart, Clock, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface LibraryItem {
  id: string
  title: string
  slug: string
  coverImage: string | null
  price: number
  acquiredAt: string
  source: string
}

export default function LibraryPage() {
  const [library, setLibrary] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLibrary()
  }, [])

  async function fetchLibrary() {
    try {
      const res = await fetch('/api/library')
      const data = await res.json()
      if (data.success) {
        setLibrary(data.data)
      } else {
        setError(data.error?.message || 'Failed to load library')
      }
    } catch (err) {
      setError('Failed to load library. Please login first.')
    } finally {
      setLoading(false)
    }
  }

  function formatINR(paise: number): string {
    if (paise === 0) return 'FREE'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(paise / 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#f59e0b] animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#64748b] mb-4">{error}</p>
          <Link
            href="/auth/login"
            className="px-6 py-2 bg-[#f59e0b] text-black rounded-lg hover:bg-[#d97706]"
          >
            Login to View Library
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Library</h1>
          <p className="text-[#64748b]">Your purchased digital guides</p>
        </div>

        {library.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-[#64748b] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No books yet</h2>
            <p className="text-[#64748b] mb-6">Start building your library by purchasing guides</p>
            <Link
              href="/#product"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#f59e0b] text-black rounded-lg hover:bg-[#d97706] font-semibold"
            >
              <ShoppingCart className="w-5 h-5" />
              Browse Guides
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {library.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#1a1a24] border border-[#1e293b] rounded-xl overflow-hidden hover:border-[#f59e0b]/30 transition-colors"
              >
                <div className="relative h-48 bg-[#22222e]">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-[#64748b]" />
                    </div>
                  )}
                  {item.price === 0 && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                      FREE
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-[#64748b] mb-4">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {item.source === 'PURCHASED' ? 'Purchased' : 'Free Access'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(item.acquiredAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    href={`/read/${item.slug}`}
                    className="block w-full py-2 bg-[#f59e0b] text-black text-center rounded-lg font-semibold hover:bg-[#d97706] transition-colors"
                  >
                    Read Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}