import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ScrollProgress } from '@/components/scroll-progress'
import { ClientProviders } from '@/components/client-providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Sincere.emotion - Attachment & Relationship Guides',
  description: 'Discover evidence-based guides to understand your attachment style, heal from past patterns, and build authentic relationships you deserve.',
  metadataBase: new URL('https://sincere.emotion'),
  openGraph: {
    title: 'Sincere.emotion - Attachment & Relationship Guides',
    description: 'Evidence-based guides to understand your attachment style, heal from past patterns, and build the secure relationships you deserve.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sincere.emotion - Attachment & Relationship Guides',
    description: 'Evidence-based guides to understand your attachment style, heal from past patterns, and build the secure relationships you deserve.',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fef8f5' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} bg-background`}>
      <body className="antialiased bg-background text-foreground font-sans">
        <ScrollProgress />
        <ClientProviders />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
