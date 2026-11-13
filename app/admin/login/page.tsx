"use client"
import { useState } from 'react'
import Link from 'next/link'
import { AuthShell, PasswordField } from '../_auth-ui'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username: username.trim(), password }),
      })
      if (res.ok) {
        // A full navigation after a successful submit is what Chrome, Safari and
        // password managers use as the signal to offer saving the credentials.
        window.location.assign('/admin')
        return
      }
      const data = await res.json().catch(() => ({}))
      setError(res.status === 401 ? 'שם משתמש או סיסמה שגויים' : (data.error || 'הכניסה נכשלה. נסה שוב.'))
    } catch {
      setError('אירעה שגיאת תקשורת. בדוק את החיבור ונסה שוב.')
    }
    setLoading(false)
  }

  return (
    <AuthShell title="פאנל ניהול" subtitle="התחברות למערכת ניהול האתר">
      <form onSubmit={handleSubmit} method="post" action="/api/auth" autoComplete="on">
        <div className="auth-field">
          <label className="auth-label" htmlFor="admin-username">שם משתמש</label>
          <input
            id="admin-username"
            name="username"
            type="text"
            className="auth-input ltr"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            maxLength={128}
            autoFocus
            required
          />
        </div>

        <PasswordField
          id="admin-password"
          name="password"
          label="סיסמה"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        {error && <p className="auth-error" role="alert">{error}</p>}

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'נכנס...' : 'כניסה'}
        </button>
      </form>

      <div className="auth-footer">
        <Link href="/admin/forgot-password" className="auth-link">שכחת שם משתמש או סיסמה?</Link>
      </div>
    </AuthShell>
  )
}
