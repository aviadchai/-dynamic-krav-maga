"use client"
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthShell, PasswordField } from '../_auth-ui'

const MIN = 10

function ResetForm() {
  const params = useSearchParams()
  const [token] = useState(() => params.get('token') || '')
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [username, setUsername] = useState<string | null>(null)

  // Remove the one-time token from the address bar and browser history right away.
  useEffect(() => {
    if (params.get('token')) window.history.replaceState(null, '', '/admin/reset-password')
  }, [params])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < MIN) { setError(`הסיסמה חייבת להכיל לפחות ${MIN} תווים.`); return }
    if (password !== repeat) { setError('הסיסמאות אינן זהות.'); return }
    setBusy(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) setError(data.error || 'לא ניתן לעדכן את הסיסמה.')
      else setUsername(data.username || '')
    } catch { setError('אירעה שגיאת תקשורת. נסה שוב.') }
    setBusy(false)
  }

  if (username !== null) {
    return (
      <AuthShell title="הסיסמה עודכנה">
        <p className="auth-ok" role="status">
          הסיסמה החדשה נשמרה ואפשר להתחבר איתה כבר עכשיו.
          {username && <><br />שם המשתמש: <strong dir="ltr">{username}</strong></>}
        </p>
        <Link href="/admin/login" className="auth-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
          מעבר להתחברות
        </Link>
      </AuthShell>
    )
  }

  if (!token) {
    return (
      <AuthShell title="קישור לא תקין">
        <p className="auth-error" role="alert">חסר קישור שחזור תקין. בקש קישור חדש.</p>
        <div className="auth-footer">
          <Link href="/admin/forgot-password" className="auth-link">שליחת קישור חדש</Link>
          <Link href="/admin/login" className="auth-link muted">חזרה להתחברות</Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="בחירת סיסמה חדשה" subtitle={`לפחות ${MIN} תווים. מומלץ לשמור אותה במנהל הסיסמאות.`}>
      <form onSubmit={submit} autoComplete="on">
        <PasswordField id="new-password" name="new-password" label="סיסמה חדשה" value={password}
          onChange={setPassword} autoComplete="new-password" minLength={MIN} autoFocus />
        <PasswordField id="confirm-password" name="confirm-password" label="אישור סיסמה" value={repeat}
          onChange={setRepeat} autoComplete="new-password" minLength={MIN} />
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button disabled={busy} type="submit" className="auth-btn">
          {busy ? 'שומר...' : 'שמור סיסמה חדשה'}
        </button>
      </form>
      <div className="auth-footer">
        <Link href="/admin/forgot-password" className="auth-link muted">הקישור לא עובד? שליחת קישור חדש</Link>
      </div>
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: '100vh', background: '#0A0A0A' }} />}>
      <ResetForm />
    </Suspense>
  )
}
