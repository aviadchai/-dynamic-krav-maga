"use client"
import { useState, useRef } from 'react'
import Link from 'next/link'
import type { Article } from '@/lib/db'
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
  fontFamily: 'var(--font-heebo), sans-serif', fontSize: 14,
  outline: 'none', direction: 'rtl',
}

const sel: React.CSSProperties = {
  ...inp, background: '#1C1C1C', cursor: 'pointer',
}

const ta: React.CSSProperties = {
  ...inp, resize: 'vertical', minHeight: 120, lineHeight: 1.8,
}

type Props = {
  initialData?: Article
  onSave: (data: object) => void
  saving: boolean
}

const CATS_HE = ['הגנה עצמית', 'מנטליות', 'לילדים', 'טכניקה', 'כושר', 'כללי']
const CATS_EN = ['Self Defense', 'Mindset', 'For Kids', 'Technique', 'Fitness', 'General']

export function ArticleForm({ initialData, onSave, saving }: Props) {
  const [data, setData] = useState({
    titleHe: '', titleEn: '',
    excerptHe: '', excerptEn: '',
    bodyHe: '', bodyEn: '',
    categoryHe: 'הגנה עצמית', categoryEn: 'Self Defense',
    image: '',
    bodyImage: '',
    date: new Date().toISOString().slice(0, 10),
    published: false,
    author: '',
    ...(initialData || {}),
  })
  const [uploading, setUploading] = useState(false)
  const [uploadingBody, setUploadingBody] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const fileBodyRef = useRef<HTMLInputElement>(null)

  function set(key: string, value: string | boolean) {
    setData(d => ({ ...d, [key]: value }))
  }

  function handleCat(val: string) {
    const idx = CATS_HE.indexOf(val)
    set('categoryHe', val)
    if (idx !== -1) set('categoryEn', CATS_EN[idx])
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const compressed = await compressImage(file)
    const fd = new FormData()
    fd.append('file', compressed)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    set('image', url)
    setUploading(false)
  }

  async function handleBodyImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBody(true)
    const compressed = await compressImage(file)
    const fd = new FormData()
    fd.append('file', compressed)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    set('bodyImage', url)
    setUploadingBody(false)
  }

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Main content */}
      <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.75rem', marginBottom: '1.5rem' }}>
        <F label="כותרת">
          <input style={inp} value={data.titleHe} onChange={e => set('titleHe', e.target.value)} placeholder="כותרת המאמר" />
        </F>
        <F label="תקציר">
          <textarea style={ta} value={data.excerptHe} onChange={e => set('excerptHe', e.target.value)} placeholder="תקציר קצר שיופיע בכרטיסיית המאמר..." />
        </F>
        <F label="תוכן המאמר">
          <textarea style={{ ...ta, minHeight: 360 }} value={data.bodyHe} onChange={e => set('bodyHe', e.target.value)} placeholder="כתוב את המאמר כאן...&#10;&#10;ניתן לרשום כל שורה חדשה בשורה חדשה." />
        </F>
      </div>

      {/* Image upload */}
      <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#EAFF00', textTransform: 'uppercase', marginBottom: '1rem' }}>תמונה</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          {/* Preview */}
          <div style={{
            width: 120, height: 80, borderRadius: 10, flexShrink: 0,
            background: '#1C1C1C', border: '1.5px solid rgba(255,255,255,0.08)',
            backgroundImage: data.image ? `url(${data.image})` : 'none',
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.2)', fontSize: 24,
          }}>
            {!data.image && '🖼'}
          </div>
          <div style={{ flex: 1 }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                background: 'rgba(234,255,0,0.08)', border: '1.5px solid rgba(234,255,0,0.2)',
                color: '#EAFF00', padding: '9px 20px', borderRadius: 8,
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-heebo), sans-serif', fontSize: 13, fontWeight: 700,
                display: 'block', marginBottom: 8,
              }}>
              {uploading ? 'מעלה...' : '⬆ העלה תמונה'}
            </button>
            <input
              style={{ ...inp, fontSize: 12, padding: '8px 12px' }}
              value={data.image}
              onChange={e => set('image', e.target.value)}
              placeholder="או הכנס URL ישירות..."
            />
          </div>
        </div>
      </div>

      {/* Body image */}
      <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#EAFF00', textTransform: 'uppercase', marginBottom: '1rem' }}>תמונה נוספת במאמר (אופציונלי)</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{
            width: 120, height: 68, borderRadius: 10, flexShrink: 0,
            background: '#1C1C1C', border: '1.5px solid rgba(255,255,255,0.08)',
            backgroundImage: (data as { bodyImage?: string }).bodyImage ? `url(${(data as { bodyImage?: string }).bodyImage})` : 'none',
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.2)', fontSize: 24,
          }}>
            {!(data as { bodyImage?: string }).bodyImage && '🖼'}
          </div>
          <div style={{ flex: 1 }}>
            <input ref={fileBodyRef} type="file" accept="image/*" onChange={handleBodyImageUpload} style={{ display: 'none' }} />
            <button type="button" onClick={() => fileBodyRef.current?.click()} disabled={uploadingBody} style={{
              background: 'rgba(234,255,0,0.08)', border: '1.5px solid rgba(234,255,0,0.2)',
              color: '#EAFF00', padding: '9px 20px', borderRadius: 8,
              cursor: uploadingBody ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-heebo), sans-serif', fontSize: 13, fontWeight: 700,
              display: 'block', marginBottom: 8,
            }}>
              {uploadingBody ? 'מעלה...' : '⬆ העלה תמונה'}
            </button>
            <input style={{ ...inp, fontSize: 12, padding: '8px 12px' }} value={(data as { bodyImage?: string }).bodyImage || ''} onChange={e => set('bodyImage', e.target.value)} placeholder="או הכנס URL ישירות..." />
          </div>
        </div>
      </div>

      {/* Author */}
      <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <F label="כותב המאמר">
          <input style={inp} value={data.author} onChange={e => set('author', e.target.value)} placeholder="שם הכותב" />
        </F>
      </div>

      {/* Meta */}
      <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <F label="קטגוריה">
          <select style={sel} value={data.categoryHe} onChange={e => handleCat(e.target.value)}>
            {CATS_HE.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </F>
        <F label="תאריך">
          <input type="date" style={inp} value={data.date} onChange={e => set('date', e.target.value)} />
        </F>
        <F label="סטטוס">
          <button type="button" onClick={() => set('published', !data.published)} style={{
            width: '100%', padding: '11px 14px', borderRadius: 10, cursor: 'pointer',
            border: `1.5px solid ${data.published ? 'rgba(234,255,0,0.3)' : 'rgba(255,255,255,0.1)'}`,
            background: data.published ? 'rgba(234,255,0,0.08)' : 'rgba(255,255,255,0.04)',
            color: data.published ? '#EAFF00' : 'rgba(255,255,255,0.4)',
            fontFamily: 'var(--font-heebo), sans-serif', fontSize: 14, fontWeight: 700,
          }}>
            {data.published ? '✓ מפורסם' : '○ טיוטה'}
          </button>
        </F>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-start' }}>
        <button onClick={() => onSave(data)} disabled={saving} style={{
          background: '#EAFF00', color: '#0A0A0A', border: 'none',
          padding: '12px 32px', borderRadius: 50,
          fontFamily: 'var(--font-heebo), sans-serif', fontSize: 14, fontWeight: 800,
          cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
        }}>
          {saving ? 'שומר...' : 'שמור מאמר'}
        </button>
        <Link href="/admin/articles" style={{
          border: '1.5px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)',
          padding: '12px 24px', borderRadius: 50, textDecoration: 'none', fontSize: 14,
        }}>
          ביטול
        </Link>
      </div>
    </div>
  )
}
