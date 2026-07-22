import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { validateSearchParams } from '@/lib/api-utils'
import { z } from 'zod'
import { apiSuccess, withErrorHandling } from '@/lib/errors'

const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']).optional(),
  sort: z.enum(['newest', 'oldest', 'total-asc', 'total-desc']).default('newest'),
})

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const query = validateSearchParams(searchParams, orderQuerySchema)

    const where = {
      ...(query.search && {
        OR: [
          { id: { contains: query.search, mode: 'insensitive' as const } },
          { email: { contains: query.search, mode: 'insensitive' as const } },
          { name: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
      ...(query.status && { status: query.status }),
    }

    const orderBy = (() => {
      switch (query.sort) {
        case 'total-asc':
          return { total: 'asc' as const }
        case 'total-desc':
          return { total: 'desc' as const }
        case 'oldest':
          return { createdAt: 'asc' as const }
        default:
          return { createdAt: 'desc' as const }
      }
    })()

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.order.count({ where }),
    ])

    const totalPages = Math.ceil(total / query.limit)

    return apiSuccess({
      orders,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    })
  })
}