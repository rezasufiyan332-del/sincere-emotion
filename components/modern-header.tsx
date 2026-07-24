'use client'

import { useState, useEffect } from 'react'
import { Menu, X, ShoppingCart, LogOut, User, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { useUIStore } from '@/lib/store/ui'
import { CartBadge } from './cart-badge'

const NAV_ITEMS = [
  { label: 'Product', href: '#product' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
] as const

export function ModernHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null)
  const [mounted, setMounted] = useState(false)
  const itemCount = useCartStore((state) => state.getItemCount())
  const toggleCart = useUIStore((state) => state.toggleCart)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    async function checkAuth() {
      try {
        // SECURITY FIX: Use only httpOnly cookie — no localStorage/Bearer tokens
        // The httpOnly cookie is automatically sent with same-origin requests
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success) {
          setUser(data.data)
        }
      } catch {
        setUser(null)
      }
    }
    checkAuth()
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0a0a0f]/90 border-b border-[#1e293b]'
          : 'bg-[#0a0a0f]/60 border-b border-transparent'
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-0.5 text-lg font-semibold tracking-tight text-[#f8fafc] hover:opacity-80 transition-opacity"
          >
            Sincere<span className="text-[#f59e0b]">.</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative text-sm font-medium text-[#94a3b8] hover:text-[#f8fafc] transition-colors duration-200 py-1 group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 h-px w-0 bg-[#f59e0b] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <Link
              href="/orders"
              className="hidden md:block text-sm font-medium text-[#94a3b8] hover:text-[#f8fafc] transition-colors duration-200"
            >
              Orders
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-sm text-[#94a3b8]">
                  <User className="w-4 h-4" />
                  {user.name || user.email}
                </span>
                <Link
                  href="/library"
                  className="flex items-center gap-1.5 text-sm font-medium text-[#94a3b8] hover:text-[#f59e0b] transition-colors duration-200"
                >
                  <BookOpen className="w-4 h-4" />
                  My Library
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-[#94a3b8] hover:text-[#f59e0b] transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-[#94a3b8] hover:text-[#f8fafc] transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-medium px-3 py-1.5 rounded-lg bg-[#f59e0b] text-[#0a0a0f] hover:bg-[#d97706] transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
            )}

            <button
              onClick={toggleCart}
              className="relative p-1.5 text-[#94a3b8] hover:text-[#f8fafc] transition-colors duration-200"
              aria-label={mounted ? `Shopping cart, ${itemCount} items` : 'Shopping cart'}
            >
              <ShoppingCart className="w-5 h-5" />
              {mounted && <CartBadge />}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-[#94a3b8] hover:text-[#f8fafc] transition-colors duration-200"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="border-t border-[#1e293b] bg-[#0a0a0f]/95 px-6 py-4 space-y-1" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1a1a24] rounded-lg transition-colors duration-200"
            >
              {item.label}
            </a>
          ))}
          {user && (
            <a
              href="/library"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1a1a24] rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              My Library
            </a>
          )}
          <a
            href="/orders"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2.5 text-sm font-medium text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1a1a24] rounded-lg transition-colors duration-200"
          >
            Orders
          </a>
          <div className="border-t border-[#1e293b] mt-2 pt-2">
            {user ? (
              <>
                <span className="block px-3 py-2 text-sm text-[#94a3b8]">
                  Signed in as {user.name || user.email}
                </span>
                <Link
                  href="/library"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-[#f59e0b] hover:bg-[#1a1a24] rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  My Library
                </Link>
                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false) }}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#f59e0b] hover:bg-[#1a1a24] rounded-lg transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1a1a24] rounded-lg transition-colors duration-200"
                >
                  Login
                </a>
                <a
                  href="/auth/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-[#f59e0b] hover:bg-[#1a1a24] rounded-lg transition-colors duration-200"
                >
                  Register
                </a>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
