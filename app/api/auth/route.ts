import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json()
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123'

  if (password !== adminPass) {
    return NextResponse.json({ error: 'סיסמה שגויה' }, { status: 401 })
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
