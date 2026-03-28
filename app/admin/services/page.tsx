"use client"
import { useEffect, useRef, useState } from 'react'
import type { ServiceItem } from '@/lib/db'
import { compressImage } from '@/lib/compress'

const inp: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1.5px solid rgba(255,255,255,0.1)',
  color: '#fff', padding: '11px 14px', borderRadius: 10,
  fontFamily: 'var(--font-heebo), sans-serif', fontSize: 14, outline: 'none',
}
const ta: React.CSSProperties = { ...inp, resize: 'vertical', minHeight: 100, lineHeight: 1.7 }
const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{label}</label>
    {children}
  </div>
)

const empty: ServiceItem = { n: '', he: '', en: '', dHe: '', dEn: '', bodyHe: '', bodyEn: '', image: '' }

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState<number | null>(null) // index, or -1 for new
  const [form, setForm] = useState<ServiceItem>(empty)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const d = await fetch('/api/content').then(r => r.json())
    setServices(d.services || [])
  }
  useEffect(() => { load() }, [])

  function setF(key: keyof ServiceItem, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleImgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const compressed = await compressImage(file)
    const fd = new FormData(); fd.append('file', compressed)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    setF('image', url); setUploading(false)
  }

  async function saveAll(list: ServiceItem[]) {
    setSaving(true)
    await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ services: list }),
    })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  function startNew() { setEditing(-1); setForm({ ...empty, n: String(services.length + 1).padStart(2, '0') }) }
  function startEdit(i: number) { setEditing(i); setForm({ ...services[i] }) }
  function cancelEdit() { setEditing(null); setForm(empty) }

  async function submitForm() {
    let updated: ServiceItem[]
    if (editing === -1) {
      updated = [...services, form]
    } else {
      updated = services.map((s, i) => i === editing ? form : s)
    }
    setServices(updated)
    setEditing(null)
    setForm(empty)
    await saveAll(updated)
  }

  async function del(i: number) {
    if (!confirm('למחוק שירות זה?')) return
    const updated = services.filter((_, idx) => idx !== i)
    setServices(updated)
    await saveAll(updated)
  }

  function move(i: number, dir: 'up' | 'down') {
    const arr = [...services]
    const swap = dir === 'up' ? i - 1 : i + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    setServices(arr)
  }

  return (
    <div style={{ padding: '2.5rem', direction: 'rtl', maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>שירותים</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {services.length > 0 && editing === null && (
            <button onClick={() => saveAll(services)} disabled={saving} style={{ background: saved ? 'rgba(234,255,0,0.8)' : '#EAFF00', color: '#0A0A0A', border: 'none', padding: '11px 24px', borderRadius: 50, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 800, fontSize: 13 }}>
              {saving ? 'שומר...' : saved ? '✓ נשמר' : 'שמור סדר'}
            </button>
          )}
          {editing === null && (
            <button onClick={startNew} style={{ background: '#EAFF00', color: '#0A0A0A', border: 'none', padding: '11px 24px', borderRadius: 50, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 800, fontSize: 13 }}>
              + שירות חדש
            </button>
          )}
        </div>
      </div>

      {/* Services list */}
      {editing === null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {services.map((s, i) => (
            <div key={i} style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {s.image && (
                <div style={{ width: 72, height: 48, borderRadius: 8, backgroundImage: `url(${s.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#EAFF00', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{s.n}</div>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: 15 }}>{s.he}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.dHe}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button onClick={() => move(i, 'up')} disabled={i === 0} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: i === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)', width: 30, height: 30, borderRadius: 6, cursor: i === 0 ? 'default' : 'pointer', fontSize: 13 }}>↑</button>
                <button onClick={() => move(i, 'down')} disabled={i === services.length - 1} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: i === services.length - 1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)', width: 30, height: 30, borderRadius: 6, cursor: i === services.length - 1 ? 'default' : 'pointer', fontSize: 13 }}>↓</button>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => startEdit(i)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.6)', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-heebo), sans-serif' }}>עריכה</button>
                <button onClick={() => del(i)} style={{ background: 'rgba(255,50,50,0.08)', border: 'none', color: 'rgba(255,80,80,0.7)', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {editing !== null && (
        <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '1.75rem' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>
            {editing === -1 ? 'שירות חדש' : `עריכת: ${form.he}`}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#EAFF00', textTransform: 'uppercase', marginBottom: '1rem' }}>עברית</div>
              <F label="מספר (01, 02...)"><input style={inp} value={form.n} onChange={e => setF('n', e.target.value)} placeholder="01" /></F>
              <F label="שם שירות"><input style={inp} value={form.he} onChange={e => setF('he', e.target.value)} placeholder="שיעורים פרטיים" /></F>
              <F label="תיאור קצר"><textarea style={ta} value={form.dHe} onChange={e => setF('dHe', e.target.value)} /></F>
              <F label="תוכן מפורט (פופאפ)"><textarea style={{ ...ta, minHeight: 160 }} value={form.bodyHe} onChange={e => setF('bodyHe', e.target.value)} /></F>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '1rem' }}>English</div>
              <F label="Number"><input style={inp} value={form.n} readOnly /></F>
              <F label="Service Name"><input style={{ ...inp, direction: 'ltr' }} value={form.en} onChange={e => setF('en', e.target.value)} placeholder="Private Lessons" /></F>
              <F label="Short Description"><textarea style={{ ...ta, direction: 'ltr' }} value={form.dEn} onChange={e => setF('dEn', e.target.value)} /></F>
              <F label="Full Content (popup)"><textarea style={{ ...ta, minHeight: 160, direction: 'ltr' }} value={form.bodyEn} onChange={e => setF('bodyEn', e.target.value)} /></F>
            </div>
          </div>

          {/* Image */}
          <F label="תמונה לשירות (אופציונלי)">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {form.image && <div style={{ width: 80, height: 52, borderRadius: 8, backgroundImage: `url(${form.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }} />}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImgUpload} style={{ display: 'none' }} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ background: 'rgba(234,255,0,0.08)', border: '1.5px solid rgba(234,255,0,0.2)', color: '#EAFF00', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-heebo), sans-serif', whiteSpace: 'nowrap' }}>
                {uploading ? 'מעלה...' : '⬆ העלה'}
              </button>
              <input style={{ ...inp, flex: 1, fontSize: 12 }} value={form.image || ''} onChange={e => setF('image', e.target.value)} placeholder="או URL..." dir="ltr" />
              {form.image && <button onClick={() => setF('image', '')} style={{ background: 'rgba(255,50,50,0.08)', border: 'none', color: 'rgba(255,80,80,0.6)', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>✕</button>}
            </div>
          </F>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button onClick={cancelEdit} style={{ border: '1.5px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', background: 'none', padding: '11px 24px', borderRadius: 50, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontSize: 13 }}>ביטול</button>
            <button onClick={submitForm} disabled={saving} style={{ background: '#EAFF00', color: '#0A0A0A', border: 'none', padding: '11px 28px', borderRadius: 50, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 800, fontSize: 13 }}>
              {saving ? 'שומר...' : 'שמור'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
