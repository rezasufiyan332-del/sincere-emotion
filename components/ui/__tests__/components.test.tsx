import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'
import { Input } from '../input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card'
import { Badge } from '../badge'
import { Skeleton } from '../skeleton'

describe('Button Component', () => {
  it('renders with text content', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await user.click(screen.getByRole('button', { name: /click me/i }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders with primary variant by default', () => {
    render(<Button>Primary</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-primary')
  })

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('border')
    expect(button.className).toContain('bg-transparent')
  })

  it('renders with ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-transparent')
  })

  it('renders with destructive variant', () => {
    render(<Button variant="destructive">Destructive</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-destructive')
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button').className).toContain('h-8')
    
    rerender(<Button size="md">Medium</Button>)
    expect(screen.getByRole('button').className).toContain('h-10')
    
    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button').className).toContain('h-12')
  })

  it('handles disabled state', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
  })

  it('shows loading state with spinner', () => {
    render(<Button loading>Loading</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('does not show aria-busy when not loading', () => {
    render(<Button>Not loading</Button>)
    const button = screen.getByRole('button')
    expect(button).not.toHaveAttribute('aria-busy')
  })

  it('can be clicked when loading is false', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick} loading={false}>Click</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })

  it('cannot be clicked when loading', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick} loading>Loading</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })
})

describe('Input Component', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('handles onChange events', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} placeholder="Test input" />)
    
    await user.type(screen.getByPlaceholderText('Test input'), 'hello')
    expect(handleChange).toHaveBeenCalled()
  })

  it('renders with label', () => {
    render(<Input label="Email" placeholder="Enter email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders in error state', () => {
    render(<Input error="This field is required" placeholder="Test" />)
    const input = screen.getByPlaceholderText('Test')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required')
  })

  it('renders with helper text', () => {
    render(<Input helperText="Enter your email address" placeholder="Email" />)
    expect(screen.getByText('Enter your email address')).toBeInTheDocument()
  })

  it('does not show helper text when error is present', () => {
    render(
      <Input 
        error="Invalid email" 
        helperText="Enter your email" 
        placeholder="Email" 
      />
    )
    expect(screen.getByText('Invalid email')).toBeInTheDocument()
    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument()
  })

  it('handles disabled state', () => {
    render(<Input disabled placeholder="Disabled input" />)
    const input = screen.getByPlaceholderText('Disabled input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('can be focused', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Focusable" />)
    
    await user.tab()
    expect(screen.getByPlaceholderText('Focusable')).toHaveFocus()
  })
})

describe('Card Component', () => {
  it('renders children', () => {
    render(<Card><div data-testid="child">Card content</div></Card>)
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders with default variant', () => {
    const { container } = render(<Card>Default card</Card>)
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('rounded-lg', 'border', 'bg-card')
  })

  it('renders with interactive variant', () => {
    const { container } = render(<Card variant="interactive">Interactive card</Card>)
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('hover:-translate-y-0.5', 'hover:shadow-lg')
  })

  it('renders with featured variant', () => {
    const { container } = render(<Card variant="featured">Featured card</Card>)
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('border-primary/50')
  })

  it('accepts custom className', () => {
    const { container } = render(<Card className="custom-class">Custom card</Card>)
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('custom-class')
  })
})

