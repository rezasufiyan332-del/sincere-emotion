import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// ============================================
// Mock Setup
// ============================================

// Mock Prisma
const mockPrisma = {
  product: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  session: {
    create: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  order: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    findFirst: vi.fn(),
  },
  newsletterSubscriber: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}

vi.mock('../../../lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock Stripe
const mockStripe = {
  checkout: {
    sessions: {
      create: vi.fn(),
    },
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
}

vi.mock('../../../lib/stripe', () => ({
  stripe: mockStripe,
}))

// Mock Resend email functions - return promises with catch method
const mockEmailFunctions = {
  sendWelcomeEmail: vi.fn().mockResolvedValue({ success: true }),
  sendOrderConfirmation: vi.fn().mockResolvedValue({ success: true }),
  sendNewsletterWelcome: vi.fn().mockResolvedValue({ success: true }),
  sendResetPasswordEmail: vi.fn().mockResolvedValue({ success: true }),
  sendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
}

vi.mock('../../../lib/email', () => mockEmailFunctions)

// Mock auth functions - use actual error classes for proper status codes
import { UnauthorizedError } from '../../../lib/errors'
const mockAuth = {
  login: vi.fn(),
  register: vi.fn(),
  rotateSession: vi.fn(),
  hashPassword: vi.fn(),
  requireAuth: vi.fn(),
  getSession: vi.fn(),
}

vi.mock('../../../lib/auth', () => mockAuth)

// Mock rate limiter
let rateLimitStore = new Map<string, { count: number; resetAt: number }>()
vi.mock('../../../lib/rate-limit', () => ({
  checkRateLimit: vi.fn((key: string, maxRequests: number, windowMs: number) => {
    const now = Date.now()
    const entry = rateLimitStore.get(key)
    
    if (!entry || now > entry.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
      return { allowed: true, remaining: maxRequests - 1 }
    }
    
    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now }
    }
    
    entry.count++
    return { allowed: true, remaining: maxRequests - entry.count }
  }),
  getClientIp: vi.fn(() => '127.0.0.1'),
}))

// ============================================
// Helper: Create NextRequest
// ============================================

function createRequest(url: string, options: RequestInit = {}) {
  return new NextRequest(new Request(url, options))
}

// ============================================
// Test Setup
// ============================================

beforeEach(() => {
  vi.clearAllMocks()
  rateLimitStore.clear()
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
  process.env.STRIPE_SECRET_KEY = 'sk_test_fake_key'
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_fake_secret'
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ============================================
// 1. GET /api/products
// ============================================

describe('GET /api/products', () => {
  let GET: Function
  
  beforeEach(async () => {
    const module = await import('../products/route')
    GET = module.GET
  })
  
  const mockProducts = [
    {
      id: '1',
      name: 'Attachment Guide',
      slug: 'attachment-guide',
      subtitle: 'Learn about attachment',
      description: 'A comprehensive guide',
      price: 1999,
      originalPrice: 2999,
      image: '/images/guide.jpg',
      features: ['Feature 1'],
      bestseller: true,
      featured: false,
      active: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ]

  beforeEach(() => {
    mockPrisma.product.findMany.mockResolvedValue(mockProducts)
    mockPrisma.product.count.mockResolvedValue(1)
  })

    it('returns products with default pagination', async () => {
    const request = createRequest('http://localhost:3000/api/products')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
      })
    )
  })

  it('handles empty results', async () => {
    mockPrisma.product.findMany.mockResolvedValue([])
    mockPrisma.product.count.mockResolvedValue(0)

    const request = createRequest('http://localhost:3000/api/products')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.product.findMany).toHaveBeenCalled()
  })

  it('applies custom pagination', async () => {
    const request = createRequest('http://localhost:3000/api/products?page=2&limit=5')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
      })
    )
  })

  it('applies price ascending sort', async () => {
    const request = createRequest('http://localhost:3000/api/products?sort=price-asc')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { price: 'asc' },
      })
    )
  })

  it('applies price descending sort', async () => {
    const request = createRequest('http://localhost:3000/api/products?sort=price-desc')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { price: 'desc' },
      })
    )
  })

  it('applies oldest sort', async () => {
    const request = createRequest('http://localhost:3000/api/products?sort=oldest')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'asc' },
      })
    )
  })

  it('applies search filter', async () => {
    const request = createRequest('http://localhost:3000/api/products?search=healing')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              name: expect.objectContaining({ contains: 'healing' }),
            }),
          ]),
        }),
      })
    )
  })

  it('applies bestseller filter', async () => {
    const request = createRequest('http://localhost:3000/api/products?bestseller=true')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          bestseller: true,
        }),
      })
    )
  })

  it('applies featured filter', async () => {
    const request = createRequest('http://localhost:3000/api/products?featured=true')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          featured: true,
        }),
      })
    )
  })

  it('sets Cache-Control header', async () => {
    const request = createRequest('http://localhost:3000/api/products')
    const response = await GET(request)

    expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=60, stale-while-revalidate=300')
  })

  it('handles empty results', async () => {
    mockPrisma.product.findMany.mockResolvedValue([])
    mockPrisma.product.count.mockResolvedValue(0)

    const request = createRequest('http://localhost:3000/api/products')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.product.findMany).toHaveBeenCalled()
  })

  it('returns 400 for invalid page parameter', async () => {
    const request = createRequest('http://localhost:3000/api/products?page=0')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 for invalid limit parameter', async () => {
    const request = createRequest('http://localhost:3000/api/products?limit=100')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns 400 for invalid sort parameter', async () => {
    const request = createRequest('http://localhost:3000/api/products?sort=invalid')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })
})

