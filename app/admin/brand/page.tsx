"use client"
import { useEffect, useState, useRef } from 'react'
import type { SiteContent } from '@/lib/db'

const inp: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1.5px solid rgba(255,255,255,0.1)',
  color: '#fff', padding: '11px 14px', borderRadius: 10,
  fontFamily: 'var(--font-heebo), sans-serif', fontSize: 14, outline: 'none',
}

const F = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ marginBottom: '1.25rem' }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
      {label}
    </label>
    {children}
  </div>
)

export default function BrandPage() {
  const [content, setContent] = useState<SiteContent | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/content').then(r => r.json()).then(setContent)
  }, [])

  function set(key: keyof SiteContent, value: string) {
    setContent(c => c ? { ...c, [key]: value } : c)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    set('brandLogoUrl', url)
    setUploading(false)
  }

  async function save() {
    if (!content) return
    setSaving(true)
    await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!content) return <div style={{ padding: '2.5rem', color: 'rgba(255,255,255,0.3)' }}>טוען...</div>

  const logoSrc = content.brandLogoUrl || '/images/logo.png'

  return (
    <div style={{ padding: '2.5rem', direction: 'rtl' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>מיתוג</h1>
        <button onClick={save} disabled={saving} style={{
          background: saved ? 'rgba(234,255,0,0.8)' : '#EAFF00', color: '#0A0A0A', border: 'none',
          padding: '11px 28px', borderRadius: 50, cursor: 'pointer',
          fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 800, fontSize: 13,
          opacity: saving ? 0.7 : 1,
        }}>
          {saving ? 'שומר...' : saved ? '✓ נשמר' : 'שמור שינויים'}
        </button>
      </div>

      {/* Logo */}
      <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#EAFF00', textTransform: 'uppercase', marginBottom: '1.25rem' }}>לוגו</div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{
            width: 120, height: 60, borderRadius: 10, flexShrink: 0,
            background: '#1C1C1C', border: '1.5px solid rgba(255,255,255,0.08)',
            backgroundImage: `url(${logoSrc})`,
            backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
          }} />
          <div style={{ flex: 1 }}>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{
              background: 'rgba(234,255,0,0.08)', border: '1.5px solid rgba(234,255,0,0.2)',
              color: '#EAFF00', padding: '9px 20px', borderRadius: 8,
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-heebo), sans-serif', fontSize: 13, fontWeight: 700,
              display: 'block', marginBottom: 8,
            }}>
              {uploading ? 'מעלה...' : '⬆ העלה לוגו'}
            </button>
            <input style={{ ...inp, fontSize: 12, padding: '8px 12px' }} value={content.brandLogoUrl || ''} onChange={e => set('brandLogoUrl', e.target.value)} placeholder="או URL ישיר..." dir="ltr" />
          </div>
        </div>
      </div>

      {/* Colors */}
      <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#EAFF00', textTransform: 'uppercase', marginBottom: '1.25rem' }}>צבעי מותג</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <F label="צבע ראשי (Accent)">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="color" value={content.brandColor || '#EAFF00'} onChange={e => set('brandColor', e.target.value)}
                style={{ width: 48, height: 48, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'none', padding: 0 }} />
              <input style={{ ...inp, flex: 1 }} value={content.brandColor || '#EAFF00'} onChange={e => set('brandColor', e.target.value)} dir="ltr" />
            </div>
          </F>
          <F label="צבע רקע (Background)">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="color" value={content.brandBg || '#0A0A0A'} onChange={e => set('brandBg', e.target.value)}
                style={{ width: 48, height: 48, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'none', padding: 0 }} />
              <input style={{ ...inp, flex: 1 }} value={content.brandBg || '#0A0A0A'} onChange={e => set('brandBg', e.target.value)} dir="ltr" />
            </div>
          </F>
        </div>
        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: 10, background: content.brandBg || '#0A0A0A', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: content.brandColor || '#EAFF00', fontWeight: 900, fontSize: 14 }}>תצוגה מקדימה</span>
          <span style={{ color: '#fff', fontSize: 13, opacity: 0.5 }}>Dynamic Krav Maga</span>
        </div>
      </div>

      {/* Badge pill */}
      <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#EAFF00', textTransform: 'uppercase', marginBottom: '1.25rem' }}>תג Hero</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <F label="עברית">
            <input style={inp} value={content.badgePillHe || ''} onChange={e => set('badgePillHe', e.target.value)} placeholder="מדריך מוסמך קרב מגע" />
          </F>
          <F label="English">
            <input style={inp} value={content.badgePillEn || ''} onChange={e => set('badgePillEn', e.target.value)} placeholder="Certified Krav Maga Instructor" dir="ltr" />
          </F>
        </div>
      </div>
    </div>
  )
}
