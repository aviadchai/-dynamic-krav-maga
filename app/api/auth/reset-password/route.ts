import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import {
  credentialsDb, isWeakPassword, MIN_PASSWORD_LENGTH, primaryAdminUsername, recoveryAddress, updatePrimaryAdminPassword,
} from '@/lib/admin-credentials'

export const runtime = 'nodejs'

const invalidLink = () => NextResponse.json({ error: 'קישור השחזור אינו תקף, כבר נוצל או שפג תוקפו. בקש קישור חדש.' }, { status: 400 })

export async function POST(request: Request) {
  const db = credentialsDb()
  if (!db || !recoveryAddress()) return NextResponse.json({ error: 'השירות אינו זמין.' }, { status: 503 })
  let token: string, password: string
  try {
    const body = await request.json()
    token = String(body.token || '')
    password = String(body.password || '')
  } catch { return NextResponse.json({ error: 'בקשה לא תקינה.' }, { status: 400 }) }
  if (!/^[0-9a-f]{64}$/.test(token)) return invalidLink()
  if (password.length > 128 || isWeakPassword(password, primaryAdminUsername())) {
    return NextResponse.json({
      error: `הסיסמה חלשה מדי. בחר לפחות ${MIN_PASSWORD_LENGTH} תווים, שאינה סיסמה נפוצה ואינה מכילה את שם המשתמש.`,
    }, { status: 400 })
  }

  const hash = createHash('sha256').update(token).digest('hex')
  const now = new Date().toISOString()
  // Consume the token atomically: the UPDATE only matches an unused, unexpired row,
  // so two concurrent requests with the same link cannot both succeed.
  const { data, error } = await db.from('admin_password_resets')
    .update({ used_at: now })
    .eq('token_hash', hash).is('used_at', null).gt('expires_at', now)
    .select('email').maybeSingle()
  if (error || !data || data.email !== recoveryAddress()) return invalidLink()

  const success = await updatePrimaryAdminPassword(password)
  if (!success) {
    // Give the link back so the user can retry within its original lifetime.
    await db.from('admin_password_resets').update({ used_at: null }).eq('token_hash', hash)
    return NextResponse.json({ error: 'שמירת הסיסמה נכשלה. נסה שוב.' }, { status: 503 })
  }
  // Invalidate every other outstanding link for this address.
  await db.from('admin_password_resets').update({ used_at: now })
    .eq('email', data.email).is('used_at', null)
  return NextResponse.json({ ok: true, username: primaryAdminUsername() })
}
