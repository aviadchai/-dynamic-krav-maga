import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { username, password } = await request.json()
  const adminUser = process.env.ADMIN_USERNAME || 'admin'
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123'

  if (username !== adminUser || password !== adminPass) {
    return NextResponse.json({ error: 'שם משתמש או סיסמה שגויים' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_session', 'ok', {
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
