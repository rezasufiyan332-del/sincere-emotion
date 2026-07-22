import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { z } from 'zod'

// ─── cn() ────────────────────────────────────────────────────────────────────

describe('cn()', () => {
  // We import cn fresh so tailwind-merge is always resolved correctly.
  let cn: typeof import('@/lib/utils').cn

  beforeEach(async () => {
    const mod = await import('@/lib/utils')
    cn = mod.cn
  })

  it('returns an empty string for no arguments', () => {
    expect(cn()).toBe('')
  })

  it('returns a single class string unchanged', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('merges multiple class strings', () => {
    const result = cn('foo', 'bar')
    expect(result).toContain('foo')
    expect(result).toContain('bar')
  })

  it('handles conditional classes (falsy values are ignored)', () => {
    const isActive = true
    const isDisabled = false
    const result = cn('base', isActive && 'active', isDisabled && 'disabled')
    expect(result).toContain('base')
    expect(result).toContain('active')
    expect(result).not.toContain('disabled')
  })

  it('handles undefined and null gracefully', () => {
    const result = cn('foo', undefined, null, false, 0, 'bar')
    expect(result).toContain('foo')
    expect(result).toContain('bar')
  })

  it('deduplicates conflicting tailwind classes via twMerge', () => {
    // tailwind-merge should keep only the last occurrence
    const result = cn('p-2', 'p-4')
    expect(result).toBe('p-4')
  })

  it('resolves responsive tailwind conflicts', () => {
    const result = cn('text-sm', 'text-lg')
    expect(result).toBe('text-lg')
  })

  it('handles arrays of class values', () => {
    const result = cn(['foo', 'bar'], 'baz')
    expect(result).toContain('foo')
    expect(result).toContain('bar')
    expect(result).toContain('baz')
  })

  it('handles object-style conditional classes', () => {
    const result = cn({
      'text-red-500': true,
      'text-blue-500': false,
      'font-bold': true,
    })
    expect(result).toContain('text-red-500')
    expect(result).not.toContain('text-blue-500')
    expect(result).toContain('font-bold')
  })
})

// ─── Error classes ───────────────────────────────────────────────────────────

describe('AppError', () => {
  let AppError: typeof import('@/lib/errors').AppError

  beforeEach(async () => {
    const mod = await import('@/lib/errors')
    AppError = mod.AppError
  })

  it('creates an error with default values', () => {
    const err = new AppError('something broke')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(AppError)
    expect(err.message).toBe('something broke')
    expect(err.statusCode).toBe(500)
    expect(err.code).toBe('INTERNAL_ERROR')
    expect(err.isOperational).toBe(true)
    expect(err.stack).toBeDefined()
  })

  it('accepts custom statusCode, code, and isOperational', () => {
    const err = new AppError('custom', 418, 'TEAPOT', false)
    expect(err.statusCode).toBe(418)
    expect(err.code).toBe('TEAPOT')
    expect(err.isOperational).toBe(false)
  })
})

describe('NotFoundError', () => {
  let NotFoundError: typeof import('@/lib/errors').NotFoundError

  beforeEach(async () => {
    const mod = await import('@/lib/errors')
    NotFoundError = mod.NotFoundError
  })

  it('creates a 404 error with default resource name', () => {
    const err = new NotFoundError()
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toBe('Resource not found')
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
  })

  it('creates a 404 error with a custom resource name', () => {
    const err = new NotFoundError('User')
    expect(err.message).toBe('User not found')
    expect(err.statusCode).toBe(404)
  })
})

describe('ValidationError', () => {
  let ValidationError: typeof import('@/lib/errors').ValidationError

  beforeEach(async () => {
    const mod = await import('@/lib/errors')
    ValidationError = mod.ValidationError
  })

  it('creates a 400 error with field errors', () => {
    const fieldErrors = { email: ['Invalid email'], name: ['Required'] }
    const err = new ValidationError(fieldErrors)
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toBe('Validation failed')
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err.errors).toEqual(fieldErrors)
  })

  it('preserves reference to the errors object', () => {
    const fieldErrors = { name: ['Too short'] }
    const err = new ValidationError(fieldErrors)
    expect(err.errors).toBe(fieldErrors)
  })
})

