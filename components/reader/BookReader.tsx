'use client'

import { useState, useEffect } from 'react'
import DOMPurify from 'dompurify'
import { Loader2, ChevronLeft, ZoomIn, ZoomOut, BookOpen } from 'lucide-react'

interface BookReaderProps {
  pdfUrl: string
  title: string
}

export function BookReader({ pdfUrl, title }: BookReaderProps) {
  const [scale, setScale] = useState(1.2)

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-[#12121a] border-b border-[#1e293b] z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/library" className="text-[#64748b] hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </a>
            <h1 className="text-sm font-medium text-white truncate max-w-xs">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
              className="p-2 text-[#64748b] hover:text-white rounded"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#64748b]">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale(s => Math.min(2, s + 0.2))}
              className="p-2 text-[#64748b] hover:text-white rounded"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div
            className="bg-white rounded-lg shadow-2xl p-8 md:p-12"
            style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
          >
            <BookContent url={pdfUrl} />
          </div>
        </div>
      </div>

      {/* Bottom bar - no pagination (was non-functional) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#12121a] border-t border-[#1e293b]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center">
          <span className="text-sm text-[#64748b] flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Reading: {title}
          </span>
        </div>
      </div>
    </div>
  )
}

function BookContent({ url }: { url: string }) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadContent() {
      try {
        const res = await fetch(url)
        const text = await res.text()
        // Convert markdown to simple HTML
        const html = markdownToHtml(text)
        // SECURITY: Sanitize HTML to prevent XSS
        setContent(DOMPurify.sanitize(html, {
          ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'p', 'br', 'hr', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'a', 'span', 'div', 'blockquote'],
          ALLOWED_ATTR: ['class', 'href', 'target', 'rel'],
          ALLOW_DATA_ATTR: false,
        }))
      } catch (err) {
        setContent('<p class="text-red-500">Failed to load book content</p>')
      } finally {
        setLoading(false)
      }
    }
    loadContent()
  }, [url])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#f59e0b] animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="prose prose-lg max-w-none text-gray-800"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

function markdownToHtml(markdown: string): string {
  return markdown
    .split('\n')
    .map(line => {
      // Headers
      if (line.startsWith('### ')) return `<h3 class="text-xl font-bold mt-8 mb-4">${line.slice(4)}</h3>`
      if (line.startsWith('## ')) return `<h2 class="text-2xl font-bold mt-10 mb-4">${line.slice(3)}</h2>`
      if (line.startsWith('# ')) return `<h1 class="text-3xl font-bold mt-12 mb-6">${line.slice(2)}</h1>`

      // Horizontal rule
      if (line.startsWith('---')) return '<hr class="my-8 border-gray-200" />'

      // Empty lines
      if (line.trim() === '') return '<br />'

      // Bold
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

      // Italic
      line = line.replace(/\*(.*?)\*/g, '<em>$1</em>')

      // Code
      line = line.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>')

      // Links
      line = line.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')

      // Regular paragraphs
      return `<p class="mb-4 leading-relaxed">${line}</p>`
    })
    .join('\n')
}