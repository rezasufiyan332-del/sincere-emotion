import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { apiSuccess, withErrorHandling, NotFoundError } from '@/lib/errors'
import { z } from 'zod'

const updateProductSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  subtitle: z.string().min(1).max(500).optional(),
  description: z.string().min(1).optional(),
  price: z.number().int().min(0).optional(),
  originalPrice: z.number().int().min(0).optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await requireAdmin()

    const { id } = await params
    const product = await prisma.product.findUnique({ where: { id } })

    if (!product) {
      throw new NotFoundError('Product')
    }

    return apiSuccess(product)
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await requireAdmin()

    const { id } = await params
    const body = await request.json()
    const data = updateProductSchema.parse(body)

    // Check slug uniqueness if provided
    if (data.slug) {
      const existing = await prisma.product.findFirst({
        where: { slug: data.slug, NOT: { id } },
      })
      if (existing) {
        return apiSuccess({
          error: 'A product with this slug already exists',
        }, 400)
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        coverImage: data.coverImage,
        tags: data.tags,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
      },
    })

    return apiSuccess(product)
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await requireAdmin()

    const { id } = await params
    await prisma.product.delete({ where: { id } })

    return apiSuccess({ success: true })
  })
}