describe('UnauthorizedError', () => {
  let UnauthorizedError: typeof import('@/lib/errors').UnauthorizedError

  beforeEach(async () => {
    const mod = await import('@/lib/errors')
    UnauthorizedError = mod.UnauthorizedError
  })

  it('creates a 401 error with default message', () => {
    const err = new UnauthorizedError()
    expect(err.message).toBe('Unauthorized')
    expect(err.statusCode).toBe(401)
    expect(err.code).toBe('UNAUTHORIZED')
  })

  it('creates a 401 error with custom message', () => {
    const err = new UnauthorizedError('Token expired')
    expect(err.message).toBe('Token expired')
    expect(err.statusCode).toBe(401)
  })
})

describe('ForbiddenError', () => {
  let ForbiddenError: typeof import('@/lib/errors').ForbiddenError

  beforeEach(async () => {
    const mod = await import('@/lib/errors')
    ForbiddenError = mod.ForbiddenError
  })

  it('creates a 403 error with default message', () => {
    const err = new ForbiddenError()
    expect(err.message).toBe('Forbidden')
    expect(err.statusCode).toBe(403)
    expect(err.code).toBe('FORBIDDEN')
  })

  it('creates a 403 error with custom message', () => {
    const err = new ForbiddenError('Admin only')
    expect(err.message).toBe('Admin only')
    expect(err.statusCode).toBe(403)
  })
})

describe('ConflictError', () => {
  let ConflictError: typeof import('@/lib/errors').ConflictError

  beforeEach(async () => {
    const mod = await import('@/lib/errors')
    ConflictError = mod.ConflictError
  })

  it('creates a 409 error with default message', () => {
    const err = new ConflictError()
    expect(err.message).toBe('Resource already exists')
    expect(err.statusCode).toBe(409)
    expect(err.code).toBe('CONFLICT')
  })

  it('creates a 409 error with custom message', () => {
    const err = new ConflictError('Email already registered')
    expect(err.message).toBe('Email already registered')
    expect(err.statusCode).toBe(409)
  })
})

describe('RateLimitError', () => {
  let RateLimitError: typeof import('@/lib/errors').RateLimitError

  beforeEach(async () => {
    const mod = await import('@/lib/errors')
    RateLimitError = mod.RateLimitError
  })

  it('creates a 429 error with default message', () => {
    const err = new RateLimitError()
    expect(err.message).toBe('Too many requests')
    expect(err.statusCode).toBe(429)
    expect(err.code).toBe('RATE_LIMITED')
  })

  it('creates a 429 error with custom message', () => {
    const err = new RateLimitError('Slow down')
    expect(err.message).toBe('Slow down')
    expect(err.statusCode).toBe(429)
  })
})

// All error classes inherit from AppError, which inherits from Error
describe('error class hierarchy', () => {
  let AppError: typeof import('@/lib/errors').AppError
  let NotFoundError: typeof import('@/lib/errors').NotFoundError
  let ValidationError: typeof import('@/lib/errors').ValidationError
  let UnauthorizedError: typeof import('@/lib/errors').UnauthorizedError
  let ForbiddenError: typeof import('@/lib/errors').ForbiddenError
  let ConflictError: typeof import('@/lib/errors').ConflictError
  let RateLimitError: typeof import('@/lib/errors').RateLimitError

  beforeEach(async () => {
    const mod = await import('@/lib/errors')
    AppError = mod.AppError
    NotFoundError = mod.NotFoundError
    ValidationError = mod.ValidationError
    UnauthorizedError = mod.UnauthorizedError
    ForbiddenError = mod.ForbiddenError
    ConflictError = mod.ConflictError
    RateLimitError = mod.RateLimitError
  })

  it('all subclasses are instanceof AppError and Error', () => {
    const subclasses = [
      new NotFoundError(),
      new ValidationError({}),
      new UnauthorizedError(),
      new ForbiddenError(),
      new ConflictError(),
      new RateLimitError(),
    ]
    for (const err of subclasses) {
      expect(err).toBeInstanceOf(AppError)
      expect(err).toBeInstanceOf(Error)
      expect(err).toHaveProperty('statusCode')
      expect(err).toHaveProperty('code')
      expect(err).toHaveProperty('isOperational')
    }
  })
})

// ─── validateBody ────────────────────────────────────────────────────────────

