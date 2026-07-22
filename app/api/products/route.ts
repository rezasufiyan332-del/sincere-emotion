import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSearchParams } from '@/lib/api-utils'
import { productQuerySchema } from '@/lib/schemas'
import { apiSuccess, withErrorHandling } from '@/lib/errors'
import { createPaginationMeta } from '@/lib/api-utils'

export const revalidate = 60 // ISR: revalidate every 60 seconds

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    try {
      const { searchParams } = new URL(request.url)
      const query = validateSearchParams(searchParams, productQuerySchema)

      const where = {
        active: query.active,
        ...(query.bestseller !== undefined && { bestseller: query.bestseller }),
        ...(query.featured !== undefined && { featured: query.featured }),
        ...(query.search && {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' as const } },
            { description: { contains: query.search, mode: 'insensitive' as const } },
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

      // PERFORMANCE: Only select fields needed by frontend
      const select = {
        id: true,
        name: true,
        slug: true,
        subtitle: true,
        description: true,
        price: true,
        originalPrice: true,
        image: true,
        features: true,
        bestseller: true,
        featured: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          select,
        }),
        prisma.product.count({ where }),
      ])

      // Return data object for withErrorHandling to wrap with apiSuccess
      return {
        data: {
          products,
          meta: createPaginationMeta(query.page, query.limit, total),
        },
        status: 200,
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('DATABASE_URL')) {
        return {
          error: {
            message: 'Database not configured. Contact support or check environment variables.',
            code: 'DB_NOT_CONFIGURED',
          },
          status: 503, // Service Unavailable
        }
      }
      throw error // Re-throw other errors for withErrorHandling
    }
  })
}
