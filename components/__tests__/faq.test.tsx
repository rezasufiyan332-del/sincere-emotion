import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FAQ } from '../faq'

describe('FAQ Component', () => {
  it('renders the FAQ section heading', () => {
    render(<FAQ />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Questions & Answers')
  })

  it('renders the FAQ label', () => {
    render(<FAQ />)
    expect(screen.getByText('FAQ')).toBeInTheDocument()
  })

  it('renders all FAQ questions', () => {
    render(<FAQ />)
    
    expect(screen.getByText(/Will these guides actually help/)).toBeInTheDocument()
    expect(screen.getByText(/What if I'm scared to face my patterns/)).toBeInTheDocument()
    expect(screen.getByText(/How is this different from just reading a therapy book/)).toBeInTheDocument()
    expect(screen.getByText(/Can I use these guides even if I'm in a relationship/)).toBeInTheDocument()
    expect(screen.getByText(/What happens after I finish a guide/)).toBeInTheDocument()
  })

  it('renders all 5 FAQ items', () => {
    render(<FAQ />)
    const faqButtons = screen.getAllByRole('button')
    expect(faqButtons).toHaveLength(5)
  })

  it('has section with id="faq"', () => {
    render(<FAQ />)
    const section = document.querySelector('#faq')
    expect(section).toBeInTheDocument()
  })

  it('toggles FAQ item open on click', async () => {
    const user = userEvent.setup()
    render(<FAQ />)
    
    const firstQuestion = screen.getByText(/Will these guides actually help/)
    const button = firstQuestion.closest('button')!
    
    // Initially closed
    expect(button).toHaveAttribute('aria-expanded', 'false')
    
    // Click to open
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    
    // Answer should be visible
    await waitFor(() => {
      expect(screen.getByText(/Yes. These guides are based on attachment theory/)).toBeInTheDocument()
    })
  })

  it('toggles FAQ item closed on second click', async () => {
    const user = userEvent.setup()
    render(<FAQ />)
    
    const button = screen.getByText(/Will these guides actually help/).closest('button')!
    
    // Open
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    
    // Close
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('has aria-expanded attribute on all FAQ buttons', () => {
    render(<FAQ />)
    const buttons = screen.getAllByRole('button')
    
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-expanded')
    })
  })

  it('has aria-controls attribute linking to answer', () => {
    render(<FAQ />)
    const buttons = screen.getAllByRole('button')
    
    buttons.forEach((button, index) => {
      expect(button).toHaveAttribute('aria-controls', `faq-answer-${index}`)
    })
  })

  it('has aria-labelledby on answer regions', async () => {
    const user = userEvent.setup()
    render(<FAQ />)
    
    const firstButton = screen.getAllByRole('button')[0]
    await user.click(firstButton)
    
    await waitFor(() => {
      const answerRegion = document.querySelector('#faq-answer-0')
      expect(answerRegion).toHaveAttribute('aria-labelledby', 'faq-question-0')
    })
  })

  it('only one FAQ item can be open at a time', async () => {
    const user = userEvent.setup()
    render(<FAQ />)
    
    const buttons = screen.getAllByRole('button')
    
    // Open first item
    await user.click(buttons[0])
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true')
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false')
    
    // Open second item - first should close
    await user.click(buttons[1])
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false')
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true')
  })

  it('renders "Still have questions?" text', () => {
    render(<FAQ />)
    expect(screen.getByText('Still have questions?')).toBeInTheDocument()
  })

  it('renders contact email link', () => {
    render(<FAQ />)
    const contactLink = screen.getByText(/Get in touch/)
    expect(contactLink).toBeInTheDocument()
    expect(contactLink).toHaveAttribute('href', 'mailto:support@sincereemotion.com')
  })

  it('has proper section styling', () => {
    render(<FAQ />)
    const section = document.querySelector('#faq')
    expect(section).toHaveClass('py-20', 'px-4', 'sm:px-6', 'lg:px-8')
  })

  it('renders FAQ items with border styling', () => {
    render(<FAQ />)
    const faqItems = document.querySelectorAll('.border-b.border-border')
    expect(faqItems.length).toBeGreaterThanOrEqual(5)
  })

  it('renders FAQ items with left border indicator', () => {
    render(<FAQ />)
    const faqItems = document.querySelectorAll('.border-l-2')
    expect(faqItems.length).toBeGreaterThanOrEqual(5)
  })

  it('has chevron icons for expand/collapse', () => {
    render(<FAQ />)
    const chevrons = document.querySelectorAll('svg')
    expect(chevrons.length).toBeGreaterThanOrEqual(5) // At least 5 chevron icons
  })

  it('shows answer with proper styling when opened', async () => {
    const user = userEvent.setup()
    render(<FAQ />)
    
    const button = screen.getByText(/Will these guides actually help/).closest('button')!
    await user.click(button)
    
    await waitFor(() => {
      const answer = screen.getByText(/Yes. These guides are based on attachment theory/)
      expect(answer).toHaveClass('text-muted-foreground', 'leading-relaxed')
    })
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<FAQ />)
    
    const firstButton = screen.getAllByRole('button')[0]
    firstButton.focus()
    
    await user.keyboard('{Enter}')
    expect(firstButton).toHaveAttribute('aria-expanded', 'true')
    
    await user.keyboard('{Enter}')
    expect(firstButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('has proper ID attributes for accessibility', () => {
    render(<FAQ />)
    
    // Check question IDs
    const buttons = screen.getAllByRole('button')
    buttons.forEach((button, index) => {
      expect(button).toHaveAttribute('id', `faq-question-${index}`)
    })
  })

  it('renders FAQ section with role="region" for answers', async () => {
    const user = userEvent.setup()
    render(<FAQ />)
    
    const button = screen.getAllByRole('button')[0]
    await user.click(button)
    
    await waitFor(() => {
      const answerRegion = document.querySelector('[role="region"]')
      expect(answerRegion).toBeInTheDocument()
    })
  })
})