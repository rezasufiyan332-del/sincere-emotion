import { prisma } from '@/lib/prisma'
import { apiSuccess, withErrorHandling } from '@/lib/errors'

export async function GET() {
  return withErrorHandling(async () => {
    await prisma.$queryRaw`SELECT 1`

    return apiSuccess({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    })
  })
}
