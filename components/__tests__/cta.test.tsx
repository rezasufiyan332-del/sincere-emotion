import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CTA } from '../cta'

describe('CTA Component', () => {
  it('renders the main heading', () => {
    render(<CTA />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Start your healing journey today'
    )
  })

  it('renders the description text', () => {
    render(<CTA />)
    expect(screen.getByText(/Evidence-based guides created by relationship experts/)).toBeInTheDocument()
  })

  it('renders "Browse Guides" CTA button', () => {
    render(<CTA />)
    expect(screen.getByRole('link', { name: /browse guides/i })).toBeInTheDocument()
  })

  it('renders "View Bundle" button', () => {
    render(<CTA />)
    expect(screen.getByRole('link', { name: /view bundle/i })).toBeInTheDocument()
  })

  it('has correct links to product section', () => {
    render(<CTA />)
    const browseGuides = screen.getByRole('link', { name: /browse guides/i })
    const viewBundle = screen.getByRole('link', { name: /view bundle/i })
    
    expect(browseGuides).toHaveAttribute('href', '#product')
    expect(viewBundle).toHaveAttribute('href', '#product')
  })

  it('renders trust indicators', () => {
    render(<CTA />)
    expect(screen.getByText('30-day guarantee')).toBeInTheDocument()
    expect(screen.getByText('Instant access')).toBeInTheDocument()
    expect(screen.getByText('Lifetime updates')).toBeInTheDocument()
  })

  it('renders all three trust indicators', () => {
    render(<CTA />)
    const trustItems = screen.getAllByText(/guarantee|access|updates/)
    expect(trustItems).toHaveLength(3)
  })

  it('has proper section styling', () => {
    render(<CTA />)
    const section = document.querySelector('section')
    expect(section).toHaveClass('py-24', 'px-4', 'sm:px-6', 'lg:px-8')
  })

  it('renders with proper background styling', () => {
    render(<CTA />)
    const section = document.querySelector('section')
    expect(section).toHaveStyle({ background: '#0a0a0f' })
  })

  it('renders CTA buttons with proper styling', () => {
    render(<CTA />)
    const browseGuides = screen.getByRole('link', { name: /browse guides/i })
    expect(browseGuides).toHaveClass('bg-primary', 'text-primary-foreground')
  })

  it('renders secondary button with border styling', () => {
    render(<CTA />)
    const viewBundle = screen.getByRole('link', { name: /view bundle/i })
    expect(viewBundle).toHaveClass('border', 'border-border')
  })

  it('renders trust indicators with icons', () => {
    render(<CTA />)
    // Check for lucide icons (they render as SVGs)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(3) // At least 3 icons for trust indicators
  })

  it('has responsive layout', () => {
    render(<CTA />)
    const container = document.querySelector('.max-w-\\[800px\\]')
    expect(container).toBeInTheDocument()
  })

  it('renders CTA buttons in a flex container', () => {
    render(<CTA />)
    const buttonContainer = document.querySelector('.flex.flex-col.sm\\:flex-row.gap-4')
    expect(buttonContainer).toBeInTheDocument()
  })
})