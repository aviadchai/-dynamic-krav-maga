"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const fieldStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1.5px solid rgba(255,255,255,0.1)',
  color: '#fff', padding: '14px 16px', borderRadius: 10,
  fontFamily: 'var(--font-heebo), sans-serif', fontSize: 15,
  direction: 'rtl', outline: 'none', marginBottom: '1rem',
  transition: 'border-color .2s',
}

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      setError('שם משתמש או סיסמה שגויים')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-heebo), sans-serif',
    }}>
      <div style={{
        background: '#141414', border: '1.5px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '3rem', width: '100%', maxWidth: 400,
        direction: 'rtl',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#EAFF00', textTransform: 'uppercase', marginBottom: 8 }}>
            Dynamic Krav Maga
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>פאנל ניהול</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
            שם משתמש
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={fieldStyle}
            autoFocus
            autoComplete="username"
          />

          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
            סיסמה
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={fieldStyle}
            autoComplete="current-password"
          />

          {error && (
            <p style={{ color: '#ff4444', fontSize: 13, marginBottom: '1rem', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: '#EAFF00', color: '#0A0A0A',
              border: 'none', padding: '14px', borderRadius: 50,
              fontFamily: 'var(--font-heebo), sans-serif', fontSize: '1rem',
              fontWeight: 900, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: '0.5rem',
            }}
          >
            {loading ? 'נכנס...' : 'כניסה'}
          </button>
        </form>
      </div>
    </div>
  )
}
