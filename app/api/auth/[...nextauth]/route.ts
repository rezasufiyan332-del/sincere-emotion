// NextAuth disabled - using custom auth system instead
// See /api/auth/login and /api/auth/register for the email/password auth endpoints

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Not configured' }, { status: 404 })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Not configured' }, { status: 404 })
}
