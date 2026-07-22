import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateBody } from '@/lib/api-utils'
import { z } from 'zod'
import { apiSuccess, withErrorHandling, UnauthorizedError, ConflictError } from '@/lib/errors'
import { verifyPassword, hashPassword } from '@/lib/auth'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be under 128 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export async function PATCH(request: NextRequest) {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    if (!user) throw new UnauthorizedError()

    const body = await request.json()
    const data = validateBody(body, changePasswordSchema)

    // Verify current password
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser) throw new UnauthorizedError()

    // OAuth users without password cannot change password
    if (!dbUser.passwordHash) {
      throw new ConflictError('OAuth users cannot change password')
    }

    const isValid = await verifyPassword(data.currentPassword, dbUser.passwordHash)
    if (!isValid) {
      throw new ConflictError('Current password is incorrect')
    }

    // Check if new password is different from current
    const samePassword = await verifyPassword(data.newPassword, dbUser.passwordHash!)
    if (samePassword) {
      throw new ConflictError('New password must be different from current password')
    }

    const passwordHash = await hashPassword(data.newPassword)

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    return apiSuccess({ message: 'Password changed successfully' })
  })
}