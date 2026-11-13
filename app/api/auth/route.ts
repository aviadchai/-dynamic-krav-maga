import { NextResponse } from 'next/server'
import { verifyAdminLogin } from '@/lib/admin-credentials'
import { createAdminSession } from '@/lib/admin-session'

// Defense in depth. Persistent cross-instance rate limiting for recovery is stored in Supabase.
const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10

export async function POST(request: Request) {
  const ip = (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
  const now = Date.now()
  const record = attempts.get(ip)
  if (record && now < record.resetAt) {
    if (record.count >= MAX_ATTEMPTS) return NextResponse.json({ error: 'יותר מדי ניסיונות כניסה. נסה שוב בעוד 15 דקות.' }, { status: 429 })
    record.count++
  } else {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  }

  let username: string, password: string
  try {
    const data = await request.json()
    username = String(data.username || '').trim()
    password = String(data.password || '')
  } catch { return NextResponse.json({ error: 'בקשה לא תקינה' }, { status: 400 }) }
  if (!username || !password || username.length > 128 || password.length > 256)
    return NextResponse.json({ error: 'שם משתמש או סיסמה שגויים' }, { status: 401 })

  const role = await verifyAdminLogin(username, password)
  if (!role) return NextResponse.json({ error: 'שם משתמש או סיסמה שגויים' }, { status: 401 })
  attempts.delete(ip)
  let signed: string
  try { signed = await createAdminSession(role) }
  catch { return NextResponse.json({ error: 'הכניסה אינה זמינה כרגע' }, { status: 503 }) }

  const response = NextResponse.json({ ok: true, role })
  response.cookies.set('admin_session', signed, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
    maxAge: 60 * 60 * 24, path: '/',
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('admin_session')
  return response
}
