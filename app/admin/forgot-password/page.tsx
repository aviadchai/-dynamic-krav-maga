"use client"
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError(''); setMessage('')
    try {
      const response = await fetch('/api/auth/recovery', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (!response.ok) setError(data.error || 'לא ניתן לשלוח כרגע')
      else setMessage(data.message || 'אם הכתובת מורשית, נשלח אליה מייל.')
    } catch { setError('אירעה שגיאת תקשורת. נסה שוב.') }
    setBusy(false)
  }

  return <main dir="rtl" style={{ minHeight: '100vh', background: '#0A0A0A', display: 'grid', placeItems: 'center', padding: 20, color: 'white', fontFamily: 'var(--font-heebo),sans-serif' }}>
    <section style={{ background: '#141414', border: '1px solid #333', padding: 32, borderRadius: 16, width: '100%', maxWidth: 420 }}>
      <div style={{ color: '#EAFF00', fontSize: 12, fontWeight: 800, letterSpacing: 2 }}>Dynamic Krav Maga</div>
      <h1>שחזור פרטי התחברות</h1>
      <p style={{ color: '#aaa', lineHeight: 1.7 }}>הזן את כתובת האימייל הרשומה של מנהל האתר. נשלח אליה את שם המשתמש וקישור לבחירת סיסמה חדשה.</p>
      <form onSubmit={submit}>
        <label htmlFor="recovery-email">כתובת אימייל</label>
        <input id="recovery-email" type="email" name="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)}
          style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: 13, marginTop: 8, marginBottom: 18, borderRadius: 8, border: '1px solid #555', color: '#fff', background: '#222', fontSize: 16 }} />
        <button disabled={busy} type="submit" style={{ padding: 14, width: '100%', background: '#EAFF00', border: 0, borderRadius: 30, fontWeight: 800, cursor: 'pointer' }}>
          {busy ? 'שולח...' : 'שלח קישור שחזור'}
        </button>
      </form>
      {error && <p role="alert" style={{ color: '#ff7878' }}>{error}</p>}
      {message && <p role="status" style={{ color: '#EAFF00' }}>{message}</p>}
      <Link href="/admin/login" style={{ display: 'block', marginTop: 24, color: '#ddd' }}>חזרה להתחברות</Link>
    </section>
  </main>
}