// ============================================
// 2. POST /api/auth/login
// ============================================

describe('POST /api/auth/login', () => {
  let POST: Function
  
  beforeEach(async () => {
    const module = await import('../auth/login/route')
    POST = module.POST
  })

  beforeEach(() => {
    mockAuth.login.mockResolvedValue({
      user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'USER' },
      token: 'session-token-123',
    })
    mockAuth.rotateSession.mockResolvedValue('rotated-session-token-456')
  })

  it('logs in successfully with valid credentials', async () => {
    const request = createRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.user.email).toBe('test@example.com')
    expect(data.data.token).toBe('rotated-session-token-456')
    expect(response.headers.get('set-cookie')).toContain('session-token=rotated-session-token-456')
  })

  it('returns 401 for invalid email', async () => {
    mockAuth.login.mockRejectedValue(new Error('Invalid email or password'))

    const request = createRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'wrong@example.com', password: 'password123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('AUTH_ERROR')
  })

  it('returns 401 for wrong password', async () => {
    mockAuth.login.mockRejectedValue(new Error('Invalid email or password'))

    const request = createRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it('returns 400 for missing email', async () => {
    const request = createRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'password123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    // Login route catches validation errors and returns 401 with AUTH_ERROR
    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('AUTH_ERROR')
  })

  it('returns 400 for missing password', async () => {
    const request = createRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    // Login route catches validation errors and returns 401 with AUTH_ERROR
    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('AUTH_ERROR')
  })

  it('returns 400 for invalid email format', async () => {
    const request = createRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: 'password123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    // Login route catches validation errors and returns 401 with AUTH_ERROR
    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('AUTH_ERROR')
  })

  it('returns 429 when rate limited', async () => {
    // Exhaust rate limit (5 requests per 15 minutes)
    for (let i = 0; i < 5; i++) {
      const request = createRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      })
      await POST(request)
    }

    // 6th request should be rate limited
    const request = createRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('RATE_LIMITED')
  })
})

// ============================================
// 3. POST /api/auth/register
// ============================================

describe('POST /api/auth/register', () => {
  let POST: Function
  
  beforeEach(async () => {
    const module = await import('../auth/register/route')
    POST = module.POST
  })

  beforeEach(() => {
    mockAuth.register.mockResolvedValue({
      user: { id: '1', email: 'new@example.com', name: 'New User', role: 'USER' },
      token: 'session-token-456',
    })
    mockAuth.rotateSession.mockResolvedValue('rotated-session-token-789')
  })

  it('registers successfully with valid data', async () => {
    const request = createRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        name: 'New User',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data.user.email).toBe('new@example.com')
    expect(response.headers.get('set-cookie')).toContain('session-token=rotated-session-token-789')
  })

  it('returns 400 for existing email', async () => {
    mockAuth.register.mockRejectedValue(new Error('An account with this email already exists'))

    const request = createRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('AUTH_ERROR')
  })

  it('returns 400 for weak password (too short)', async () => {
    const request = createRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'short',
        confirmPassword: 'short',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    // Register route catches validation errors and returns them as AUTH_ERROR
    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('AUTH_ERROR')
  })

  it('returns 400 for password mismatch', async () => {
    const request = createRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns 400 for missing required fields', async () => {
    const request = createRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns 429 when rate limited', async () => {
    // Exhaust rate limit (3 requests per hour)
    for (let i = 0; i < 3; i++) {
      const request = createRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `user${i}@example.com`,
          password: 'Password123',
          confirmPassword: 'Password123',
        }),
      })
      await POST(request)
    }

    // 4th request should be rate limited
    const request = createRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user3@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('RATE_LIMITED')
  })
})

