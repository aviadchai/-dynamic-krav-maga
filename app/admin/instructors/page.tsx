"use client"
import { useEffect, useState, useRef } from 'react'
import type { Instructor } from '@/lib/db'
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

const empty: Omit<Instructor, 'id'> = {
  nameHe: '', nameEn: '', roleHe: '', roleEn: '',
  bioHe: '', bioEn: '', image: '', order: 1,
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [editing, setEditing] = useState<Instructor | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const data = await fetch('/api/instructors').then(r => r.json())
    setInstructors(data)
  }

  useEffect(() => { load() }, [])

  function startNew() {
    setEditing(null)
    setForm(empty)
  }

  function startEdit(inst: Instructor) {
    setEditing(inst)
    setForm({ nameHe: inst.nameHe, nameEn: inst.nameEn, roleHe: inst.roleHe, roleEn: inst.roleEn, bioHe: inst.bioHe, bioEn: inst.bioEn, image: inst.image, order: inst.order })
  }

  function set(key: string, value: string | number) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function save() {
    setSaving(true)
    if (editing) {
      await fetch(`/api/instructors/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/instructors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    setSaving(false)
    setEditing(null)
    setForm(empty)
    load()
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
    if (!confirm('למחוק את המאמן?')) return
    await fetch(`/api/instructors/${id}`, { method: 'DELETE' })
    load()
  }

  function onDragStart(id: string) { setDragId(id) }
  function onDragOver(e: React.DragEvent, id: string) { e.preventDefault(); setDragOverId(id) }
  function onDragEnd() { setDragId(null); setDragOverId(null) }

  async function onDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return }
    const sorted = [...instructors].sort((a, b) => a.order - b.order)
    const fromIdx = sorted.findIndex(i => i.id === dragId)
    const toIdx = sorted.findIndex(i => i.id === targetId)
    const reordered = [...sorted]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)
    const updated = reordered.map((inst, idx) => ({ ...inst, order: idx + 1 }))
    setInstructors(updated)
    setDragId(null); setDragOverId(null)
    await Promise.all(updated.map(inst =>
      fetch(`/api/instructors/${inst.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inst),
      })
    ))
  }

  const sorted = [...instructors].sort((a, b) => a.order - b.order)

  return (
    <div style={{ padding: '2.5rem', direction: 'rtl' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>מאמנים</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 }}>גרור כדי לסדר מחדש</p>
        </div>
        <button onClick={startNew} style={{
          background: '#EAFF00', color: '#0A0A0A', border: 'none',
          padding: '11px 24px', borderRadius: 50,
          fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 800, fontSize: 13, cursor: 'pointer',
        }}>
          + מאמן חדש
        </button>
      </div>

      {/* Instructor cards — draggable */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {sorted.map((inst) => (
          <div
            key={inst.id}
            className="inst-admin-card"
            draggable
            onDragStart={() => onDragStart(inst.id)}
            onDragOver={e => onDragOver(e, inst.id)}
            onDrop={e => onDrop(e, inst.id)}
            onDragEnd={onDragEnd}
            style={{
              background: '#141414',
              border: `1.5px solid ${dragOverId === inst.id ? 'rgba(234,255,0,0.4)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 14, padding: '1.5rem',
              opacity: dragId === inst.id ? 0.45 : 1,
              cursor: 'grab', transition: 'border-color .15s, opacity .15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              {/* Drag handle */}
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 16, flexShrink: 0, letterSpacing: 2, userSelect: 'none' }}>⠿</div>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: '#1C1C1C',
                backgroundImage: inst.image ? `url(${inst.image})` : 'none',
                backgroundSize: 'cover', backgroundPosition: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
              }}>
                {!inst.image && '👤'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inst.nameHe}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{inst.roleHe}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => startEdit(inst)} style={{
                  background: 'rgba(255,255,255,0.08)', border: 'none',
                  color: 'rgba(255,255,255,0.7)', padding: '6px 12px',
                  borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontSize: 12,
                }}>עריכה</button>
                <button onClick={() => del(inst.id)} style={{
                  background: 'rgba(255,50,50,0.08)', border: 'none',
                  color: 'rgba(255,80,80,0.7)', padding: '6px 10px',
                  borderRadius: 8, cursor: 'pointer', fontSize: 12,
                }}>✕</button>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, margin: 0 }}>
              {inst.bioHe}
            </p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>
          {editing ? 'עריכת מאמן' : 'הוספת מאמן חדש'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#EAFF00', textTransform: 'uppercase', marginBottom: '1rem' }}>עברית</div>
            <F label="שם"><input style={inp} value={form.nameHe} onChange={e => set('nameHe', e.target.value)} placeholder="שם המאמן" /></F>
            <F label="תפקיד"><input style={inp} value={form.roleHe} onChange={e => set('roleHe', e.target.value)} placeholder="מדריך ראשי" /></F>
            <F label="ביוגרפיה"><textarea style={{ ...inp, resize: 'vertical', minHeight: 100, lineHeight: 1.7 }} value={form.bioHe} onChange={e => set('bioHe', e.target.value)} placeholder="קצת עליי..." /></F>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '1rem' }}>English</div>
            <F label="Name"><input style={{ ...inp, direction: 'ltr' }} value={form.nameEn} onChange={e => set('nameEn', e.target.value)} placeholder="Instructor name" /></F>
            <F label="Role"><input style={{ ...inp, direction: 'ltr' }} value={form.roleEn} onChange={e => set('roleEn', e.target.value)} placeholder="Head Instructor" /></F>
            <F label="Bio"><textarea style={{ ...inp, resize: 'vertical', minHeight: 100, lineHeight: 1.7, direction: 'ltr' }} value={form.bioEn} onChange={e => set('bioEn', e.target.value)} placeholder="A bit about me..." /></F>
          </div>
        </div>
        <F label="תמונה">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {form.image && <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#1C1C1C', backgroundImage: `url(${form.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.08)' }} />}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImgUpload} style={{ display: 'none' }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ background: 'rgba(234,255,0,0.08)', border: '1.5px solid rgba(234,255,0,0.2)', color: '#EAFF00', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontSize: 12, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>
              {uploading ? 'מעלה...' : '⬆ העלה'}
            </button>
            <input style={{ ...inp, flex: 1, fontSize: 12 }} value={form.image} onChange={e => set('image', e.target.value)} placeholder="או URL..." dir="ltr" />
          </div>
        </F>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
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
            {saving ? 'שומר...' : (editing ? 'שמור שינויים' : 'הוסף מאמן')}
          </button>
        </div>
      </div>
    </div>
  )
}
