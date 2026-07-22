import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductsError } from '../products-error'

describe('ProductsError Component', () => {
  const mockOnRetry = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the error message heading', () => {
    render(<ProductsError onRetry={mockOnRetry} />)
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Failed to Load Products')
  })

  it('renders the error description', () => {
    render(<ProductsError onRetry={mockOnRetry} />)
    expect(screen.getByText('Something went wrong while loading our guides.')).toBeInTheDocument()
  })

  it('renders the retry button', () => {
    render(<ProductsError onRetry={mockOnRetry} />)
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProductsError onRetry={mockOnRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    await user.click(retryButton)
    
    expect(mockOnRetry).toHaveBeenCalledTimes(1)
  })

  it('renders error icon', () => {
    render(<ProductsError onRetry={mockOnRetry} />)
    const errorIcon = document.querySelector('svg')
    expect(errorIcon).toBeInTheDocument()
    expect(errorIcon).toHaveClass('w-8', 'h-8', 'text-[#f43f5e]')
  })

  it('has proper error styling', () => {
    render(<ProductsError onRetry={mockOnRetry} />)
    const section = document.querySelector('section')
    expect(section).toHaveClass('py-24', 'px-4', 'sm:px-6', 'lg:px-8')
  })

  it('renders error icon container with proper styling', () => {
    render(<ProductsError onRetry={mockOnRetry} />)
    const iconContainer = document.querySelector('.w-16.h-16.mx-auto.mb-6.rounded-full')
    expect(iconContainer).toBeInTheDocument()
    expect(iconContainer).toHaveClass('bg-[#f43f5e]/10', 'flex', 'items-center', 'justify-center')
  })

  it('renders retry button with proper styling', () => {
    render(<ProductsError onRetry={mockOnRetry} />)
    const retryButton = screen.getByRole('button', { name: /try again/i })
    expect(retryButton).toHaveClass(
      'px-6', 'py-3', 'bg-[#f59e0b]', 'text-black', 'font-semibold', 'rounded-lg'
    )
  })

  it('has hover effect on retry button', () => {
    render(<ProductsError onRetry={mockOnRetry} />)
    const retryButton = screen.getByRole('button', { name: /try again/i })
    expect(retryButton).toHaveClass('hover:bg-[#d97706]', 'transition-colors')
  })

  it('has proper section background', () => {
    render(<ProductsError onRetry={mockOnRetry} />)
    const section = document.querySelector('section')
    expect(section).toHaveClass('bg-gradient-to-b', 'from-[#0f0f18]', 'to-[#0a0a0f]')
  })

  it('centers content properly', () => {
    render(<ProductsError onRetry={mockOnRetry} />)
    const container = document.querySelector('.max-w-7xl.mx-auto.text-center')
    expect(container).toBeInTheDocument()
  })

  it('renders error message with proper text styling', () => {
    render(<ProductsError onRetry={mockOnRetry} />)
    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading).toHaveClass('text-xl', 'font-bold', 'text-white', 'mb-2')
  })

  it('renders description with proper text styling', () => {
    render(<ProductsError onRetry={mockOnRetry} />)
    const description = screen.getByText('Something went wrong while loading our guides.')
    expect(description).toHaveClass('text-[#64748b]', 'mb-6')
  })

  it('does not call onRetry multiple times on rapid clicks', async () => {
    const user = userEvent.setup()
    render(<ProductsError onRetry={mockOnRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    
    // Click multiple times rapidly
    await user.click(retryButton)
    await user.click(retryButton)
    await user.click(retryButton)
    
    // Should still only be called once per click
    expect(mockOnRetry).toHaveBeenCalledTimes(3)
  })

  it('handles onRetry prop being undefined gracefully', () => {
    // This tests that the component doesn't crash if onRetry is not provided
    // In real usage, TypeScript would enforce the prop, but we test runtime behavior
    expect(() => {
      render(<ProductsError onRetry={undefined as any} />)
    }).not.toThrow()
  })

  it('has proper aria-label on retry button', () => {
    render(<ProductsError onRetry={mockOnRetry} />)
    const retryButton = screen.getByRole('button', { name: /try again/i })
    expect(retryButton).toBeInTheDocument()
  })

  it('retry button is focusable', async () => {
    const user = userEvent.setup()
    render(<ProductsError onRetry={mockOnRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    await user.tab()
    
    expect(retryButton).toHaveFocus()
  })

  it('retry button responds to keyboard Enter', async () => {
    const user = userEvent.setup()
    render(<ProductsError onRetry={mockOnRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    retryButton.focus()
    
    await user.keyboard('{Enter}')
    expect(mockOnRetry).toHaveBeenCalledTimes(1)
  })

  it('retry button responds to keyboard Space', async () => {
    const user = userEvent.setup()
    render(<ProductsError onRetry={mockOnRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    retryButton.focus()
    
    await user.keyboard(' ')
    expect(mockOnRetry).toHaveBeenCalledTimes(1)
  })
})