import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ success: true, data: logs })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch audit logs'
    return NextResponse.json({ success: false, error: { code: 'AUDIT_ERROR', message } }, { status: 500 })
  }
}