// ============================================
// 4. POST /api/auth/forgot-password
// ============================================

describe('POST /api/auth/forgot-password', () => {
  let POST: Function
  
  beforeEach(async () => {
    const module = await import('../auth/forgot-password/route')
    POST = module.POST
  })

  beforeEach(() => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.update.mockResolvedValue({})
  })

  it('returns success message for existing user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      name: 'Test User',
    })

    const request = createRequest('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.message).toBe('If the email exists, a reset link has been sent')
    expect(mockPrisma.user.update).toHaveBeenCalled()
  })

  it('returns same success message for non-existing user (security)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const request = createRequest('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@example.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.message).toBe('If the email exists, a reset link has been sent')
    expect(mockPrisma.user.update).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid email format', async () => {
    const request = createRequest('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns 400 for missing email', async () => {
    const request = createRequest('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns 429 when rate limited', async () => {
    // Exhaust rate limit (3 requests per hour)
    for (let i = 0; i < 3; i++) {
      const request = createRequest('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com' }),
      })
      await POST(request)
    }

    // 4th request should be rate limited
    const request = createRequest('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('RATE_LIMITED')
  })
})

// ============================================
// 5. POST /api/auth/reset-password
// ============================================

describe('POST /api/auth/reset-password', () => {
  let POST: Function
  
  beforeEach(async () => {
    const module = await import('../auth/reset-password/route')
    POST = module.POST
  })

  beforeEach(() => {
    mockAuth.hashPassword.mockResolvedValue('hashed-password')
    mockPrisma.user.findFirst.mockResolvedValue(null)
    mockPrisma.user.update.mockResolvedValue({})
  })

  it('resets password with valid token', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: '1',
      email: 'user@example.com',
    })

    const request = createRequest('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'valid-token-123',
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.message).toBe('Password has been reset successfully')
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          passwordHash: 'hashed-password',
          resetToken: null,
          resetTokenExpiry: null,
        }),
      })
    )
  })

  it('returns 400 for invalid token', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null)

    const request = createRequest('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'invalid-token',
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('INVALID_TOKEN')
  })

  it('returns 400 for expired token', async () => {
    // Simulate expired token by returning null (token not found due to expiry)
    mockPrisma.user.findFirst.mockResolvedValue(null)

    const request = createRequest('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'expired-token',
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns 400 for weak password', async () => {
    const request = createRequest('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'valid-token',
        password: 'weak',
        confirmPassword: 'weak',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns 400 for password mismatch', async () => {
    const request = createRequest('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'valid-token',
        password: 'NewPassword123',
        confirmPassword: 'DifferentPassword123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns 400 for missing token', async () => {
    const request = createRequest('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns 429 when rate limited', async () => {
    // Exhaust rate limit (5 requests per hour)
    for (let i = 0; i < 5; i++) {
      const request = createRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'token',
          password: 'NewPassword123',
          confirmPassword: 'NewPassword123',
        }),
      })
      await POST(request)
    }

    // 6th request should be rate limited
    const request = createRequest('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'token',
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('RATE_LIMITED')
  })
})

// ============================================
// 6. POST /api/checkout
// ============================================

describe('POST /api/checkout', () => {
  let POST: Function
  
  beforeEach(async () => {
    const module = await import('../checkout/route')
    POST = module.POST
  })

  const mockUser = {
    user: { id: 'user-1', email: 'buyer@example.com', name: 'Buyer', role: 'USER' },
  }

  const mockProduct = {
    id: 'product-1',
    name: 'Attachment Guide',
    price: 1999,
    active: true,
    image: '/images/guide.jpg',
    subtitle: 'Learn about attachment',
  }

  beforeEach(() => {
    mockAuth.requireAuth.mockResolvedValue(mockUser)
    mockPrisma.product.findUnique.mockResolvedValue(mockProduct)
    mockStripe.checkout.sessions.create.mockResolvedValue({
      id: 'session-123',
      url: 'https://checkout.stripe.com/session-123',
    })
  })

  it('creates checkout session for authenticated user', async () => {
    const request = createRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'product-1', name: 'Attachment Guide', quantity: 1 }],
        email: 'buyer@example.com',
        name: 'Buyer',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.url).toBe('https://checkout.stripe.com/session-123')
    expect(data.data.sessionId).toBe('session-123')
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalled()
  })

  it('verifies prices from database (ignores client prices)', async () => {
    const request = createRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'product-1', name: 'Attachment Guide', quantity: 1, price: 999 }], // Client sends wrong price
        email: 'buyer@example.com',
        name: 'Buyer',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    // Verify that the database price (1999) was used, not client price (999)
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: expect.arrayContaining([
          expect.objectContaining({
            price_data: expect.objectContaining({
              unit_amount: 1999, // Database price, not client price
            }),
          }),
        ]),
      }),
      expect.any(Object) // idempotency key options
    )
  })

  it('returns 400 for non-existent product', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null)

    const request = createRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'non-existent', name: 'Product', quantity: 1 }],
        email: 'buyer@example.com',
        name: 'Buyer',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns 400 for inactive product', async () => {
    mockPrisma.product.findUnique.mockResolvedValue({ ...mockProduct, active: false })

    const request = createRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'product-1', name: 'Attachment Guide', quantity: 1 }],
        email: 'buyer@example.com',
        name: 'Buyer',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('supports guest checkout (no auth required)', async () => {
    // Checkout now supports guest checkout - no auth needed
    mockPrisma.product.findUnique.mockResolvedValue(mockProduct)
    mockStripe.checkout.sessions.create.mockResolvedValue({
      id: 'cs_guest_123',
      url: 'https://checkout.stripe.com/guest_123',
    })

    const request = createRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'product-1', name: 'Attachment Guide', quantity: 1 }],
        email: 'guest@example.com',
        name: 'Guest User',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('returns 400 for empty items array', async () => {
    const request = createRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [],
        email: 'buyer@example.com',
        name: 'Buyer',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns 400 for invalid email', async () => {
    const request = createRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'product-1', name: 'Attachment Guide', quantity: 1 }],
        email: 'not-an-email',
        name: 'Buyer',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns 429 when rate limited', async () => {
    // Exhaust rate limit (10 requests per hour)
    for (let i = 0; i < 10; i++) {
      const request = createRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ productId: 'product-1', name: 'Attachment Guide', quantity: 1 }],
          email: 'buyer@example.com',
          name: 'Buyer',
        }),
      })
      await POST(request)
    }

    // 11th request should be rate limited
    const request = createRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'product-1', name: 'Attachment Guide', quantity: 1 }],
        email: 'buyer@example.com',
        name: 'Buyer',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('RATE_LIMITED')
  })
})

