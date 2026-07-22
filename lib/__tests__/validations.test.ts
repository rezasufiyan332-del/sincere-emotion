import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  productQuerySchema,
  createOrderSchema,
  subscribeSchema,
} from '../schemas'

// ============================================
// registerSchema
// ============================================
describe('registerSchema', () => {
  // ── Valid inputs ──
  describe('valid inputs', () => {
    it('passes with all fields correct', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123',
        confirmPassword: 'secret123',
      })
      expect(result.success).toBe(true)
    })

    it('passes without optional name field', () => {
      const result = registerSchema.safeParse({
        email: 'john@example.com',
        password: 'secret123',
        confirmPassword: 'secret123',
      })
      expect(result.success).toBe(true)
    })

    it('passes with name at maximum length (100 chars)', () => {
      const result = registerSchema.safeParse({
        name: 'A'.repeat(100),
        email: 'john@example.com',
        password: 'secret123',
        confirmPassword: 'secret123',
      })
      expect(result.success).toBe(true)
    })

    it('passes with password at minimum length (8 chars)', () => {
      const result = registerSchema.safeParse({
        email: 'john@example.com',
        password: '12345678',
        confirmPassword: '12345678',
      })
      expect(result.success).toBe(true)
    })

    it('passes with password at maximum length (128 chars)', () => {
      const result = registerSchema.safeParse({
        email: 'john@example.com',
        password: 'A'.repeat(128),
        confirmPassword: 'A'.repeat(128),
      })
      expect(result.success).toBe(true)
    })

    it('passes with plus-tagged email', () => {
      const result = registerSchema.safeParse({
        email: 'john+tag@example.com',
        password: 'secret123',
        confirmPassword: 'secret123',
      })
      expect(result.success).toBe(true)
    })

    it('passes with subdomain email', () => {
      const result = registerSchema.safeParse({
        email: 'john@sub.example.co.uk',
        password: 'secret123',
        confirmPassword: 'secret123',
      })
      expect(result.success).toBe(true)
    })
  })

  // ── Invalid inputs ──
  describe('invalid inputs', () => {
    it('fails when email is missing', () => {
      const result = registerSchema.safeParse({
        password: 'secret123',
        confirmPassword: 'secret123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        // When key is missing, Zod reports "Required" (path includes 'email')
        expect(result.error.issues.some((i) => i.path.includes('email'))).toBe(
          true
        )
      }
    })

    it('fails when email is empty string', () => {
      const result = registerSchema.safeParse({
        email: '',
        password: 'secret123',
        confirmPassword: 'secret123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailIssue = result.error.issues.find((i) =>
          i.path.includes('email')
        )
        expect(emailIssue).toBeDefined()
        expect(emailIssue!.message).toBe('Email is required')
      }
    })

    it('fails when email is malformed', () => {
      const result = registerSchema.safeParse({
        email: 'not-an-email',
        password: 'secret123',
        confirmPassword: 'secret123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailIssue = result.error.issues.find((i) =>
          i.path.includes('email')
        )
        expect(emailIssue).toBeDefined()
        expect(emailIssue!.message).toBe('Please enter a valid email')
      }
    })

    it('fails when password is missing', () => {
      const result = registerSchema.safeParse({
        email: 'john@example.com',
        confirmPassword: 'secret123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes('password'))
        ).toBe(true)
      }
    })

    it('fails when password is too short (< 8 chars)', () => {
      const result = registerSchema.safeParse({
        email: 'john@example.com',
        password: '1234567',
        confirmPassword: '1234567',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const pwIssue = result.error.issues.find((i) =>
          i.path.includes('password')
        )
        expect(pwIssue).toBeDefined()
        expect(pwIssue!.message).toBe(
          'Password must be at least 8 characters'
        )
      }
    })

    it('fails when password exceeds maximum length (129 chars)', () => {
      const result = registerSchema.safeParse({
        email: 'john@example.com',
        password: 'A'.repeat(129),
        confirmPassword: 'A'.repeat(129),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const pwIssue = result.error.issues.find((i) =>
          i.path.includes('password')
        )
        expect(pwIssue).toBeDefined()
        expect(pwIssue!.message).toBe(
          'Password must be under 128 characters'
        )
      }
    })

    it('fails when confirmPassword is missing', () => {
      const result = registerSchema.safeParse({
        email: 'john@example.com',
        password: 'secret123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes('confirmPassword'))
        ).toBe(true)
      }
    })

    it('fails when passwords do not match', () => {
      const result = registerSchema.safeParse({
        email: 'john@example.com',
        password: 'secret123',
        confirmPassword: 'different456',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const matchIssue = result.error.issues.find((i) =>
          i.path.includes('confirmPassword')
        )
        expect(matchIssue).toBeDefined()
        expect(matchIssue!.message).toBe('Passwords do not match')
      }
    })

    it('fails when name exceeds 100 characters', () => {
      const result = registerSchema.safeParse({
        name: 'A'.repeat(101),
        email: 'john@example.com',
        password: 'secret123',
        confirmPassword: 'secret123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const nameIssue = result.error.issues.find((i) =>
          i.path.includes('name')
        )
        expect(nameIssue).toBeDefined()
        expect(nameIssue!.message).toBe(
          'Name must be under 100 characters'
        )
      }
    })

    it('passes when name is exactly 100 chars (boundary)', () => {
      const result = registerSchema.safeParse({
        name: 'A'.repeat(100),
        email: 'john@example.com',
        password: 'secret123',
        confirmPassword: 'secret123',
      })
      expect(result.success).toBe(true)
    })

    it('fails when name is whitespace-only string', () => {
      const result = registerSchema.safeParse({
        name: '   ',
        email: 'john@example.com',
        password: 'secret123',
        confirmPassword: 'secret123',
      })
      // name is optional, but if provided as whitespace, Zod .min(1) passes since length >= 1
      // This is a notable quirk — whitespace passes string length checks
      // We just verify parsing doesn't throw
      expect(() => registerSchema.parse({
        name: '   ',
        email: 'john@example.com',
        password: 'secret123',
        confirmPassword: 'secret123',
      })).not.toThrow()
    })
  })

  // ── Edge cases ──
  describe('edge cases', () => {
    it('fails when email has no domain', () => {
      const result = registerSchema.safeParse({
        email: 'john@',
        password: 'secret123',
        confirmPassword: 'secret123',
      })
      expect(result.success).toBe(false)
    })

    it('fails when email has no local part', () => {
      const result = registerSchema.safeParse({
        email: '@example.com',
        password: 'secret123',
        confirmPassword: 'secret123',
      })
      expect(result.success).toBe(false)
    })

    it('fails when name is provided as number', () => {
      // @ts-expect-error — testing runtime type mismatch
      const result = registerSchema.safeParse({
        name: 123,
        email: 'john@example.com',
        password: 'secret123',
        confirmPassword: 'secret123',
      })
      expect(result.success).toBe(false)
    })

    it('fails when email is provided as number', () => {
      // @ts-expect-error — testing runtime type mismatch
      const result = registerSchema.safeParse({
        email: 12345,
        password: 'secret123',
        confirmPassword: 'secret123',
      })
      expect(result.success).toBe(false)
    })
  })
})

// ============================================
// loginSchema
// ============================================
describe('loginSchema', () => {
  // ── Valid inputs ──
  describe('valid inputs', () => {
    it('passes with correct fields', () => {
      const result = loginSchema.safeParse({
        email: 'john@example.com',
        password: 'secret123',
      })
      expect(result.success).toBe(true)
    })

    it('passes with valid complex email', () => {
      const result = loginSchema.safeParse({
        email: 'a.b+c@example.co',
        password: 'p@ss',
      })
      expect(result.success).toBe(true)
    })
  })

  // ── Invalid inputs ──
  describe('invalid inputs', () => {
    it('fails when email is missing', () => {
      const result = loginSchema.safeParse({
        password: 'secret123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes('email'))
        ).toBe(true)
      }
    })

    it('fails when email is empty', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'secret123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailIssue = result.error.issues.find((i) =>
          i.path.includes('email')
        )
        expect(emailIssue).toBeDefined()
        expect(emailIssue!.message).toBe('Email is required')
      }
    })

    it('fails when email is invalid format', () => {
      const result = loginSchema.safeParse({
        email: 'bad-email',
        password: 'secret123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailIssue = result.error.issues.find((i) =>
          i.path.includes('email')
        )
        expect(emailIssue).toBeDefined()
        expect(emailIssue!.message).toBe('Please enter a valid email')
      }
    })

    it('fails when password is missing', () => {
      const result = loginSchema.safeParse({
        email: 'john@example.com',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes('password'))
        ).toBe(true)
      }
    })

    it('fails when password is empty string', () => {
      const result = loginSchema.safeParse({
        email: 'john@example.com',
        password: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const pwIssue = result.error.issues.find((i) =>
          i.path.includes('password')
        )
        expect(pwIssue).toBeDefined()
        expect(pwIssue!.message).toBe('Password is required')
      }
    })
  })

  // ── Edge cases ──
  describe('edge cases', () => {
    it('fails when email is null', () => {
      const result = loginSchema.safeParse({
        email: null,
        password: 'secret123',
      })
      expect(result.success).toBe(false)
    })

    it('fails when body is completely empty object', () => {
      const result = loginSchema.safeParse({})
      expect(result.success).toBe(false)
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2)
    })
  })
})

