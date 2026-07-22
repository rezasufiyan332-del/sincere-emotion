import { prisma } from '@/lib/prisma'

export async function logAdminAction(
  adminId: string,
  adminEmail: string,
  action: string,
  targetType: string,
  targetId?: string,
  details?: Record<string, unknown>
) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId,
        adminEmail,
        action,
        targetType,
        targetId,
        details: (details as unknown) || undefined,
      },
    })
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error('Failed to log admin action:', error)
  }
}
