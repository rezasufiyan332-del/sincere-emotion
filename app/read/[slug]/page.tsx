'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, BookOpen } from 'lucide-react'
import { BookReader } from '@/components/reader/BookReader'

interface BookData {
  title: string
  slug: string
  pdfUrl: string | null
  format: string
  isFree: boolean
}

export default function ReadPage() {
  const params = useParams()
  const slug = params.slug as string
  const [book, setBook] = useState<BookData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(`/api/products?slug=${slug}`)
        const data = await res.json()

        if (data.success && data.data.products.length > 0) {
          setBook(data.data.products[0])
        } else {
          setError('Book not found')
        }
      } catch (err) {
        setError('Failed to load book')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchBook()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#f59e0b] animate-spin" />
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-[#64748b] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Book Not Found</h1>
          <p className="text-[#64748b] mb-6">{error || 'This book could not be loaded'}</p>
          <a
            href="/library"
            className="px-6 py-2 bg-[#f59e0b] text-black rounded-lg hover:bg-[#d97706]"
          >
            Back to Library
          </a>
        </div>
      </div>
    )
  }

  if (!book.pdfUrl) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-[#64748b] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Content Not Available</h1>
          <p className="text-[#64748b] mb-6">This book's content is not yet available</p>
          <a
            href="/library"
            className="px-6 py-2 bg-[#f59e0b] text-black rounded-lg hover:bg-[#d97706]"
          >
            Back to Library
          </a>
        </div>
      </div>
    )
  }

  return <BookReader pdfUrl={book.pdfUrl} title={book.title} />
}