import { z } from 'zod'

// ============================================
// Shared Validation Primitives
// ============================================

export const emailSchema = z
  .string()
  .email('Please enter a valid email')
  .toLowerCase()
  .max(255, 'Email must be less than 255 characters')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .trim()

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    name: nameSchema.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
})

// ============================================
// Profile Schemas
// ============================================

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
})

// ============================================
// Product Schemas
// ============================================

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().positive(),
  quantity: z.number().int().nonnegative(),
  image: z.string().optional(),
  subtitle: z.string().optional(),
})

export const createProductSchema = z.object({
  name: nameSchema,
  slug: z.string().min(1).max(200).optional(),
  price: z.number().int().positive('Price must be greater than 0'),
  description: z.string().min(10).max(1000),
  features: z.array(z.string()).optional(),
  image: z.string().url().optional(),
  subtitle: z.string().max(200).optional(),
  active: z.boolean().default(true),
})

export const updateProductSchema = createProductSchema.partial()

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sort: z
    .enum(['newest', 'oldest', 'price-asc', 'price-desc'])
    .default('newest'),
  search: z.string().optional(),
  slug: z.string().optional(),
  active: z.coerce.boolean().default(true),
  bestseller: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
})

// ============================================
// Order / Checkout Schemas
// ============================================

export const checkoutItemSchema = z.object({
  productId: z.string().min(1, 'Product ID required'),
  name: z.string().min(1),
  quantity: z.number().int().positive('Quantity must be at least 1').max(10, 'Max quantity is 10'),
  image: z.string().optional(),
  subtitle: z.string().optional(),
})

export const checkoutSchema = z.object({
  items: z
    .array(checkoutItemSchema)
    .min(1, 'Cart must have at least one item')
    .max(20, 'Cart cannot exceed 20 items'),
  email: emailSchema,
  name: nameSchema,
  phone: z.string().min(10, 'Phone number required for payment').max(15).optional(),
})

export const createOrderSchema = z.object({
  email: emailSchema,
  name: z.string().min(1, 'Name is required'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        name: z.string().min(1),
        price: z.number().int().min(0),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, 'At least one item is required'),
})

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(100).optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
  sort: z.enum(['created', 'total']).default('created'),
})

// ============================================
// Newsletter Schemas
// ============================================

export const subscribeSchema = z.object({
  email: emailSchema,
  source: z.string().optional(),
})

export const newsletterSchema = z.object({
  email: emailSchema,
})

export const unsubscribeSchema = z.object({
  token: z.string().min(1, 'Unsubscribe token required'),
})

// ============================================
// 2FA Schemas
// ============================================

export const verify2faSchema = z.object({
  token: z.string().regex(/^\d{6}$/, '2FA code must be exactly 6 digits'),
})

// ============================================
// Query / Pagination Schemas
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const searchSchema = paginationSchema.extend({
  q: z.string().max(100).optional(),
})

// ============================================
// Session Schemas
// ============================================

export const sessionSchema = z.object({
  token: z.string().min(1),
  expiresAt: z.date(),
})

// ============================================
// Exported Types
// ============================================

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type ProductInput = z.infer<typeof createProductSchema>
export type ProductQueryInput = z.infer<typeof productQuerySchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type SubscribeInput = z.infer<typeof subscribeSchema>
export type Verify2faInput = z.infer<typeof verify2faSchema>
export type OrderQueryInput = z.infer<typeof orderQuerySchema>
