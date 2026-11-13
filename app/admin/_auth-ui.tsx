"use client"
// Shared look for the public admin screens (login, forgot, reset):
// black background, white text, glowing yellow actions, Hebrew RTL, mobile first.
import { useState } from 'react'

export const ACCENT = '#EAFF00'

const css = `
.auth-page { min-height: 100vh; min-height: 100dvh; background: #0A0A0A; color: #fff; display: flex; align-items: center; justify-content: center; padding: 24px 16px; font-family: var(--font-heebo), sans-serif; direction: rtl; box-sizing: border-box; }
.auth-card { background: #141414; border: 1.5px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 2.5rem 2rem; width: 100%; max-width: 420px; box-sizing: border-box; box-shadow: 0 0 60px rgba(234,255,0,0.04); }
@media (max-width: 420px) { .auth-card { padding: 2rem 1.25rem; } }
.auth-brand { font-size: 11px; font-weight: 700; letter-spacing: 3px; color: ${ACCENT}; text-transform: uppercase; margin-bottom: 8px; text-align: center; }
.auth-title { font-size: 1.7rem; font-weight: 900; color: #fff; text-align: center; margin: 0 0 0.5rem; }
.auth-sub { color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7; text-align: center; margin: 0 0 1.75rem; }
.auth-label { display: block; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.6); margin-bottom: 6px; }
.auth-field { position: relative; margin-bottom: 1.1rem; }
.auth-input { width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.12); color: #fff; padding: 14px 16px; border-radius: 10px; font-family: inherit; font-size: 16px; outline: none; transition: border-color .2s, box-shadow .2s; }
.auth-input:focus { border-color: ${ACCENT}; box-shadow: 0 0 0 3px rgba(234,255,0,0.15); }
.auth-input.has-toggle { padding-left: 52px; }
.auth-input.ltr { direction: ltr; text-align: right; }
.auth-input:-webkit-autofill, .auth-input:-webkit-autofill:hover, .auth-input:-webkit-autofill:focus { -webkit-text-fill-color: #fff; -webkit-box-shadow: 0 0 0 1000px #1c1c1c inset; caret-color: #fff; transition: background-color 9999s; }
.auth-eye { position: absolute; left: 4px; bottom: 4px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: none; border: none; border-radius: 8px; cursor: pointer; color: rgba(255,255,255,0.55); padding: 0; }
.auth-eye:hover, .auth-eye:focus-visible { color: ${ACCENT}; outline: none; }
.auth-btn { width: 100%; background: ${ACCENT}; color: #0A0A0A; border: none; padding: 15px; border-radius: 50px; font-family: inherit; font-size: 1rem; font-weight: 900; cursor: pointer; margin-top: 0.5rem; box-shadow: 0 0 18px rgba(234,255,0,0.45), 0 0 42px rgba(234,255,0,0.18); transition: box-shadow .2s, transform .1s, opacity .2s; }
.auth-btn:hover:not(:disabled) { box-shadow: 0 0 24px rgba(234,255,0,0.7), 0 0 60px rgba(234,255,0,0.3); }
.auth-btn:active:not(:disabled) { transform: scale(0.99); }
.auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.auth-btn:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
.auth-link { color: ${ACCENT}; font-size: 14px; font-weight: 600; text-decoration: underline; text-underline-offset: 4px; }
.auth-link.muted { color: rgba(255,255,255,0.6); font-weight: 500; }
.auth-footer { text-align: center; margin-top: 1.5rem; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.auth-error { color: #ff6b6b; background: rgba(255,80,80,0.08); border: 1px solid rgba(255,80,80,0.25); border-radius: 10px; padding: 10px 12px; font-size: 14px; margin: 0 0 1rem; text-align: center; }
.auth-ok { color: ${ACCENT}; background: rgba(234,255,0,0.07); border: 1px solid rgba(234,255,0,0.3); border-radius: 10px; padding: 12px; font-size: 14px; line-height: 1.7; margin: 0 0 1rem; text-align: center; }
.auth-hint { color: rgba(255,255,255,0.45); font-size: 12px; line-height: 1.6; margin: -0.4rem 0 1rem; }
`

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main className="auth-page" dir="rtl" lang="he">
      <style>{css}</style>
      <section className="auth-card">
        <div className="auth-brand">Dynamic Krav Maga</div>
        <h1 className="auth-title">{title}</h1>
        {subtitle && <p className="auth-sub">{subtitle}</p>}
        {children}
      </section>
    </main>
  )
}

const EyeOpen = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
)
const EyeClosed = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
  </svg>
)

type PasswordFieldProps = {
  id: string
  name: string
  label: string
  value: string
  onChange: (v: string) => void
  autoComplete: 'current-password' | 'new-password'
  minLength?: number
  autoFocus?: boolean
}

export function PasswordField({ id, name, label, value, onChange, autoComplete, minLength, autoFocus }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        className="auth-input has-toggle ltr"
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        minLength={minLength}
        maxLength={128}
        autoFocus={autoFocus}
        required
      />
      <button
        type="button"
        className="auth-eye"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'הסתר סיסמה' : 'הצג סיסמה'}
        aria-pressed={visible}
        aria-controls={id}
        title={visible ? 'הסתר סיסמה' : 'הצג סיסמה'}
      >
        {visible ? EyeClosed : EyeOpen}
      </button>
    </div>
  )
}