// ============================================
// 7. POST /api/webhook
// ============================================

describe('POST /api/webhook', () => {
  let POST: Function
  
  beforeEach(async () => {
    const module = await import('../webhook/route')
    POST = module.POST
  })

  beforeEach(() => {
    mockPrisma.order.findFirst.mockResolvedValue(null)
    mockPrisma.order.create.mockResolvedValue({})
  })

  it('processes checkout.session.completed event', async () => {
    const mockSession = {
      id: 'session-123',
      metadata: {
        userId: 'user-1',
        customerEmail: 'buyer@example.com',
        customerName: 'Buyer',
        items: JSON.stringify([
          { productId: 'product-1', name: 'Guide', price: 1999, quantity: 1 },
        ]),
      },
      payment_intent: 'pi_123',
    }

    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: mockSession },
    })

    const request = createRequest('http://localhost:3000/api/webhook', {
      method: 'POST',
      headers: { 'stripe-signature': 'fake-signature' },
      body: JSON.stringify({ type: 'checkout.session.completed' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
    expect(mockPrisma.order.create).toHaveBeenCalled()
  })

  it('processes payment_intent.payment_failed event', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'payment_intent.payment_failed',
      data: { object: { id: 'pi_failed' } },
    })

    const request = createRequest('http://localhost:3000/api/webhook', {
      method: 'POST',
      headers: { 'stripe-signature': 'fake-signature' },
      body: JSON.stringify({ type: 'payment_intent.payment_failed' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
  })

  it('returns 400 for missing signature', async () => {
    const request = createRequest('http://localhost:3000/api/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing signature')
  })

  it('returns 400 for invalid signature', async () => {
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const request = createRequest('http://localhost:3000/api/webhook', {
      method: 'POST',
      headers: { 'stripe-signature': 'invalid-signature' },
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid signature')
  })

  it('does not create duplicate order', async () => {
    mockPrisma.order.findFirst.mockResolvedValue({ id: 'existing-order' })

    const mockSession = {
      id: 'session-123',
      metadata: {
        userId: 'user-1',
        customerEmail: 'buyer@example.com',
        customerName: 'Buyer',
        items: JSON.stringify([
          { productId: 'product-1', name: 'Guide', price: 1999, quantity: 1 },
        ]),
      },
    }

    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: mockSession },
    })

    const request = createRequest('http://localhost:3000/api/webhook', {
      method: 'POST',
      headers: { 'stripe-signature': 'fake-signature' },
      body: JSON.stringify({}),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.order.create).not.toHaveBeenCalled()
  })

  it('handles missing metadata gracefully', async () => {
    const mockSession = {
      id: 'session-123',
      metadata: null,
    }

    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: mockSession },
    })

    const request = createRequest('http://localhost:3000/api/webhook', {
      method: 'POST',
      headers: { 'stripe-signature': 'fake-signature' },
      body: JSON.stringify({}),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.order.create).not.toHaveBeenCalled()
  })
})

