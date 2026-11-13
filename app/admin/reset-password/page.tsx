"use client"
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetForm() {
  const token = useSearchParams().get('token') || ''
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== repeat) { setError('הסיסמאות אינן זהות'); return }
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'לא ניתן לעדכן את הסיסמה')
      else setDone(true)
    } catch { setError('אירעה שגיאת תקשורת') }
    setBusy(false)
  }
  return <main dir="rtl" style={{ minHeight: '100vh', background: '#0A0A0A', color: 'white', display: 'grid', placeItems: 'center', padding: 20, fontFamily: 'var(--font-heebo),sans-serif' }}>
    <section style={{ background: '#141414', border: '1px solid #333', padding: 32, borderRadius: 16, width: '100%', maxWidth: 420 }}>
      <div style={{ color: '#EAFF00', fontWeight: 800 }}>Dynamic Krav Maga</div>
      <h1>בחירת סיסמה חדשה</h1>
      {done ? <><p role="status">הסיסמה עודכנה בהצלחה.</p><Link href="/admin/login" style={{ color: '#EAFF00' }}>מעבר להתחברות</Link></> :
        <form onSubmit={submit}>
          <p style={{ color: '#aaa' }}>הסיסמה חייבת להכיל לפחות 10 תווים.</p>
          <label htmlFor="new-password">סיסמה חדשה</label>
          <input id="new-password" name="new-password" type={visible ? 'text' : 'password'} autoComplete="new-password" required minLength={10} maxLength={128} value={password} onChange={e => setPassword(e.target.value)}
            style={{ display: 'block', width: '100%', boxSizing: 'border-box', background: '#222', border: '1px solid #555', color: '#fff', borderRadius: 8, padding: 13, margin: '8px 0 16px' }} />
          <label htmlFor="confirm-password">אישור סיסמה</label>
          <input id="confirm-password" name="confirm-password" type={visible ? 'text' : 'password'} autoComplete="new-password" required minLength={10} maxLength={128} value={repeat} onChange={e => setRepeat(e.target.value)}
            style={{ display: 'block', width: '100%', boxSizing: 'border-box', background: '#222', border: '1px solid #555', color: '#fff', borderRadius: 8, padding: 13, margin: '8px 0 10px' }} />
          <label style={{ display: 'block', marginBottom: 20 }}><input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} /> הצג סיסמה</label>
          <button disabled={busy || !token} type="submit" style={{ background: '#EAFF00', width: '100%', padding: 14, border: 0, borderRadius: 30, fontWeight: 800 }}>
            {busy ? 'שומר...' : 'שמור סיסמה חדשה'}
          </button>
          {!token && <p role="alert">חסר קישור שחזור תקין.</p>}
          {error && <p role="alert" style={{ color: '#ff7878' }}>{error}</p>}
        </form>}
      <Link href="/admin/login" style={{ display: 'block', marginTop: 24, color: '#ddd' }}>חזרה להתחברות</Link>
    </section>
  </main>
}
export default function ResetPasswordPage() {
  return <Suspense fallback={<div>טוען...</div>}><ResetForm /></Suspense>
}