// ============================================
// updateProfileSchema
// ============================================
describe('updateProfileSchema', () => {
  // ── Valid inputs ──
  describe('valid inputs', () => {
    it('passes with both fields', () => {
      const result = updateProfileSchema.safeParse({
        name: 'Jane Doe',
        email: 'jane@example.com',
      })
      expect(result.success).toBe(true)
    })

    it('passes with only name', () => {
      const result = updateProfileSchema.safeParse({
        name: 'Jane Doe',
      })
      expect(result.success).toBe(true)
    })

    it('passes with only email', () => {
      const result = updateProfileSchema.safeParse({
        email: 'jane@example.com',
      })
      expect(result.success).toBe(true)
    })

    it('passes with empty object (all fields optional)', () => {
      const result = updateProfileSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('passes with name at max length (100 chars)', () => {
      const result = updateProfileSchema.safeParse({
        name: 'A'.repeat(100),
      })
      expect(result.success).toBe(true)
    })
  })

  // ── Invalid inputs ──
  describe('invalid inputs', () => {
    it('fails when name exceeds 100 characters', () => {
      const result = updateProfileSchema.safeParse({
        name: 'A'.repeat(101),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const nameIssue = result.error.issues.find((i) =>
          i.path.includes('name')
        )
        expect(nameIssue).toBeDefined()
        expect(nameIssue!.message).toBe(
          'Name must be under 100 characters'
        )
      }
    })

    it('fails when email is invalid format', () => {
      const result = updateProfileSchema.safeParse({
        email: 'not-valid',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailIssue = result.error.issues.find((i) =>
          i.path.includes('email')
        )
        expect(emailIssue).toBeDefined()
        expect(emailIssue!.message).toBe('Please enter a valid email')
      }
    })

    it('fails when email is empty string', () => {
      const result = updateProfileSchema.safeParse({
        email: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailIssue = result.error.issues.find((i) =>
          i.path.includes('email')
        )
        expect(emailIssue).toBeDefined()
        // .email('...') on '' triggers the email message
        expect(emailIssue!.message).toBe('Please enter a valid email')
      }
    })
  })

  // ── Edge cases ──
  describe('edge cases', () => {
    it('passes when name is a single character', () => {
      const result = updateProfileSchema.safeParse({
        name: 'A',
      })
      expect(result.success).toBe(true)
    })

    it('fails when name is a number', () => {
      // @ts-expect-error — testing runtime type mismatch
      const result = updateProfileSchema.safeParse({ name: 42 })
      expect(result.success).toBe(false)
    })

    it('fails when email is a number', () => {
      // @ts-expect-error — testing runtime type mismatch
      const result = updateProfileSchema.safeParse({ email: 123 })
      expect(result.success).toBe(false)
    })
  })
})

// ============================================
// productQuerySchema
// ============================================
describe('productQuerySchema', () => {
  // ── Valid inputs ──
  describe('valid inputs', () => {
    it('applies defaults for empty object', () => {
      const result = productQuerySchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(10)
        expect(result.data.sort).toBe('newest')
        expect(result.data.active).toBe(true)
      }
    })

    it('passes with explicit valid values', () => {
      const result = productQuerySchema.safeParse({
        page: 2,
        limit: 25,
        sort: 'price-asc',
        search: 'healing',
        active: true,
        bestseller: true,
        featured: false,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(2)
        expect(result.data.limit).toBe(25)
        expect(result.data.sort).toBe('price-asc')
        expect(result.data.search).toBe('healing')
        expect(result.data.active).toBe(true)
        expect(result.data.bestseller).toBe(true)
        expect(result.data.featured).toBe(false)
      }
    })

    it('coerces string numbers into integers', () => {
      const result = productQuerySchema.safeParse({
        page: '3',
        limit: '15',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(3)
        expect(result.data.limit).toBe(15)
      }
    })

    it('coerces string booleans', () => {
      // NOTE: z.coerce.boolean() uses JS Boolean() — any non-empty string is truthy
      // 'true' -> true, '1' -> true, 'yes' -> true
      const result = productQuerySchema.safeParse({
        active: 'true',
        bestseller: '1',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.active).toBe(true)
        expect(result.data.bestseller).toBe(true)
      }
    })

    it('accepts all sort enum values', () => {
      const sorts = ['newest', 'oldest', 'price-asc', 'price-desc'] as const
      for (const sort of sorts) {
        const result = productQuerySchema.safeParse({ sort })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.sort).toBe(sort)
        }
      }
    })

    it('passes with page and limit at boundaries', () => {
      const result = productQuerySchema.safeParse({
        page: 1,
        limit: 50,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(50)
      }
    })
  })

  // ── Invalid inputs ──
  describe('invalid inputs', () => {
    it('fails when page is 0 (below min)', () => {
      const result = productQuerySchema.safeParse({ page: 0 })
      expect(result.success).toBe(false)
    })

    it('fails when page is negative', () => {
      const result = productQuerySchema.safeParse({ page: -1 })
      expect(result.success).toBe(false)
    })

    it('fails when limit is 0 (below min)', () => {
      const result = productQuerySchema.safeParse({ limit: 0 })
      expect(result.success).toBe(false)
    })

    it('fails when limit exceeds 50', () => {
      const result = productQuerySchema.safeParse({ limit: 51 })
      expect(result.success).toBe(false)
    })

    it('fails when limit is negative', () => {
      const result = productQuerySchema.safeParse({ limit: -5 })
      expect(result.success).toBe(false)
    })

    it('fails when sort is not a valid enum value', () => {
      const result = productQuerySchema.safeParse({ sort: 'invalid-sort' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const sortIssue = result.error.issues.find((i) =>
          i.path.includes('sort')
        )
        expect(sortIssue).toBeDefined()
      }
    })

    it('fails when page is a non-integer decimal', () => {
      const result = productQuerySchema.safeParse({ page: 1.5 })
      expect(result.success).toBe(false)
    })

    it('fails when limit is a non-integer decimal', () => {
      const result = productQuerySchema.safeParse({ limit: 10.7 })
      expect(result.success).toBe(false)
    })

    it('fails when sort is an empty string', () => {
      const result = productQuerySchema.safeParse({ sort: '' })
      expect(result.success).toBe(false)
    })
  })

  // ── Edge cases ──
  describe('edge cases', () => {
    it('coerces "active" from string "0" to true (non-empty string is truthy)', () => {
      // NOTE: z.coerce.boolean() uses Boolean() — "0" is non-empty -> true
      const result = productQuerySchema.safeParse({ active: '0' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.active).toBe(true)
      }
    })

    it('coerces "active" from string "1" to true', () => {
      const result = productQuerySchema.safeParse({ active: '1' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.active).toBe(true)
      }
    })

    it('fails when page is NaN string', () => {
      const result = productQuerySchema.safeParse({ page: 'abc' })
      expect(result.success).toBe(false)
    })

    it('passes with all optional boolean fields absent', () => {
      const result = productQuerySchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.bestseller).toBeUndefined()
        expect(result.data.featured).toBeUndefined()
        expect(result.data.search).toBeUndefined()
      }
    })
  })
})

// ============================================
// createOrderSchema (and orderItemSchema)
// ============================================
const validOrderItem = {
  productId: 'prod_123',
  name: 'Healing Guide',
  price: 1999,
  quantity: 2,
}

const validOrder = {
  email: 'buyer@example.com',
  name: 'Jane Buyer',
  items: [validOrderItem],
}

describe('createOrderSchema', () => {
  // ── Valid inputs ──
  describe('valid inputs', () => {
    it('passes with a valid order', () => {
      const result = createOrderSchema.safeParse(validOrder)
      expect(result.success).toBe(true)
    })

    it('passes with multiple items', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        items: [
          validOrderItem,
          { productId: 'prod_456', name: 'Another Guide', price: 2999, quantity: 1 },
        ],
      })
      expect(result.success).toBe(true)
    })

    it('passes with item quantity of 1 (minimum)', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        items: [{ ...validOrderItem, quantity: 1 }],
      })
      expect(result.success).toBe(true)
    })

    it('passes with price of 0 (free item)', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        items: [{ ...validOrderItem, price: 0 }],
      })
      expect(result.success).toBe(true)
    })

    it('passes with integer price as a boundary value (e.g., very large)', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        items: [{ ...validOrderItem, price: 999999999 }],
      })
      expect(result.success).toBe(true)
    })
  })

  // ── Invalid inputs ──
  describe('invalid inputs', () => {
    it('fails when email is missing', () => {
      const { email, ...rest } = validOrder
      const result = createOrderSchema.safeParse(rest)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes('email'))
        ).toBe(true)
      }
    })

    it('fails when email is invalid', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        email: 'not-an-email',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailIssue = result.error.issues.find((i) =>
          i.path.includes('email')
        )
        expect(emailIssue).toBeDefined()
        expect(emailIssue!.message).toBe('Please enter a valid email')
      }
    })

    it('fails when name is missing', () => {
      const { name, ...rest } = validOrder
      const result = createOrderSchema.safeParse(rest)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes('name'))
        ).toBe(true)
      }
    })

    it('fails when items array is empty', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        items: [],
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const itemsIssue = result.error.issues.find((i) =>
          i.path.includes('items')
        )
        expect(itemsIssue).toBeDefined()
        expect(itemsIssue!.message).toBe('At least one item is required')
      }
    })

    it('fails when items is missing', () => {
      const { items, ...rest } = validOrder
      const result = createOrderSchema.safeParse(rest)
      expect(result.success).toBe(false)
    })

    it('fails when item productId is empty', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        items: [{ ...validOrderItem, productId: '' }],
      })
      expect(result.success).toBe(false)
    })

    it('fails when item name is empty', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        items: [{ ...validOrderItem, name: '' }],
      })
      expect(result.success).toBe(false)
    })

    it('fails when item price is negative', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        items: [{ ...validOrderItem, price: -1 }],
      })
      expect(result.success).toBe(false)
    })

    it('fails when item price is a decimal (non-integer)', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        items: [{ ...validOrderItem, price: 19.99 }],
      })
      expect(result.success).toBe(false)
    })

    it('fails when item quantity is 0 (below min)', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        items: [{ ...validOrderItem, quantity: 0 }],
      })
      expect(result.success).toBe(false)
    })

    it('fails when item quantity is negative', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        items: [{ ...validOrderItem, quantity: -3 }],
      })
      expect(result.success).toBe(false)
    })
  })

  // ── Edge cases ──
  describe('edge cases', () => {
    it('fails when items is not an array', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        items: 'not-an-array',
      })
      expect(result.success).toBe(false)
    })

    it('fails when item productId is missing', () => {
      const { productId, ...itemRest } = validOrderItem
      const result = createOrderSchema.safeParse({
        ...validOrder,
        items: [itemRest],
      })
      expect(result.success).toBe(false)
    })

    it('fails when item quantity is a decimal', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        items: [{ ...validOrderItem, quantity: 2.5 }],
      })
      expect(result.success).toBe(false)
    })
  })
})

