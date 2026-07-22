import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'

export async function POST() {
  await deleteSession()
  const response = NextResponse.json({ success: true, data: { message: 'Logged out successfully' } })
  response.cookies.delete('session-token')
  return response
}
