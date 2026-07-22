import { cookies } from 'next/headers'
import { createHash } from 'crypto'

// Edge-compatible session validation (no crypto.randomUUID, no bcrypt)
const SESSION_COOKIE_NAME = 'session-token'

/**
 * SECURITY FIX: Edge auth only checks if token EXISTS.
 * It does NOT validate against DB (can't use Prisma in Edge runtime).
 * Actual validation happens in API routes via requireAuth().
 * 
 * WARNING: Do NOT rely on this for security decisions.
 * This is a preliminary check only.
 */
export async function getSessionEdge() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    
    if (!token) return null

    // CRITICAL: Token exists but NOT validated here
    // API routes must call requireAuth() for full DB validation
    return { token, valid: false, needsValidation: true }
  } catch {
    return null
  }
}

export async function requireAuthEdge() {
  const session = await getSessionEdge()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

// Helper to get session token from request headers (for API routes)
export function getSessionTokenFromRequest(request: Request): string | null {
  // DEPRECATED: Bearer token auth path removed for security
  // Only httpOnly cookies should be used for session tokens
  
  // Check cookies
  const cookieHeader = request.headers.get('Cookie')
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`))
    if (match) {
      return decodeURIComponent(match[1])
    }
  }
  
  return null
}