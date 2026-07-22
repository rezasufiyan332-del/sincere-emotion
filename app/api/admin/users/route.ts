import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { apiSuccess, withErrorHandling } from '@/lib/errors'
import { z } from 'zod'

const userQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  sort: z.enum(['newest', 'oldest', 'name-asc', 'name-desc']).default('newest'),
})

const updateUserSchema = z.object({
  id: z.string().cuid(),
  name: z.string().max(100).optional().nullable(),
  email: z.string().email().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
})

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const query = userQuerySchema.parse(Object.fromEntries(searchParams))

    const where = {
      ...(query.role && { role: query.role }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { email: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const orderBy = (() => {
      switch (query.sort) {
        case 'name-asc':
          return { name: 'asc' as const }
        case 'name-desc':
          return { name: 'desc' as const }
        case 'oldest':
          return { createdAt: 'asc' as const }
        default:
          return { createdAt: 'desc' as const }
      }
    })()

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ])

    const totalPages = Math.ceil(total / query.limit)

    return apiSuccess({
      users,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    })
  })
}

export async function PATCH(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireAdmin()

    const body = await request.json()
    const { id, ...data } = updateUserSchema.parse(body)

    if (!id) {
      return apiSuccess({ error: 'User ID is required' }, 400)
    }

    // Check email uniqueness if provided
    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email.toLowerCase(), NOT: { id } },
      })
      if (existing) {
        return apiSuccess({ error: 'Email already in use' }, 400)
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email.toLowerCase() }),
        ...(data.role !== undefined && { role: data.role }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    return apiSuccess(user)
  })
}