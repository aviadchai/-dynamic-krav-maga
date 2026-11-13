import { randomBytes, createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { credentialsDb, primaryAdminUsername, recoveryAddress } from '@/lib/admin-credentials'

export const runtime = 'nodejs'
const generic = { message: 'אם הכתובת מורשית, נשלח אליה מייל עם פרטי שחזור.' }

export async function POST(request: Request) {
  const db = credentialsDb()
  const address = recoveryAddress()
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESET_FROM_EMAIL
  const site = process.env.SITE_URL
  if (!db || !address || !apiKey || !from || !site || !/^https:\/\//.test(site)) {
    return NextResponse.json({ error: 'שחזור הסיסמה עדיין אינו מוגדר באתר.' }, { status: 503 })
  }

  let email: string
  try {
    const body = await request.json()
    email = String(body.email || '').trim().toLowerCase()
  } catch { return NextResponse.json({ error: 'בקשה לא תקינה' }, { status: 400 }) }
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) return NextResponse.json(generic)
  if (email !== address) return NextResponse.json(generic)

  // Limit the number of emails per account across all Vercel instances.
  const cutoff = new Date(Date.now() - 60 * 60_000).toISOString()
  const { count, error: rateError } = await db.from('admin_password_resets')
    .select('token_hash', { count: 'exact', head: true }).eq('email', email).gte('created_at', cutoff)
  if (rateError) return NextResponse.json({ error: 'לא ניתן לשלוח כרגע. נסה מאוחר יותר.' }, { status: 503 })
  if ((count || 0) >= 3) return NextResponse.json(generic)

  const token = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const { error } = await db.from('admin_password_resets').insert({
    token_hash: tokenHash, email, expires_at: new Date(Date.now() + 20 * 60_000).toISOString(),
  })
  if (error) return NextResponse.json({ error: 'לא ניתן לשלוח כרגע. נסה מאוחר יותר.' }, { status: 503 })

  const link = new URL('/admin/reset-password', site)
  link.searchParams.set('token', token)
  const username = primaryAdminUsername()
  const safeUser = username.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] || c))
  let sent = false
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from, to: [address], subject: 'שחזור גישה לניהול Dynamic Krav Maga',
        html: `<div dir="rtl" style="font-family:Arial,sans-serif"><h2>שחזור פרטי התחברות</h2><p>שם המשתמש שלך: <strong>${safeUser}</strong></p><p><a href="${link.toString()}">לחץ כאן כדי לבחור סיסמה חדשה</a></p><p>הקישור תקף ל־20 דקות. אם לא ביקשת לשחזר, אפשר להתעלם מהמייל.</p></div>`,
      }),
    })
    sent = response.ok
  } catch {}
  if (!sent) {
    await db.from('admin_password_resets').delete().eq('token_hash', tokenHash)
    return NextResponse.json({ error: 'שליחת המייל נכשלה. נסה מאוחר יותר.' }, { status: 503 })
  }
  return NextResponse.json(generic)
}
