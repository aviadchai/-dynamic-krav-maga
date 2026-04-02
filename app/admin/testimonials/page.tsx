"use client"
import { useEffect, useRef, useState } from 'react'
import type { SiteContent, Testimonial } from '@/lib/db'

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

const twoCol: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [translating, setTranslating] = useState('')
  const savedRef = useRef<Testimonial[]>([])

  useEffect(() => {
    fetch('/api/content').then(r => r.json()).then((d: SiteContent) => {
      setTestimonials(d.testimonials || [])
      savedRef.current = d.testimonials || []
    })
  }, [])

  async function tr(id: string, fields: Record<string, string>): Promise<Record<string, string>> {
    setTranslating(id)
    try {
      const res = await fetch('/api/translate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      })
      const { translations } = await res.json()
      return translations || {}
    } finally { setTranslating('') }
  }

  function set(i: number, key: keyof Testimonial, value: string) {
    setTestimonials(arr => {
      const next = [...arr]
      next[i] = { ...next[i], [key]: value }
      return next
    })
  }

  function add() {
    setTestimonials(arr => [...arr, { name: '', nameEn: '', roleHe: '', roleEn: '', textHe: '', textEn: '' }])
  }

  function remove(i: number) {
    if (!confirm('למחוק המלצה זו?')) return
    setTestimonials(arr => arr.filter((_, idx) => idx !== i))
  }

  async function save() {
    setSaving(true)
    await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testimonials }),
    })
    savedRef.current = testimonials
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const isDirty = JSON.stringify(testimonials) !== JSON.stringify(savedRef.current)

  return (
    <div style={{ padding: 'clamp(1rem, 4vw, 2.5rem)', direction: 'rtl', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.3rem, 5vw, 1.8rem)', fontWeight: 900, color: '#fff' }}>המלצות</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 }}>עדויות של תלמידים המופיעות באתר</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={add} style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', padding: '10px 20px', borderRadius: 50, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 700, fontSize: 13 }}>
            + המלצה חדשה
          </button>
          <button onClick={save} disabled={saving || !isDirty} style={{ background: saved ? 'rgba(234,255,0,0.8)' : '#EAFF00', color: '#0A0A0A', border: 'none', padding: '10px 24px', borderRadius: 50, cursor: saving || !isDirty ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 800, fontSize: 13, opacity: saving || !isDirty ? 0.6 : 1 }}>
            {saving ? 'שומר...' : saved ? '✓ נשמר' : 'שמור שינויים'}
          </button>
        </div>
      </div>

      {testimonials.length === 0 && (
        <div style={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '3rem', fontSize: 14, background: '#141414', borderRadius: 14, border: '1.5px solid rgba(255,255,255,0.07)' }}>
          אין המלצות עדיין — לחץ &quot;+ המלצה חדשה&quot;
        </div>
      )}

      {testimonials.map((tc, i) => (
        <div key={i} style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem', marginBottom: '1rem', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>המלצה {i + 1}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button type="button" disabled={translating === `tc${i}`} onClick={async () => {
                const t = await tr(`tc${i}`, { roleHe: tc.roleHe, textHe: tc.textHe })
                if (t.roleHe) set(i, 'roleEn', t.roleHe)
                if (t.textHe) set(i, 'textEn', t.textHe)
              }} style={{ background: 'rgba(234,255,0,0.08)', border: '1.5px solid rgba(234,255,0,0.25)', color: '#EAFF00', padding: '5px 14px', borderRadius: 50, cursor: translating === `tc${i}` ? 'wait' : 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontSize: 11, fontWeight: 700 }}>
                {translating === `tc${i}` ? '⏳' : '✨ תרגם'}
              </button>
              <button onClick={() => remove(i)} style={{ background: 'rgba(255,50,50,0.08)', border: 'none', color: 'rgba(255,80,80,0.6)', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <F label="שם — עברית">
              <input style={inp} value={tc.name} onChange={e => set(i, 'name', e.target.value)} placeholder="שם הממליץ בעברית" />
            </F>
            <F label="Name — English">
              <input style={{ ...inp, direction: 'ltr' }} value={tc.nameEn || ''} onChange={e => set(i, 'nameEn', e.target.value)} placeholder="Reviewer name in English" />
            </F>
            <F label="תפקיד — עברית">
              <input style={inp} value={tc.roleHe} onChange={e => set(i, 'roleHe', e.target.value)} placeholder="תלמיד פרטי" />
            </F>
            <F label="Role — English">
              <input style={{ ...inp, direction: 'ltr' }} value={tc.roleEn} onChange={e => set(i, 'roleEn', e.target.value)} placeholder="Private Student" />
            </F>
          </div>

          <div style={twoCol}>
            <F label="טקסט — עברית">
              <textarea style={{ ...inp, resize: 'vertical', minHeight: 90, lineHeight: 1.7 }} value={tc.textHe} onChange={e => set(i, 'textHe', e.target.value)} placeholder="הטקסט של ההמלצה בעברית..." />
            </F>
            <F label="Text — English">
              <textarea style={{ ...inp, resize: 'vertical', minHeight: 90, lineHeight: 1.7, direction: 'ltr' }} value={tc.textEn} onChange={e => set(i, 'textEn', e.target.value)} placeholder="Testimonial text in English..." />
            </F>
          </div>
        </div>
      ))}

      {testimonials.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button onClick={save} disabled={saving || !isDirty} style={{ background: saved ? 'rgba(234,255,0,0.8)' : '#EAFF00', color: '#0A0A0A', border: 'none', padding: '12px 32px', borderRadius: 50, cursor: saving || !isDirty ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 800, fontSize: 14, opacity: saving || !isDirty ? 0.6 : 1 }}>
            {saving ? 'שומר...' : saved ? '✓ נשמר' : 'שמור שינויים'}
          </button>
        </div>
      )}
    </div>
  )
}
