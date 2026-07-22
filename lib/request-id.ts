import { randomBytes } from 'crypto'
import { headers } from 'next/headers'

/**
 * Generate or retrieve request ID for tracking and logging
 * Simple ID generation - headers are async in Next.js 16
 */
export function getOrCreateRequestId(): string {
  // Generate request ID with timestamp + random bytes for uniqueness
  const timestamp = Date.now().toString(36)
  const random = randomBytes(6).toString('hex')
  return `${timestamp}-${random}`
}

/**
 * Format log message with request context
 */
export function withRequestContext(
  requestId: string,
  message: string,
  metadata?: Record<string, unknown>
): string {
  const context = {
    requestId,
    timestamp: new Date().toISOString(),
    ...(metadata && { metadata }),
  }
  return `[${requestId}] ${message} ${metadata ? JSON.stringify(metadata) : ''}`
}
