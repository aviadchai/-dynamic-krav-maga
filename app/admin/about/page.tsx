"use client"
import { useEffect, useState, useRef } from 'react'
import type { TimelineEntry } from '@/lib/db'
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

const emptyEntry = (): Omit<TimelineEntry, 'id'> => ({
  year: '', titleHe: '', titleEn: '', textHe: '', textEn: '', image: '', order: 1,
})

export default function AboutAdminPage() {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [editing, setEditing] = useState<TimelineEntry | null>(null)
  const [form, setForm] = useState(emptyEntry())
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const res = await fetch('/api/content')
    const data = await res.json()
    setEntries((data.aboutTimeline || []) as TimelineEntry[])
  }

  useEffect(() => { load() }, [])

  function startNew() { setEditing(null); setForm(emptyEntry()) }

  function startEdit(entry: TimelineEntry) {
    setEditing(entry)
    setForm({ year: entry.year, titleHe: entry.titleHe, titleEn: entry.titleEn, textHe: entry.textHe, textEn: entry.textEn, image: entry.image || '', order: entry.order })
  }

  function set(key: string, value: string | number) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function save() {
    setSaving(true)
    let updated: TimelineEntry[]
    if (editing) {
      updated = entries.map(e => e.id === editing.id ? { ...editing, ...form } : e)
    } else {
      const newEntry: TimelineEntry = {
        id: Date.now().toString(),
        ...form,
        order: entries.length + 1,
      }
      updated = [...entries, newEntry]
    }
    await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aboutTimeline: updated }),
    })
    setSaving(false)
    setEditing(null)
    setForm(emptyEntry())
    load()
  }

  async function del(id: string) {
    if (!confirm('למחוק את הרשומה?')) return
    const updated = entries.filter(e => e.id !== id).map((e, i) => ({ ...e, order: i + 1 }))
    await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aboutTimeline: updated }),
    })
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

  function onDragStart(id: string) { setDragId(id) }
  function onDragOver(e: React.DragEvent, id: string) { e.preventDefault(); setDragOverId(id) }
  function onDragEnd() { setDragId(null); setDragOverId(null) }

  async function onDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return }
    const sorted = [...entries].sort((a, b) => a.order - b.order)
    const fromIdx = sorted.findIndex(i => i.id === dragId)
    const toIdx = sorted.findIndex(i => i.id === targetId)
    const reordered = [...sorted]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)
    const updated = reordered.map((entry, idx) => ({ ...entry, order: idx + 1 }))
    setEntries(updated)
    setDragId(null); setDragOverId(null)
    await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aboutTimeline: updated }),
    })
  }

  const sorted = [...entries].sort((a, b) => a.order - b.order)

  return (
    <div style={{ padding: '2.5rem', direction: 'rtl' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>טיימליין — אודותינו</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 }}>גרור כדי לסדר מחדש</p>
        </div>
        <button onClick={startNew} style={{
          background: '#EAFF00', color: '#0A0A0A', border: 'none',
          padding: '11px 24px', borderRadius: 50,
          fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 800, fontSize: 13, cursor: 'pointer',
        }}>
          + רשומה חדשה
        </button>
      </div>

      {/* Timeline entries — draggable */}
      {sorted.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {sorted.map((entry) => (
            <div
              key={entry.id}
              draggable
              onDragStart={() => onDragStart(entry.id)}
              onDragOver={e => onDragOver(e, entry.id)}
              onDrop={e => onDrop(e, entry.id)}
              onDragEnd={onDragEnd}
              style={{
                background: '#141414',
                border: `1.5px solid ${dragOverId === entry.id ? 'rgba(234,255,0,0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 14, padding: '1.25rem 1.5rem',
                opacity: dragId === entry.id ? 0.45 : 1,
                cursor: 'grab', transition: 'border-color .15s, opacity .15s',
                display: 'flex', alignItems: 'flex-start', gap: '1.25rem',
              }}
            >
              {/* drag handle + year */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 16, letterSpacing: 2, userSelect: 'none' }}>⠿</div>
                <div style={{
                  background: '#EAFF00', color: '#0A0A0A',
                  fontSize: 11, fontWeight: 900, padding: '3px 8px',
                  borderRadius: 6, letterSpacing: 1, whiteSpace: 'nowrap',
                }}>
                  {entry.year || '—'}
                </div>
              </div>
              {/* image preview */}
              {entry.image && (
                <div style={{
                  width: 52, height: 52, borderRadius: 8, flexShrink: 0,
                  backgroundImage: `url(${entry.image})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                }} />
              )}
              {/* text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: 15, marginBottom: 4 }}>{entry.titleHe}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{entry.textHe}</div>
              </div>
              {/* actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => startEdit(entry)} style={{
                  background: 'rgba(255,255,255,0.08)', border: 'none',
                  color: 'rgba(255,255,255,0.7)', padding: '6px 12px',
                  borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontSize: 12,
                }}>עריכה</button>
                <button onClick={() => del(entry.id)} style={{
                  background: 'rgba(255,50,50,0.08)', border: 'none',
                  color: 'rgba(255,80,80,0.7)', padding: '6px 10px',
                  borderRadius: 8, cursor: 'pointer', fontSize: 12,
                }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>
          {editing ? 'עריכת רשומה' : 'הוספת רשומה חדשה'}
        </h2>

        <F label="שנה">
          <input style={{ ...inp, maxWidth: 140 }} value={form.year} onChange={e => set('year', e.target.value)} placeholder="2010" dir="ltr" />
        </F>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#EAFF00', textTransform: 'uppercase', marginBottom: '1rem' }}>עברית</div>
            <F label="כותרת"><input style={inp} value={form.titleHe} onChange={e => set('titleHe', e.target.value)} placeholder="כותרת האירוע" /></F>
            <F label="תיאור"><textarea style={{ ...inp, resize: 'vertical', minHeight: 100, lineHeight: 1.7 }} value={form.textHe} onChange={e => set('textHe', e.target.value)} placeholder="תיאור קצר..." /></F>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '1rem' }}>English</div>
            <F label="Title"><input style={{ ...inp, direction: 'ltr' }} value={form.titleEn} onChange={e => set('titleEn', e.target.value)} placeholder="Event title" /></F>
            <F label="Description"><textarea style={{ ...inp, resize: 'vertical', minHeight: 100, lineHeight: 1.7, direction: 'ltr' }} value={form.textEn} onChange={e => set('textEn', e.target.value)} placeholder="Short description..." /></F>
          </div>
        </div>

        <F label="תמונה (אופציונלי)">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {form.image && <div style={{ width: 50, height: 50, borderRadius: 8, background: '#1C1C1C', backgroundImage: `url(${form.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.08)' }} />}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImgUpload} style={{ display: 'none' }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ background: 'rgba(234,255,0,0.08)', border: '1.5px solid rgba(234,255,0,0.2)', color: '#EAFF00', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontSize: 12, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>
              {uploading ? 'מעלה...' : '⬆ העלה'}
            </button>
            <input style={{ ...inp, flex: 1, fontSize: 12 }} value={form.image} onChange={e => set('image', e.target.value)} placeholder="או URL..." dir="ltr" />
          </div>
        </F>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          {editing && (
            <button onClick={() => { setEditing(null); setForm(emptyEntry()) }} style={{
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
            {saving ? 'שומר...' : (editing ? 'שמור שינויים' : 'הוסף רשומה')}
          </button>
        </div>
      </div>
    </div>
  )
}
