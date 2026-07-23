import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { apiSuccess, withErrorHandling } from '@/lib/errors'
import { z } from 'zod'

const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  bestseller: z.coerce.boolean().optional(),
  sort: z.enum(['newest', 'oldest', 'price-asc', 'price-desc']).default('newest'),
})

const createProductSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  subtitle: z.string().min(1).max(500),
  description: z.string().min(1),
  price: z.number().int().min(0),
  originalPrice: z.number().int().min(0).optional().nullable(),
  image: z.string().url().optional().nullable(),
  features: z.array(z.string()).default([]),
  bestseller: z.boolean().default(false),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const query = productQuerySchema.parse(Object.fromEntries(searchParams))

    const where = {
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.featured !== undefined && { featured: query.featured }),
      ...(query.bestseller !== undefined && { bestseller: query.bestseller }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' as const } },
          { description: { contains: query.search, mode: 'insensitive' as const } },
          { subtitle: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const orderBy = (() => {
      switch (query.sort) {
        case 'price-asc':
          return { price: 'asc' as const }
        case 'price-desc':
          return { price: 'desc' as const }
        case 'oldest':
          return { createdAt: 'asc' as const }
        default:
          return { createdAt: 'desc' as const }
      }
    })()

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.product.count({ where }),
    ])

    return apiSuccess({
      products,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    })
  })
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireAdmin()

    const body = await request.json()
    const data = createProductSchema.parse(body)

    // Check if slug already exists
    const existing = await prisma.product.findUnique({ where: { slug: data.slug } })
    if (existing) {
      return apiSuccess({
        error: 'A product with this slug already exists',
      }, 400)
    }

    const product = await prisma.product.create({
      data: {
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        coverImage: data.image,
        tags: data.features,
        isFeatured: data.featured,
        isActive: data.isActive,
      },
    })

    return apiSuccess(product, 201)
  })
}