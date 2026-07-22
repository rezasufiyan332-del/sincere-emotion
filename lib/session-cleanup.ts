import { prisma } from './prisma'

export async function cleanupExpiredSessions(): Promise<number> {
  const deleted = await prisma.session.deleteMany({
    where: {
      expires: { lt: new Date() }
    }
  })
  return deleted.count
}

// Optional: Add to app startup or use with a cron job
export async function runSessionCleanup(): Promise<void> {
  try {
    const count = await cleanupExpiredSessions()
    if (count > 0) {
      console.log(`Cleaned up ${count} expired sessions`)
    }
  } catch (error) {
    console.error('Session cleanup failed:', error)
  }
}
