"use client"
import { useEffect, useState, useRef } from 'react'
import type { Senior } from '@/lib/db'
import { compressImage } from '@/lib/compress'

const F = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ marginBottom: '1rem' }}>
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
}

const empty: Omit<Senior, 'id'> = {
  nameHe: '', nameEn: '', roleHe: '', roleEn: '',
  shortBioHe: '', shortBioEn: '', image: '', order: 1,
}

export default function SeniorsPage() {
  const [seniors, setSeniors] = useState<Senior[]>([])
  const [editing, setEditing] = useState<Senior | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [translating, setTranslating] = useState(false)
  const dragIdRef = useRef<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  async function load() {
    const data = await fetch('/api/seniors').then(r => r.json())
    setSeniors(data)
  }

  useEffect(() => { load() }, [])

  function startNew() {
    setEditing(null)
    setForm(empty)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function startEdit(s: Senior) {
    setEditing(s)
    setForm({ nameHe: s.nameHe, nameEn: s.nameEn, roleHe: s.roleHe, roleEn: s.roleEn, shortBioHe: s.shortBioHe, shortBioEn: s.shortBioEn, image: s.image, order: s.order })
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function set(key: string, value: string | number) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function save() {
    setSaving(true)
    setSaveError(null)
    try {
      const res = editing
        ? await fetch(`/api/seniors/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        : await fetch('/api/seniors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) {
        const text = await res.text()
        setSaveError(`שגיאה ${res.status}: ${text}`)
        return
      }
      setEditing(null)
      setForm(empty)
      load()
    } catch (e) {
      setSaveError(String(e))
    } finally {
      setSaving(false)
    }
  }

  async function translateForm() {
    if (!form.nameHe && !form.roleHe && !form.shortBioHe) return
    setTranslating(true)
    try {
      const res = await fetch('/api/translate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { nameHe: form.nameHe, roleHe: form.roleHe, shortBioHe: form.shortBioHe } }),
      })
      const { translations } = await res.json()
      setForm(f => ({
        ...f,
        nameEn: translations.nameHe || f.nameEn,
        roleEn: translations.roleHe || f.roleEn,
        shortBioEn: translations.shortBioHe || f.shortBioEn,
      }))
    } finally { setTranslating(false) }
  }

  async function handleImgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const compressed = await compressImage(file)
    const fd = new FormData(); fd.append('file', compressed)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    set('image', url); setUploading(false)
  }

  async function del(id: string) {
    if (!confirm('למחוק את הבכיר?')) return
    await fetch(`/api/seniors/${id}`, { method: 'DELETE' })
    load()
  }

  function onDragStart(id: string) { dragIdRef.current = id }
  function onDragOver(e: React.DragEvent, id: string) { e.preventDefault(); setDragOverId(id) }
  function onDragEnd() { dragIdRef.current = null; setDragOverId(null) }

  async function onDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    const dragId = dragIdRef.current
    if (!dragId || dragId === targetId) { dragIdRef.current = null; setDragOverId(null); return }
    const sorted = [...seniors].sort((a, b) => a.order - b.order)
    const fromIdx = sorted.findIndex(i => i.id === dragId)
    const toIdx = sorted.findIndex(i => i.id === targetId)
    const reordered = [...sorted]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)
    const updated = reordered.map((s, idx) => ({ ...s, order: idx + 1 }))
    setSeniors(updated)
    dragIdRef.current = null; setDragOverId(null)
    await Promise.all(updated.map(s =>
      fetch(`/api/seniors/${s.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      })
    ))
  }

  const sorted = [...seniors].sort((a, b) => a.order - b.order)

  return (
    <div style={{ padding: 'clamp(1rem, 4vw, 2.5rem)', direction: 'rtl', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.3rem, 5vw, 1.8rem)', fontWeight: 900, color: '#fff' }}>בכירים</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 }}>גרור כדי לסדר מחדש · מוצגים בסקשן הבכירים באתר</p>
        </div>
        <button onClick={startNew} style={{
          background: '#EAFF00', color: '#0A0A0A', border: 'none',
          padding: '11px 24px', borderRadius: 50,
          fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 800, fontSize: 13, cursor: 'pointer',
          flexShrink: 0,
        }}>
          + בכיר חדש
        </button>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem' }}>
        {sorted.map((s, idx) => (
          <div
            key={s.id}
            draggable
            onDragStart={() => onDragStart(s.id)}
            onDragOver={e => onDragOver(e, s.id)}
            onDrop={e => onDrop(e, s.id)}
            onDragEnd={onDragEnd}
            style={{
              background: '#141414',
              border: `1.5px solid ${dragOverId === s.id ? 'rgba(234,255,0,0.4)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 12, padding: '0.75rem 1rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              cursor: 'grab', transition: 'border-color .15s',
            }}
          >
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, fontWeight: 700, width: 20, textAlign: 'center', flexShrink: 0 }}>{idx + 1}</div>
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 18, flexShrink: 0, letterSpacing: 2, userSelect: 'none' }}>⠿</div>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1C1C1C', backgroundImage: s.image ? `url(${s.image})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.07)' }}>
              {!s.image && '👤'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nameHe}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.roleHe}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button onClick={() => startEdit(s)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.7)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontSize: 12, whiteSpace: 'nowrap' }}>עריכה</button>
              <button onClick={() => del(s.id)} style={{ background: 'rgba(255,50,50,0.08)', border: 'none', color: 'rgba(255,80,80,0.7)', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>✕</button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '2rem', fontSize: 14 }}>אין בכירים עדיין</div>
        )}
      </div>

      {/* Form */}
      <div ref={formRef} style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 'clamp(1rem, 4vw, 1.5rem)' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>
          {editing ? `עריכה: ${editing.nameHe}` : 'הוספת בכיר חדש'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#EAFF00', textTransform: 'uppercase', marginBottom: '1rem' }}>עברית</div>
            <F label="שם"><input style={inp} value={form.nameHe} onChange={e => set('nameHe', e.target.value)} placeholder="שם הבכיר" /></F>
            <F label="תפקיד"><input style={inp} value={form.roleHe} onChange={e => set('roleHe', e.target.value)} placeholder="מאמן בכיר" /></F>
            <F label="תקציר קצר (3 משפטים)">
              <textarea style={{ ...inp, resize: 'vertical', minHeight: 90, lineHeight: 1.7 }} value={form.shortBioHe} onChange={e => set('shortBioHe', e.target.value)} placeholder="תקציר קצר..." />
            </F>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>English</div>
              <button type="button" onClick={translateForm} disabled={translating}
                style={{ background: 'rgba(234,255,0,0.08)', border: '1.5px solid rgba(234,255,0,0.25)', color: '#EAFF00', padding: '5px 14px', borderRadius: 50, cursor: translating ? 'wait' : 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontSize: 11, fontWeight: 700 }}>
                {translating ? '⏳ מתרגם...' : '✨ תרגם'}
              </button>
            </div>
            <F label="Name"><input style={{ ...inp, direction: 'ltr' }} value={form.nameEn} onChange={e => set('nameEn', e.target.value)} placeholder="Senior name" /></F>
            <F label="Role"><input style={{ ...inp, direction: 'ltr' }} value={form.roleEn} onChange={e => set('roleEn', e.target.value)} placeholder="Senior Instructor" /></F>
            <F label="Short Bio (3 sentences)">
              <textarea style={{ ...inp, resize: 'vertical', minHeight: 90, lineHeight: 1.7, direction: 'ltr' }} value={form.shortBioEn} onChange={e => set('shortBioEn', e.target.value)} placeholder="Short summary..." />
            </F>
          </div>
        </div>

        <F label="תמונה">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {form.image && <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#1C1C1C', backgroundImage: `url(${form.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.08)' }} />}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImgUpload} style={{ display: 'none' }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ background: 'rgba(234,255,0,0.08)', border: '1.5px solid rgba(234,255,0,0.2)', color: '#EAFF00', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontSize: 12, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>
              {uploading ? 'מעלה...' : '⬆ העלה'}
            </button>
            <input style={{ ...inp, flex: 1, minWidth: 120, fontSize: 12 }} value={form.image} onChange={e => set('image', e.target.value)} placeholder="או URL..." dir="ltr" />
          </div>
        </F>

        {saveError && (
          <div style={{ background: 'rgba(255,50,50,0.1)', border: '1.5px solid rgba(255,80,80,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: '1rem', fontSize: 13, color: 'rgba(255,120,120,0.9)', direction: 'ltr', wordBreak: 'break-all' }}>
            {saveError}
          </div>
        )}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          {editing && (
            <button onClick={() => { setEditing(null); setForm(empty) }} style={{
              border: '1.5px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', background: 'none',
              padding: '11px 24px', borderRadius: 50, cursor: 'pointer',
              fontFamily: 'var(--font-heebo), sans-serif', fontSize: 13,
            }}>ביטול</button>
          )}
          <button onClick={save} disabled={saving} style={{
            background: '#EAFF00', color: '#0A0A0A', border: 'none',
            padding: '11px 28px', borderRadius: 50, cursor: 'pointer',
            fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 800, fontSize: 13,
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'שומר...' : (editing ? 'שמור שינויים' : 'הוסף בכיר')}
          </button>
        </div>
      </div>
    </div>
  )
}
