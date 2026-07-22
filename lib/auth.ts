import { prisma } from './prisma'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { UnauthorizedError, ConflictError, NotFoundError, ForbiddenError } from './errors'
import type { RegisterInput, LoginInput } from './schemas'
import {
  generateTOTPSecret,
  generateTOTPQRCodeURL,
  generateBackupCodes,
  verifyTOTPToken,
} from './totp'

const SESSION_EXPIRY_DAYS = 30
const SESSION_COOKIE_NAME = 'session-token'
const TEMP_TOKEN_EXPIRY_MINUTES = 5

// ============================================
// Password Helpers
// ============================================

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ============================================
// Session Management
// ============================================

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID()
  const expires = new Date()
  expires.setDate(expires.getDate() + SESSION_EXPIRY_DAYS)

  try {
    await prisma.session.create({
      data: {
        userId,
        sessionToken: token,
        expires,
      },
    })
  } catch {
    // Database unavailable — still set cookie for UX
  }

  // Cookie is set by the API route using response.cookies.set()
  // This avoids conflicts between cookies().set() and NextResponse

  return token
}

export async function rotateSession(userId: string): Promise<string> {
  // Delete all existing sessions for this user
  await prisma.session.deleteMany({ where: { userId } })
  // Create fresh session
  return createSession(userId)
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null

  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    })

    if (!session || session.expires < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
      }
      return null
    }

    // Check if session expires within 7 days
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    const sessionExpiringSoon = session.expires < sevenDaysFromNow

    return { ...session, sessionExpiringSoon, twoFactorVerified: false }
  } catch {
    return null
  }
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new UnauthorizedError('Please log in to continue')
  }
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  if (session.user.role !== 'ADMIN') {
    throw new ForbiddenError('Admin access required')
  }
  return session
}

export async function deleteSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (token) {
    await prisma.session.deleteMany({ where: { sessionToken: token } })
  }
  cookieStore.delete(SESSION_COOKIE_NAME)
}

// ============================================
// Auth Operations
// ============================================

export async function register(data: RegisterInput) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })

    if (existingUser) {
      throw new ConflictError('An account with this email already exists')
    }

    const passwordHash = await hashPassword(data.password)

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name || null,
      },
    })

    const token = await createSession(user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    }
  } catch (error) {
    if (error instanceof ConflictError) throw error
    throw new Error('Database not available. Please set up your Neon database first.')
  }
}

export async function login(data: LoginInput) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })

    if (!user) {
      throw new UnauthorizedError('Invalid email or password')
    }

    // OAuth users without password cannot login with password
    if (!user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password')
    }

    const isValid = await verifyPassword(data.password, user.passwordHash)
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password')
    }

    const token = await createSession(user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error
    throw new Error('Database not available. Please set up your Neon database first.')
  }
}

export async function logout() {
  await deleteSession()
}

// ============================================
// User Operations
// ============================================

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    emailVerified: session.user.emailVerified,
  }
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; email?: string }
) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new NotFoundError('User')

  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })
    if (existing) {
      throw new ConflictError('Email already in use')
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email.toLowerCase() }),
    },
  })

  return {
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
  }
}

// ============================================
// Google OAuth Handler
// ============================================

export async function handleGoogleCallback(
  profile: { email: string; name: string; sub: string }
) {
  // Check if user exists with this email
  let user = await prisma.user.findUnique({ where: { email: profile.email.toLowerCase() } })
  
  if (user) {
    // Link Google account if not already linked
    if (!user.provider || user.provider === 'credentials') {
      await prisma.user.update({
        where: { id: user.id },
        data: { provider: 'google' }
      })
    }
    return user
  }
  
  // Create new user with Google profile
  user = await prisma.user.create({
    data: {
      email: profile.email.toLowerCase(),
      name: profile.name,
      provider: 'google',
      emailVerified: new Date(), // Google emails are pre-verified
      passwordHash: '', // No password for OAuth users
    }
  })
  return user
}

// ============================================
// Two-Factor Authentication (2FA) - Temporary Token
// ============================================

export async function createTempToken(userId: string): Promise<string> {
  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + TEMP_TOKEN_EXPIRY_MINUTES * 60 * 1000)

  await prisma.session.create({
    data: {
      userId,
      sessionToken: `temp_${token}`,
      expires,
    },
  })

  return token
}

export async function verifyTempToken(token: string): Promise<string | null> {
  const session = await prisma.session.findUnique({
    where: { sessionToken: `temp_${token}` },
    include: { user: true },
  })

  if (!session || session.expires < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
    }
    return null
  }

  return session.userId
}

export async function require2FA() {
  const session = await requireAuth()
  if (session.user.twoFactorEnabled && !session.twoFactorVerified) {
    throw new UnauthorizedError('2FA_REQUIRED')
  }
  return session
}
