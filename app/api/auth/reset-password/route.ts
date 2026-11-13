import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { credentialsDb, recoveryAddress, updatePrimaryAdminPassword } from '@/lib/admin-credentials'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const db = credentialsDb()
  if (!db || !recoveryAddress()) return NextResponse.json({ error: 'השירות אינו זמין.' }, { status: 503 })
  let token: string, password: string
  try {
    const body = await request.json()
    token = String(body.token || '')
    password = String(body.password || '')
  } catch { return NextResponse.json({ error: 'בקשה לא תקינה.' }, { status: 400 }) }
  if (!/^[0-9a-f]{64}$/.test(token) || password.length < 10 || password.length > 128) {
    return NextResponse.json({ error: 'קישור לא תקין או סיסמה קצרה מדי (לפחות 10 תווים).' }, { status: 400 })
  }
  const hash = createHash('sha256').update(token).digest('hex')
  const { data, error } = await db.from('admin_password_resets')
    .select('email,expires_at,used_at').eq('token_hash', hash).maybeSingle()
  if (error || !data || data.email !== recoveryAddress() || data.used_at || Date.parse(data.expires_at) <= Date.now()) {
    return NextResponse.json({ error: 'קישור השחזור אינו תקף או שפג תוקפו.' }, { status: 400 })
  }
  const success = await updatePrimaryAdminPassword(password)
  if (!success) return NextResponse.json({ error: 'שמירת הסיסמה נכשלה. נסה שוב.' }, { status: 503 })
  // Invalidate all outstanding links; existing signed sessions also expire when the
  // signing secret is changed, but resetting a DB password alone does not log out sessions.
  await db.from('admin_password_resets').update({ used_at: new Date().toISOString() })
    .eq('email', data.email).is('used_at', null)
  return NextResponse.json({ ok: true })
}