describe('Card Sub-components', () => {
  it('renders CardHeader with children', () => {
    render(
      <Card>
        <CardHeader>
          <div data-testid="header">Header content</div>
        </CardHeader>
      </Card>
    )
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('renders CardTitle with correct styling', () => {
    render(
      <Card>
        <CardTitle>Card Title</CardTitle>
      </Card>
    )
    const title = screen.getByText('Card Title')
    expect(title.tagName).toBe('H3')
    expect(title).toHaveClass('text-lg', 'font-semibold')
  })

  it('renders CardDescription', () => {
    render(
      <Card>
        <CardDescription>Card description text</CardDescription>
      </Card>
    )
    const description = screen.getByText('Card description text')
    expect(description.tagName).toBe('P')
    expect(description).toHaveClass('text-sm', 'text-muted-foreground')
  })

  it('renders CardContent', () => {
    render(
      <Card>
        <CardContent>
          <div data-testid="content">Content area</div>
        </CardContent>
      </Card>
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  it('renders CardFooter', () => {
    render(
      <Card>
        <CardFooter>
          <div data-testid="footer">Footer actions</div>
        </CardFooter>
      </Card>
    )
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })
})

describe('Badge Component', () => {
  it('renders with default variant', () => {
    render(<Badge>Default badge</Badge>)
    const badge = screen.getByText('Default badge')
    expect(badge).toHaveClass('bg-muted', 'text-muted-foreground')
  })

  it('renders with success variant', () => {
    render(<Badge variant="success">Success</Badge>)
    const badge = screen.getByText('Success')
    expect(badge).toHaveClass('bg-success/15', 'text-success')
  })

  it('renders with warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>)
    const badge = screen.getByText('Warning')
    expect(badge).toHaveClass('bg-warning/15', 'text-warning')
  })

  it('renders with destructive variant', () => {
    render(<Badge variant="destructive">Error</Badge>)
    const badge = screen.getByText('Error')
    expect(badge).toHaveClass('bg-destructive/15', 'text-destructive')
  })

  it('renders with outline variant', () => {
    render(<Badge variant="outline">Outline</Badge>)
    const badge = screen.getByText('Outline')
    expect(badge).toHaveClass('border', 'border-border')
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>)
    expect(screen.getByText('Small')).toHaveClass('px-2', 'py-0.5', 'text-xs')
    
    rerender(<Badge size="md">Medium</Badge>)
    expect(screen.getByText('Medium')).toHaveClass('px-2.5', 'py-0.5', 'text-xs')
  })

  it('accepts custom className', () => {
    render(<Badge className="custom-badge">Custom</Badge>)
    expect(screen.getByText('Custom')).toHaveClass('custom-badge')
  })
})

describe('Skeleton Component', () => {
  it('renders with text variant by default', () => {
    render(<Skeleton />)
    const skeleton = document.querySelector('[aria-hidden="true"]')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('h-4', 'w-full')
  })

  it('renders with circular variant', () => {
    render(<Skeleton variant="circular" />)
    const skeleton = document.querySelector('[aria-hidden="true"]')
    expect(skeleton).toHaveClass('rounded-full')
  })

  it('renders with rectangular variant', () => {
    render(<Skeleton variant="rectangular" />)
    const skeleton = document.querySelector('[aria-hidden="true"]')
    expect(skeleton).toHaveClass('h-32', 'w-full')
  })

  it('renders with card variant', () => {
    render(<Skeleton variant="card" />)
    const skeleton = document.querySelector('[aria-hidden="true"]')
    expect(skeleton).toHaveClass('h-48', 'w-full', 'rounded-lg')
  })

  it('has aria-hidden attribute', () => {
    render(<Skeleton />)
    const skeleton = document.querySelector('[aria-hidden="true"]')
    expect(skeleton).toHaveAttribute('aria-hidden', 'true')
  })

  it('has shimmer animation class', () => {
    render(<Skeleton />)
    const skeleton = document.querySelector('[aria-hidden="true"]')
    expect(skeleton.className).toContain('before:animate-[shimmer_2s_infinite]')
  })

  it('accepts custom dimensions', () => {
    render(<Skeleton className="h-8 w-32" />)
    const skeleton = document.querySelector('[aria-hidden="true"]')
    expect(skeleton).toHaveClass('h-8', 'w-32')
  })

  it('accepts custom style', () => {
    render(<Skeleton style={{ backgroundColor: 'red' }} />)
    const skeleton = document.querySelector('[aria-hidden="true"]')
    expect(skeleton).toHaveAttribute('style', 'background-color: red;')
  })
})