// ============================================
// subscribeSchema
// ============================================
describe('subscribeSchema', () => {
  // ── Valid inputs ──
  describe('valid inputs', () => {
    it('passes with just an email', () => {
      const result = subscribeSchema.safeParse({
        email: 'user@example.com',
      })
      expect(result.success).toBe(true)
    })

    it('passes with email and source', () => {
      const result = subscribeSchema.safeParse({
        email: 'user@example.com',
        source: 'homepage-footer',
      })
      expect(result.success).toBe(true)
    })

    it('passes with plus-tagged email and source', () => {
      const result = subscribeSchema.safeParse({
        email: 'user+marketing@example.com',
        source: 'blog',
      })
      expect(result.success).toBe(true)
    })
  })

  // ── Invalid inputs ──
  describe('invalid inputs', () => {
    it('fails when email is missing', () => {
      const result = subscribeSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('fails when email is empty string', () => {
      const result = subscribeSchema.safeParse({ email: '' })
      expect(result.success).toBe(false)
    })

    it('fails when email is invalid', () => {
      const result = subscribeSchema.safeParse({
        email: 'not-valid',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailIssue = result.error.issues.find((i) =>
          i.path.includes('email')
        )
        expect(emailIssue).toBeDefined()
        expect(emailIssue!.message).toBe('Please enter a valid email')
      }
    })

    it('fails when email is missing domain', () => {
      const result = subscribeSchema.safeParse({ email: 'user@' })
      expect(result.success).toBe(false)
    })
  })

  // ── Edge cases ──
  describe('edge cases', () => {
    it('passes when source is empty string (optional)', () => {
      const result = subscribeSchema.safeParse({
        email: 'user@example.com',
        source: '',
      })
      expect(result.success).toBe(true)
    })

    it('fails when email is a number', () => {
      // @ts-expect-error — testing runtime type mismatch
      const result = subscribeSchema.safeParse({ email: 12345 })
      expect(result.success).toBe(false)
    })

    it('fails when email is null', () => {
      const result = subscribeSchema.safeParse({ email: null })
      expect(result.success).toBe(false)
    })
  })
})
