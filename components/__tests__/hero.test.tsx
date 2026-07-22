import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from '../hero'

describe('Hero Component', () => {
  it('renders the main headline', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Understanding your attachment style is the first step to healing.'
    )
  })

  it('renders the subheadline', () => {
    render(<Hero />)
    expect(screen.getByText(/Practical, research-backed guides/)).toBeInTheDocument()
  })

  it('renders the evidence-based label', () => {
    render(<Hero />)
    expect(screen.getByText('Evidence-based relationship guides')).toBeInTheDocument()
  })

  it('renders "Browse Guides" CTA button', () => {
    render(<Hero />)
    expect(screen.getByRole('link', { name: /browse guides/i })).toBeInTheDocument()
  })

  it('renders "Learn More" button', () => {
    render(<Hero />)
    expect(screen.getByRole('link', { name: /learn more/i })).toBeInTheDocument()
  })

  it('has correct links to product section', () => {
    render(<Hero />)
    const browseGuides = screen.getByRole('link', { name: /browse guides/i })
    const learnMore = screen.getByRole('link', { name: /learn more/i })
    
    expect(browseGuides).toHaveAttribute('href', '#product')
    expect(learnMore).toHaveAttribute('href', '#product')
  })

  it('renders trust indicators', () => {
    render(<Hero />)
    expect(screen.getByText('30-day money-back guarantee')).toBeInTheDocument()
    expect(screen.getByText('Instant digital access')).toBeInTheDocument()
    expect(screen.getByText('Based on attachment theory')).toBeInTheDocument()
  })

  it('renders all three trust indicators', () => {
    render(<Hero />)
    const trustItems = screen.getAllByText(/guarantee|access|theory/)
    expect(trustItems).toHaveLength(3)
  })

  it('renders the scroll indicator', () => {
    render(<Hero />)
    const scrollIndicator = document.querySelector('.scroll-bounce')
    expect(scrollIndicator).toBeInTheDocument()
  })

  it('has proper section styling', () => {
    render(<Hero />)
    const section = document.querySelector('section')
    expect(section).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center')
  })

  it('renders CTA buttons with proper styling', () => {
    render(<Hero />)
    const browseGuides = screen.getByRole('link', { name: /browse guides/i })
    expect(browseGuides).toHaveClass('bg-[#f59e0b]', 'text-[#0a0a0f]')
  })

  it('renders secondary button with border styling', () => {
    render(<Hero />)
    const learnMore = screen.getByRole('link', { name: /learn more/i })
    expect(learnMore).toHaveClass('border', 'border-[#334155]')
  })
})