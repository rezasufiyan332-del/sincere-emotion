import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductsSkeleton } from '../products-skeleton'

describe('ProductsSkeleton Component', () => {
  it('renders the skeleton section', () => {
    render(<ProductsSkeleton />)
    const section = document.querySelector('section')
    expect(section).toBeInTheDocument()
  })

  it('renders skeleton items for product cards', () => {
    render(<ProductsSkeleton />)
    const productCards = document.querySelectorAll('.bg-\\[\\#1a1a24\\].border.border-\\[\\#1e293b\\].rounded-lg.p-6')
    expect(productCards).toHaveLength(3)
  })

  it('has loading animation on skeleton elements', () => {
    render(<ProductsSkeleton />)
    const animatedElements = document.querySelectorAll('.animate-pulse')
    expect(animatedElements.length).toBeGreaterThan(0)
  })

  it('renders header skeleton', () => {
    render(<ProductsSkeleton />)
    const headerSkeletons = document.querySelectorAll('.bg-\\[\\#1a1a24\\].rounded.mx-auto')
    expect(headerSkeletons.length).toBeGreaterThanOrEqual(3) // At least 3 header skeletons
  })

  it('renders title skeleton with correct dimensions', () => {
    render(<ProductsSkeleton />)
    const titleSkeleton = document.querySelector('.h-10.w-80.bg-\\[\\#1a1a24\\]')
    expect(titleSkeleton).toBeInTheDocument()
  })

  it('renders description skeleton', () => {
    render(<ProductsSkeleton />)
    const descriptionSkeleton = document.querySelector('.h-5.w-96.bg-\\[\\#1a1a24\\]')
    expect(descriptionSkeleton).toBeInTheDocument()
  })

  it('renders product image skeletons', () => {
    render(<ProductsSkeleton />)
    const imageSkeletons = document.querySelectorAll('.h-40.bg-\\[\\#22222e\\].rounded.mb-6')
    expect(imageSkeletons).toHaveLength(3)
  })

  it('renders product title skeletons', () => {
    render(<ProductsSkeleton />)
    const titleSkeletons = document.querySelectorAll('.h-6.w-3\\/4.bg-\\[\\#22222e\\].rounded.mb-2')
    expect(titleSkeletons).toHaveLength(3)
  })

  it('renders product description skeletons', () => {
    render(<ProductsSkeleton />)
    const descriptionSkeletons = document.querySelectorAll('.h-4.w-1\\/2.bg-\\[\\#22222e\\].rounded.mb-4')
    expect(descriptionSkeletons).toHaveLength(3)
  })

  it('renders product feature list skeletons', () => {
    render(<ProductsSkeleton />)
    const featureSkeletons = document.querySelectorAll('.space-y-2.mb-6')
    expect(featureSkeletons).toHaveLength(3)
  })

  it('renders price skeletons', () => {
    render(<ProductsSkeleton />)
    const priceSkeletons = document.querySelectorAll('.h-8.w-24.bg-\\[\\#22222e\\].rounded.mb-4')
    expect(priceSkeletons).toHaveLength(3)
  })

  it('renders button skeletons', () => {
    render(<ProductsSkeleton />)
    const buttonSkeletons = document.querySelectorAll('.h-12.bg-\\[\\#22222e\\].rounded')
    expect(buttonSkeletons).toHaveLength(3)
  })

  it('has proper section styling', () => {
    render(<ProductsSkeleton />)
    const section = document.querySelector('section')
    expect(section).toHaveClass('py-24', 'px-4', 'sm:px-6', 'lg:px-8')
  })

  it('has gradient background', () => {
    render(<ProductsSkeleton />)
    const section = document.querySelector('section')
    expect(section).toHaveClass('bg-gradient-to-b', 'from-[#0f0f18]', 'to-[#0a0a0f]')
  })

  it('renders responsive grid layout', () => {
    render(<ProductsSkeleton />)
    const grid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3.gap-6')
    expect(grid).toBeInTheDocument()
  })

  it('renders three product cards in the grid', () => {
    render(<ProductsSkeleton />)
    const grid = document.querySelector('.grid')
    const cards = grid?.querySelectorAll(':scope > div')
    expect(cards).toHaveLength(3)
  })

  it('each product card has multiple animated skeleton elements', () => {
    render(<ProductsSkeleton />)
    const cards = document.querySelectorAll('.bg-\\[\\#1a1a24\\].border.border-\\[\\#1e293b\\]')
    
    cards.forEach(card => {
      const animatedElements = card.querySelectorAll('.animate-pulse')
      expect(animatedElements.length).toBeGreaterThanOrEqual(6) // Each card has multiple skeleton elements
    })
  })

  it('renders with proper max-width container', () => {
    render(<ProductsSkeleton />)
    const container = document.querySelector('.max-w-7xl.mx-auto')
    expect(container).toBeInTheDocument()
  })

  it('has proper text centering for header', () => {
    render(<ProductsSkeleton />)
    const headerCenter = document.querySelector('.text-center.mb-16')
    expect(headerCenter).toBeInTheDocument()
  })

  it('uses dark color scheme for skeleton elements', () => {
    render(<ProductsSkeleton />)
    
    // Check that skeleton elements use dark colors
    const darkSkeletons = document.querySelectorAll('[class*="bg-[#1a1a24]"], [class*="bg-[#22222e]"]')
    expect(darkSkeletons.length).toBeGreaterThan(0)
  })

  it('has proper border styling on product cards', () => {
    render(<ProductsSkeleton />)
    const cards = document.querySelectorAll('.border.border-\\[\\#1e293b\\]')
    expect(cards).toHaveLength(3)
  })

  it('renders feature list skeletons inside each card', () => {
    render(<ProductsSkeleton />)
    const featureLists = document.querySelectorAll('.space-y-2')
    
    featureLists.forEach(list => {
      const featureItems = list.querySelectorAll('div')
      expect(featureItems).toHaveLength(3) // 3 feature lines per card
    })
  })

  it('has consistent spacing between skeleton sections', () => {
    render(<ProductsSkeleton />)
    
    // Check header spacing
    const header = document.querySelector('.mb-16')
    expect(header).toBeInTheDocument()
    
    // Check grid spacing
    const grid = document.querySelector('.mb-8')
    expect(grid).toBeInTheDocument()
  })

  it('renders placeholder shapes with varied dimensions', () => {
    render(<ProductsSkeleton />)
    
    // Check for different sized skeletons
    const smallSkeletons = document.querySelectorAll('.h-4')
    const mediumSkeletons = document.querySelectorAll('.h-6')
    const largeSkeletons = document.querySelectorAll('.h-8, .h-10, .h-12, .h-40')
    
    expect(smallSkeletons.length).toBeGreaterThan(0)
    expect(mediumSkeletons.length).toBeGreaterThan(0)
    expect(largeSkeletons.length).toBeGreaterThan(0)
  })

  it('has smooth loading appearance', () => {
    render(<ProductsSkeleton />)
    
    // All skeleton elements should have the animate-pulse class
    const skeletonElements = document.querySelectorAll('[class*="bg-"]')
    const animatedElements = document.querySelectorAll('.animate-pulse')
    
    // Should have a good ratio of animated elements
    expect(animatedElements.length).toBeGreaterThan(skeletonElements.length / 3)
  })

  it('renders without any text content', () => {
    render(<ProductsSkeleton />)
    
    // Should not render any readable text (only skeleton placeholders)
    const textContent = document.body.textContent
    const meaningfulText = textContent?.replace(/\s+/g, '').trim()
    
    // Should be essentially empty or contain only whitespace
    expect(meaningfulText?.length || 0).toBeLessThan(10)
  })
})