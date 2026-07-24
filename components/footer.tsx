'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

const footerLinks = [
  {
    title: 'Products',
    items: [
      { label: 'Anxious Attachment', href: '#product' },
      { label: 'Avoidant Attachment', href: '#product' },
      { label: 'Secure Attachment', href: '#product' },
      { label: 'Bundle Deal', href: '#product' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Login', href: '/auth/login' },
      { label: 'Register', href: '/auth/register' },
      { label: 'My Orders', href: '/orders' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Refund', href: '/refund' },
      { label: 'Disclaimer', href: '/disclaimer' },
    ],
  },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setSubscribing(true)
    setError('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setSubscribed(true)
        setEmail('')
      } else {
        setError(data.error?.message || 'Already subscribed')
      }
    } catch {
      setError('Failed to subscribe')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <footer className="border-t border-border" style={{ background: '#08080d' }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <span className="text-xl font-bold text-white">Sincere</span>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Transforming relationships through evidence-based guides and compassionate support.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
              Stay Updated
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Get insights on attachment theory and relationship psychology.
            </p>
            {subscribed ? (
              <p className="text-sm text-green-500 font-medium">
                Thanks for subscribing!
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                  disabled={subscribing}
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="px-3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {subscribing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  Subscribe
                </button>
                {error && (
                  <p className="text-xs text-rose-400">{error}</p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Sincere.emotion. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a href="https://twitter.com/sincere_emotion" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Twitter
            </a>
            <a href="https://instagram.com/sincere_emotion" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Instagram
            </a>
            <a href="https://linkedin.com/company/sincere_emotion" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
