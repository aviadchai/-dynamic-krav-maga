import { NextResponse } from 'next/server'

// Simple in-memory rate limiter: max 10 attempts per IP per 15 minutes
const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10

export async function POST(request: Request) {
  const ip = (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
  const now = Date.now()
  const record = attempts.get(ip)

  if (record && now < record.resetAt) {
    if (record.count >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: 'יותר מדי ניסיונות כניסה. נסה שוב בעוד 15 דקות.' }, { status: 429 })
    }
    record.count++
  } else {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  }

  const { username, password } = await request.json()

  const adminUser = process.env.ADMIN_USERNAME || 'admin'
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123'
  const editorUser = process.env.EDITOR_USERNAME || ''
  const editorPass = process.env.EDITOR_PASSWORD || ''

  let role: string | null = null

  if (username === adminUser && password === adminPass) {
    role = 'admin'
  } else if (editorUser && username === editorUser && password === editorPass) {
    role = 'editor'
  }

  if (!role) {
    return NextResponse.json({ error: 'שם משתמש או סיסמה שגויים' }, { status: 401 })
  }

  // Clear rate limit on success
  attempts.delete(ip)

  const res = NextResponse.json({ ok: true, role })
  res.cookies.set('admin_session', role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('admin_session')
  return res
}