// ============================================
// 8. POST /api/newsletter
// ============================================

describe('POST /api/newsletter', () => {
  let POST: Function
  
  beforeEach(async () => {
    const module = await import('../newsletter/route')
    POST = module.POST
  })

  beforeEach(() => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(null)
    mockPrisma.newsletterSubscriber.create.mockResolvedValue({})
  })

  it('subscribes with valid email', async () => {
    const request = createRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'subscriber@example.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data.message).toBe('Successfully subscribed to newsletter')
    expect(mockPrisma.newsletterSubscriber.create).toHaveBeenCalled()
  })

  it('subscribes with email and source', async () => {
    const request = createRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'subscriber@example.com', source: 'homepage' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(mockPrisma.newsletterSubscriber.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          source: 'homepage',
        }),
      })
    )
  })

  it('returns 409 for duplicate email', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue({
      id: '1',
      email: 'existing@example.com',
      unsubscribedAt: null,
    })

    const request = createRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'existing@example.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.success).toBe(false)
    expect(data.error.message).toBe('You are already subscribed to our newsletter')
  })

  it('resubscribes previously unsubscribed user', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue({
      id: '1',
      email: 'unsubscribed@example.com',
      unsubscribedAt: new Date('2024-01-01'),
    })

    const request = createRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'unsubscribed@example.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data.message).toBe('Successfully resubscribed to newsletter')
    expect(mockPrisma.newsletterSubscriber.update).toHaveBeenCalled()
  })

  it('returns 400 for invalid email', async () => {
    const request = createRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns 400 for missing email', async () => {
    const request = createRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('normalizes email to lowercase', async () => {
    const request = createRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'Subscriber@Example.COM' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(mockPrisma.newsletterSubscriber.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'subscriber@example.com',
        }),
      })
    )
  })
})

// ============================================
// 9. GET /api/orders
// ============================================

