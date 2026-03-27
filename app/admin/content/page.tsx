"use client"
import { useEffect, useState } from 'react'
import type { SiteContent } from '@/lib/db'

const F = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ marginBottom: '1.25rem' }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
      {label}
    </label>
    {children}
  </div>
)

const inp: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1.5px solid rgba(255,255,255,0.1)',
  color: '#fff', padding: '11px 14px', borderRadius: 10,
  fontFamily: 'var(--font-heebo), sans-serif', fontSize: 14, outline: 'none',
  lineHeight: 1.7,
}

export default function ContentPage() {
  const [content, setContent] = useState<SiteContent | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/content').then(r => r.json()).then(setContent)
  }, [])

  function set(key: keyof SiteContent, value: string | string[]) {
    setContent(c => c ? { ...c, [key]: value } : c)
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

  return (
    <div style={{ padding: '2.5rem', direction: 'rtl' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>תוכן האתר</h1>
        <button onClick={save} disabled={saving} style={{
          background: saved ? 'rgba(234,255,0,0.8)' : '#EAFF00', color: '#0A0A0A', border: 'none',
          padding: '11px 28px', borderRadius: 50, cursor: 'pointer',
          fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 800, fontSize: 13,
          opacity: saving ? 0.7 : 1, transition: 'all .2s',
        }}>
          {saving ? 'שומר...' : saved ? '✓ נשמר' : 'שמור שינויים'}
        </button>
      </div>

      {/* Hero */}
      <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#EAFF00', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          סקשן ראשי (Hero)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <F label="תת כותרת — עברית">
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 80 }} value={content.heroSubHe} onChange={e => set('heroSubHe', e.target.value)} />
          </F>
          <F label="Subtitle — English">
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 80, direction: 'ltr' }} value={content.heroSubEn} onChange={e => set('heroSubEn', e.target.value)} />
          </F>
        </div>
      </div>

      {/* Contact */}
      <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#EAFF00', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          פרטי יצירת קשר
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <F label="טלפון">
            <input style={inp} value={content.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="054-0000000" dir="ltr" />
          </F>
          <F label="WhatsApp">
            <input style={inp} value={content.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)} placeholder="054-0000000" dir="ltr" />
          </F>
          <F label="Email">
            <input style={inp} value={content.email || ''} onChange={e => set('email', e.target.value)} placeholder="mail@example.com" dir="ltr" />
          </F>
          <F label="Instagram">
            <input style={inp} value={content.instagram || ''} onChange={e => set('instagram', e.target.value)} placeholder="@username" dir="ltr" />
          </F>
          <F label="Facebook">
            <input style={inp} value={content.facebook || ''} onChange={e => set('facebook', e.target.value)} placeholder="שם הדף או URL" dir="ltr" />
          </F>
        </div>
      </div>

      {/* About */}
      <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#EAFF00', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          סקשן אודות
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: '1rem', letterSpacing: 1 }}>עברית</div>
            {content.aboutParaHe.map((p, i) => (
              <F key={i} label={`פסקה ${i + 1}`}>
                <textarea
                  style={{ ...inp, resize: 'vertical', minHeight: 80 }}
                  value={p}
                  onChange={e => {
                    const arr = [...content.aboutParaHe]
                    arr[i] = e.target.value
                    set('aboutParaHe', arr)
                  }}
                />
              </F>
            ))}
            <button onClick={() => set('aboutParaHe', [...content.aboutParaHe, ''])} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.4)', padding: '8px 16px', borderRadius: 8,
              cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-heebo), sans-serif',
            }}>
              + הוסף פסקה
            </button>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: '1rem', letterSpacing: 1 }}>English</div>
            {content.aboutParaEn.map((p, i) => (
              <F key={i} label={`Paragraph ${i + 1}`}>
                <textarea
                  style={{ ...inp, resize: 'vertical', minHeight: 80, direction: 'ltr' }}
                  value={p}
                  onChange={e => {
                    const arr = [...content.aboutParaEn]
                    arr[i] = e.target.value
                    set('aboutParaEn', arr)
                  }}
                />
              </F>
            ))}
            <button onClick={() => set('aboutParaEn', [...content.aboutParaEn, ''])} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.4)', padding: '8px 16px', borderRadius: 8,
              cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-heebo), sans-serif',
            }}>
              + Add paragraph
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
