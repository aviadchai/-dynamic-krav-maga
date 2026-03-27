"use client"
import { useEffect, useState } from 'react'
import type { Instructor } from '@/lib/db'

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

  async function del(id: string) {
    if (!confirm('למחוק את המאמן?')) return
    await fetch(`/api/instructors/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div style={{ padding: '2.5rem', direction: 'rtl' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>מאמנים</h1>
        <button onClick={startNew} style={{
          background: '#EAFF00', color: '#0A0A0A', border: 'none',
          padding: '11px 24px', borderRadius: 50,
          fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 800, fontSize: 13, cursor: 'pointer',
        }}>
          + מאמן חדש
        </button>
      </div>

      {/* Instructor cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {instructors.map(inst => (
          <div key={inst.id} style={{
            background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)',
            borderRadius: 14, padding: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
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
              <div>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: 15 }}>{inst.nameHe}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{inst.roleHe}</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: '1rem' }}>
              {inst.bioHe}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => startEdit(inst)} style={{
                flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none',
                color: 'rgba(255,255,255,0.6)', padding: '8px', borderRadius: 8,
                cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontSize: 12,
              }}>עריכה</button>
              <button onClick={() => del(inst.id)} style={{
                background: 'rgba(255,50,50,0.08)', border: 'none',
                color: 'rgba(255,80,80,0.7)', padding: '8px 12px',
                borderRadius: 8, cursor: 'pointer', fontSize: 12,
              }}>✕</button>
            </div>
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
        <F label="תמונה (URL)"><input style={inp} value={form.image} onChange={e => set('image', e.target.value)} placeholder="/images/instructor.jpg" /></F>
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