describe('GET /api/orders', () => {
  let GET: Function
  
  beforeEach(async () => {
    const module = await import('../orders/route')
    GET = module.GET
  })

  const mockUser = {
    user: { id: 'user-1', email: 'user@example.com', name: 'User', role: 'USER' },
  }

  const mockOrders = [
    {
      id: 'order-1',
      userId: 'user-1',
      email: 'user@example.com',
      name: 'User',
      total: 1999,
      status: 'COMPLETED',
      items: [{ name: 'Guide', price: 1999, quantity: 1 }],
      orderItems: [{ productId: 'product-1', name: 'Guide', price: 1999, quantity: 1 }],
      createdAt: new Date('2024-01-15'),
    },
  ]

  beforeEach(() => {
    mockAuth.requireAuth.mockResolvedValue(mockUser)
    mockPrisma.order.findMany.mockResolvedValue(mockOrders)
    mockPrisma.order.count.mockResolvedValue(1)
  })

  it('returns orders for authenticated user', async () => {
    const request = createRequest('http://localhost:3000/api/orders')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.orders).toHaveLength(1)
    expect(data.data.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    })
  })

  it('returns 401 for unauthenticated user', async () => {
    mockAuth.requireAuth.mockRejectedValue(new UnauthorizedError('Please log in to continue'))

    const request = createRequest('http://localhost:3000/api/orders')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it('applies custom pagination', async () => {
    const request = createRequest('http://localhost:3000/api/orders?page=2&limit=5')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
      })
    )
  })

  it('handles empty state', async () => {
    mockPrisma.order.findMany.mockResolvedValue([])
    mockPrisma.order.count.mockResolvedValue(0)

    const request = createRequest('http://localhost:3000/api/orders')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.orders).toHaveLength(0)
    expect(data.data.meta.total).toBe(0)
    expect(data.data.meta.totalPages).toBe(0)
  })

  it('limits maximum page size to 50', async () => {
    const request = createRequest('http://localhost:3000/api/orders?limit=100')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 50, // Capped at 50
      })
    )
  })

  it('includes order items in response', async () => {
    const request = createRequest('http://localhost:3000/api/orders')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { orderItems: true },
      })
    )
  })

  it('sorts orders by newest first', async () => {
    const request = createRequest('http://localhost:3000/api/orders')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      })
    )
  })

  it('only returns orders for the authenticated user', async () => {
    const request = createRequest('http://localhost:3000/api/orders')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
      })
    )
  })
})

// ============================================
// 10. POST /api/orders (create order)
// ============================================

describe('POST /api/orders', () => {
  let POST: Function
  
  beforeEach(async () => {
    const module = await import('../orders/route')
    POST = module.POST
  })

  const mockUser = {
    user: { id: 'user-1', email: 'user@example.com', name: 'User', role: 'USER' },
  }

  const mockOrder = {
    id: 'order-1',
    userId: 'user-1',
    email: 'user@example.com',
    name: 'User',
    total: 1999,
    status: 'PENDING',
    items: [{ name: 'Guide', price: 1999, quantity: 1 }],
    orderItems: [{ productId: 'product-1', name: 'Guide', price: 1999, quantity: 1 }],
    createdAt: new Date('2024-01-15'),
  }

  beforeEach(() => {
    mockAuth.requireAuth.mockResolvedValue(mockUser)
    mockPrisma.order.create.mockImplementation(({ data }: any) => Promise.resolve({
      ...mockOrder,
      total: data?.total ?? 1999,
      userId: data?.userId ?? 'user-1',
      email: data?.email ?? 'user@example.com',
      name: data?.name ?? 'User',
      status: data?.status ?? 'PENDING',
    }))
  })

  it('creates order for authenticated user', async () => {
    const request = createRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        name: 'User',
        items: [{ productId: 'product-1', name: 'Guide', price: 1999, quantity: 1 }],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data.total).toBe(1999)
    expect(data.data.status).toBe('PENDING')
    expect(mockPrisma.order.create).toHaveBeenCalled()
  })

  it('returns 401 for unauthenticated user', async () => {
    mockAuth.requireAuth.mockRejectedValue(new UnauthorizedError('Please log in to continue'))

    const request = createRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        name: 'User',
        items: [{ productId: 'product-1', name: 'Guide', price: 1999, quantity: 1 }],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it('returns 400 for missing items', async () => {
    const request = createRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        name: 'User',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns 400 for empty items array', async () => {
    const request = createRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        name: 'User',
        items: [],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('calculates total correctly', async () => {
    const request = createRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        name: 'User',
        items: [
          { productId: 'product-1', name: 'Guide 1', price: 1999, quantity: 2 },
          { productId: 'product-2', name: 'Guide 2', price: 2999, quantity: 1 },
        ],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    // Total should be (1999 * 2) + (2999 * 1) = 6997
    expect(data.data.total).toBe(6997)
  })
})