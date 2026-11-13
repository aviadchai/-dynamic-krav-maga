"use client"
import { useState } from 'react'
import Link from 'next/link'
import { AuthShell } from '../_auth-ui'

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
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim() }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) setError(data.error || 'לא ניתן לשלוח כרגע. נסה מאוחר יותר.')
      else setMessage(data.message || 'אם הכתובת מורשית, נשלח אליה מייל עם פרטי שחזור.')
    } catch { setError('אירעה שגיאת תקשורת. נסה שוב.') }
    setBusy(false)
  }

  return (
    <AuthShell
      title="שחזור פרטי התחברות"
      subtitle="הזן את כתובת האימייל המורשית של מנהל האתר. נשלח אליה את שם המשתמש וקישור חד־פעמי לבחירת סיסמה חדשה."
    >
      {message ? (
        <p className="auth-ok" role="status">
          {message}
          <br />
          הקישור תקף ל־20 דקות. כדאי לבדוק גם בתיקיית הספאם.
        </p>
      ) : (
        <form onSubmit={submit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="recovery-email">כתובת אימייל</label>
            <input
              id="recovery-email"
              type="email"
              name="email"
              className="auth-input ltr"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={254}
              required
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button disabled={busy} type="submit" className="auth-btn">
            {busy ? 'שולח...' : 'שלח פרטי שחזור'}
          </button>
        </form>
      )}
      <div className="auth-footer">
        <Link href="/admin/login" className="auth-link muted">חזרה להתחברות</Link>
      </div>
    </AuthShell>
  )
}