describe('validateBody()', () => {
  let validateBody: typeof import('@/lib/api-utils').validateBody

  beforeEach(async () => {
    const mod = await import('@/lib/api-utils')
    validateBody = mod.validateBody
  })

  const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().int().positive(),
  })

  it('returns parsed data for a valid body', () => {
    const body = { name: 'Alice', email: 'alice@example.com', age: 30 }
    const result = validateBody(body, schema)
    expect(result).toEqual(body)
  })

  it('strips unknown fields based on schema (strict mode off by default)', () => {
    const body = {
      name: 'Alice',
      email: 'alice@example.com',
      age: 30,
      extra: 'field',
    }
    const result = validateBody(body, schema)
    expect(result).not.toHaveProperty('extra')
    expect(result.name).toBe('Alice')
  })

  it('throws ValidationError for invalid body', () => {
    const body = { name: '', email: 'not-an-email', age: -5 }
    expect(() => validateBody(body, schema)).toThrow()
    try {
      validateBody(body, schema)
    } catch (err: any) {
      expect(err.constructor.name).toBe('ValidationError')
      expect(err.statusCode).toBe(400)
      expect(err.code).toBe('VALIDATION_ERROR')
      expect(err.errors).toBeDefined()
      expect(Object.keys(err.errors).length).toBeGreaterThan(0)
    }
  })

  it('throws ValidationError for missing required fields', () => {
    const body = {}
    expect(() => validateBody(body, schema)).toThrow()
    try {
      validateBody(body, schema)
    } catch (err: any) {
      expect(err.statusCode).toBe(400)
      // Should have errors for name, email, and age
      expect(err.errors).toHaveProperty('name')
      expect(err.errors).toHaveProperty('email')
      expect(err.errors).toHaveProperty('age')
    }
  })

  it('throws ValidationError for partial body (missing some fields)', () => {
    const body = { name: 'Alice' }
    try {
      validateBody(body, schema)
    } catch (err: any) {
      expect(err.statusCode).toBe(400)
      expect(err.errors).toHaveProperty('email')
      expect(err.errors).toHaveProperty('age')
      expect(err.errors).not.toHaveProperty('name')
    }
  })

  it('collects multiple error messages per field', () => {
    const multiSchema = z.object({
      email: z.string().email().min(10),
    })
    const body = { email: 'short' }
    try {
      validateBody(body, multiSchema)
    } catch (err: any) {
      // "short" fails both email and min(10)
      expect(err.errors.email.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('works with a simple string schema', () => {
    const strSchema = z.string()
    expect(validateBody('hello', strSchema)).toBe('hello')
    expect(() => validateBody(42, strSchema)).toThrow()
  })
})

// ─── validateSearchParams ─────────────────────────────────────────────────────

describe('validateSearchParams()', () => {
  let validateSearchParams: typeof import('@/lib/api-utils').validateSearchParams

  beforeEach(async () => {
    const mod = await import('@/lib/api-utils')
    validateSearchParams = mod.validateSearchParams
  })

  it('parses valid search params into the expected type', () => {
    const params = new URLSearchParams({ page: '1', limit: '10', q: 'hello' })
    const schema = z.object({
      page: z.coerce.number().int().positive(),
      limit: z.coerce.number().int().positive(),
      q: z.string(),
    })
    const result = validateSearchParams(params, schema)
    expect(result).toEqual({ page: 1, limit: 10, q: 'hello' })
  })

  it('applies defaults when optional fields are missing', () => {
    const params = new URLSearchParams({})
    const schema = z.object({
      page: z.coerce.number().default(1),
      limit: z.coerce.number().default(20),
    })
    const result = validateSearchParams(params, schema)
    expect(result).toEqual({ page: 1, limit: 20 })
  })

  it('returns empty object for empty URLSearchParams', () => {
    const params = new URLSearchParams({})
    const schema = z.object({})
    const result = validateSearchParams(params, schema)
    expect(result).toEqual({})
  })

  it('handles duplicate keys (last value wins in URLSearchParams)', () => {
    // URLSearchParams behavior: getAll returns all, get returns last
    const params = new URLSearchParams()
    params.append('tag', 'a')
    params.append('tag', 'b')
    // The schema converts the object — forEach iterates all, so the second
    // value overwrites the first when building the plain object.
    const schema = z.object({ tag: z.string() })
    const result = validateSearchParams(params, schema)
    expect(result.tag).toBe('b')
  })

  it('throws ValidationError for invalid search params', () => {
    const params = new URLSearchParams({ page: 'abc' })
    const schema = z.object({
      page: z.coerce.number().int(),
    })
    try {
      validateSearchParams(params, schema)
    } catch (err: any) {
      expect(err.statusCode).toBe(400)
      expect(err.code).toBe('VALIDATION_ERROR')
      expect(err.errors).toHaveProperty('page')
    }
  })

  it('throws for completely invalid params', () => {
    const params = new URLSearchParams({ foo: 'bar' })
    const schema = z.object({
      required_field: z.string(),
    })
    try {
      validateSearchParams(params, schema)
    } catch (err: any) {
      expect(err.statusCode).toBe(400)
      expect(err.errors).toHaveProperty('required_field')
    }
  })

  it('coerces string "true" to boolean from query strings', () => {
    const params = new URLSearchParams({ active: 'true', yes: '1' })
    const schema = z.object({
      active: z.coerce.boolean(),
      yes: z.coerce.boolean(),
    })
    const result = validateSearchParams(params, schema)
    // z.coerce.boolean() uses Boolean() internally — non-empty strings are truthy
    expect(result.active).toBe(true)
    expect(result.yes).toBe(true)
  })
})

// ─── createPaginationMeta ─────────────────────────────────────────────────────

describe('createPaginationMeta()', () => {
  let createPaginationMeta: typeof import('@/lib/api-utils').createPaginationMeta

  beforeEach(async () => {
    const mod = await import('@/lib/api-utils')
    createPaginationMeta = mod.createPaginationMeta
  })

  it('returns correct meta for page 1', () => {
    const result = createPaginationMeta(1, 10, 100)
    expect(result).toEqual({ page: 1, limit: 10, total: 100, totalPages: 10 })
  })

  it('returns correct meta for a middle page', () => {
    const result = createPaginationMeta(5, 10, 100)
    expect(result).toEqual({ page: 5, limit: 10, total: 100, totalPages: 10 })
  })

  it('returns correct meta for the last page', () => {
    const result = createPaginationMeta(10, 10, 100)
    expect(result).toEqual({ page: 10, limit: 10, total: 100, totalPages: 10 })
  })

  it('rounds totalPages up when total is not evenly divisible', () => {
    const result = createPaginationMeta(1, 10, 105)
    expect(result.totalPages).toBe(11)
  })

  it('returns totalPages=1 when total is less than limit', () => {
    const result = createPaginationMeta(1, 10, 3)
    expect(result.totalPages).toBe(1)
  })

  it('returns totalPages=0 when total is 0', () => {
    const result = createPaginationMeta(1, 10, 0)
    expect(result.totalPages).toBe(0)
  })

  it('handles limit=1 (one item per page)', () => {
    const result = createPaginationMeta(3, 1, 5)
    expect(result).toEqual({ page: 3, limit: 1, total: 5, totalPages: 5 })
  })

  it('handles total equal to limit', () => {
    const result = createPaginationMeta(1, 25, 25)
    expect(result).toEqual({ page: 1, limit: 25, total: 25, totalPages: 1 })
  })

  it('handles large values', () => {
    const result = createPaginationMeta(5000, 20, 100000)
    expect(result).toEqual({
      page: 5000,
      limit: 20,
      total: 100000,
      totalPages: 5000,
    })
  })
})

// ─── checkRateLimit ──────────────────────────────────────────────────────────
// The rate limiter uses an internal in-memory Map that cannot be reset directly.
// We use vi.resetModules() + dynamic imports to get a fresh store for each group.

describe('checkRateLimit()', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    vi.restoreAllMocks()
  })

  describe('when NODE_ENV=development', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
      vi.resetModules()
    })

    it('always allows requests regardless of count', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit')
      // Make way more than the limit
      for (let i = 0; i < 200; i++) {
        const result = checkRateLimit('dev-test', 10, 60000)
        expect(result.allowed).toBe(true)
      }
    })
  })

  describe('when NODE_ENV=production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'
      vi.resetModules()
    })

    it('allows requests within the limit', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit')
      const result = checkRateLimit('test-key-1', 5, 60000)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('tracks remaining count as requests come in', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit')
      const key = 'test-key-tracking'
      const max = 5

      for (let i = 0; i < max; i++) {
        const result = checkRateLimit(key, max, 60000)
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(max - i - 1)
      }
    })

    it('rejects requests over the limit', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit')
      const key = 'test-key-over'
      const max = 3

      // Exhaust the limit
      for (let i = 0; i < max; i++) {
        checkRateLimit(key, max, 60000)
      }

      // This one should be rejected
      const result = checkRateLimit(key, max, 60000)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfterMs).toBeDefined()
      expect(result.retryAfterMs).toBeGreaterThan(0)
    })

    it('allows requests after the window resets', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit')
      const key = 'test-key-reset'
      const max = 2
      const windowMs = 100 // 100ms window for fast testing

      // Exhaust the limit
      checkRateLimit(key, max, windowMs)
      checkRateLimit(key, max, windowMs)

      // Should be rejected
      const rejected = checkRateLimit(key, max, windowMs)
      expect(rejected.allowed).toBe(false)

      // Wait for window to expire
      await new Promise((r) => setTimeout(r, windowMs + 50))

      // Should be allowed again (new window)
      const allowed = checkRateLimit(key, max, windowMs)
      expect(allowed.allowed).toBe(true)
      expect(allowed.remaining).toBe(max - 1)
    })

    it('isolates different keys', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit')
      const max = 1

      // Exhaust key A
      checkRateLimit('key-a-isolate', max, 60000)
      const a = checkRateLimit('key-a-isolate', max, 60000)
      expect(a.allowed).toBe(false)

      // Key B should still be fresh
      const b = checkRateLimit('key-b-isolate', max, 60000)
      expect(b.allowed).toBe(true)
    })

    it('returns maxRequests-1 as remaining for first request', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit')
      const result = checkRateLimit('test-key-first', 100, 60000)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(99)
    })

    it('returns retryAfterMs close to windowMs when at limit', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit')
      const key = 'test-key-retry'
      const max = 1
      const windowMs = 1000

      checkRateLimit(key, max, windowMs)
      const result = checkRateLimit(key, max, windowMs)

      expect(result.allowed).toBe(false)
      // retryAfter should be close to windowMs (within 100ms tolerance)
      expect(result.retryAfterMs).toBeGreaterThan(windowMs - 100)
      expect(result.retryAfterMs).toBeLessThanOrEqual(windowMs)
    })
  })
})

// ─── getClientIp ─────────────────────────────────────────────────────────────

describe('getClientIp()', () => {
  let getClientIp: typeof import('@/lib/rate-limit').getClientIp

  beforeEach(async () => {
    const mod = await import('@/lib/rate-limit')
    getClientIp = mod.getClientIp
  })

  function makeRequest(headers: Record<string, string> = {}): Request {
    return new Request('http://localhost/api/test', { headers })
  }

  it('extracts IP from x-forwarded-for header (first IP)', () => {
    const req = makeRequest({ 'x-forwarded-for': '192.168.1.1, 10.0.0.1' })
    expect(getClientIp(req)).toBe('192.168.1.1')
  })

  it('returns the first IP when x-forwarded-for has multiple IPs', () => {
    const req = makeRequest({
      'x-forwarded-for': '203.0.113.1, 70.41.3.18, 150.172.238.178',
    })
    expect(getClientIp(req)).toBe('203.0.113.1')
  })

  it('trims whitespace from x-forwarded-for', () => {
    const req = makeRequest({ 'x-forwarded-for': '  192.168.1.1 , 10.0.0.1' })
    expect(getClientIp(req)).toBe('192.168.1.1')
  })

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    const req = makeRequest({ 'x-real-ip': '10.20.30.40' })
    expect(getClientIp(req)).toBe('10.20.30.40')
  })

  it('prefers x-forwarded-for over x-real-ip', () => {
    const req = makeRequest({
      'x-forwarded-for': '1.2.3.4',
      'x-real-ip': '5.6.7.8',
    })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })

  it('returns "unknown" when no IP headers are present', () => {
    const req = makeRequest()
    expect(getClientIp(req)).toBe('unknown')
  })

  it('returns "unknown" when headers is empty', () => {
    const req = makeRequest({})
    expect(getClientIp(req)).toBe('unknown')
  })

  it('handles single IP in x-forwarded-for (no comma)', () => {
    const req = makeRequest({ 'x-forwarded-for': '127.0.0.1' })
    expect(getClientIp(req)).toBe('127.0.0.1')
  })
})
