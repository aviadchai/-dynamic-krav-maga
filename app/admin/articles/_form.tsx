"use client"
import { useState } from 'react'
import Link from 'next/link'
import type { Article } from '@/lib/db'

const F = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
      {label}
    </label>
    {children}
  </div>
)

const input: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1.5px solid rgba(255,255,255,0.1)',
  color: '#fff', padding: '11px 14px', borderRadius: 10,
  fontFamily: 'var(--font-heebo), sans-serif', fontSize: 14,
  outline: 'none',
}

const textarea: React.CSSProperties = {
  ...input, resize: 'vertical', minHeight: 120, lineHeight: 1.7,
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
    date: new Date().toISOString().slice(0, 10),
    published: false,
    ...(initialData || {}),
  })

  function set(key: string, value: string | boolean) {
    setData(d => ({ ...d, [key]: value }))
  }

  function handleCategoryHe(val: string) {
    const idx = CATS_HE.indexOf(val)
    set('categoryHe', val)
    if (idx !== -1) set('categoryEn', CATS_EN[idx])
  }

  return (
    <div>
      {/* Two columns: Hebrew | English */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Hebrew */}
        <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem', direction: 'rtl' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#EAFF00', textTransform: 'uppercase', marginBottom: '1.25rem' }}>עברית</div>
          <F label="כותרת">
            <input style={input} value={data.titleHe} onChange={e => set('titleHe', e.target.value)} placeholder="כותרת המאמר" />
          </F>
          <F label="תקציר">
            <textarea style={textarea} value={data.excerptHe} onChange={e => set('excerptHe', e.target.value)} placeholder="תקציר קצר..." />
          </F>
          <F label="תוכן המאמר">
            <textarea style={{ ...textarea, minHeight: 280 }} value={data.bodyHe} onChange={e => set('bodyHe', e.target.value)} placeholder="כתוב את המאמר כאן..." />
          </F>
        </div>

        {/* English */}
        <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem', direction: 'ltr' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>English</div>
          <F label="Title">
            <input style={input} value={data.titleEn} onChange={e => set('titleEn', e.target.value)} placeholder="Article title" />
          </F>
          <F label="Excerpt">
            <textarea style={textarea} value={data.excerptEn} onChange={e => set('excerptEn', e.target.value)} placeholder="Short excerpt..." />
          </F>
          <F label="Body">
            <textarea style={{ ...textarea, minHeight: 280 }} value={data.bodyEn} onChange={e => set('bodyEn', e.target.value)} placeholder="Write the article here..." />
          </F>
        </div>
      </div>

      {/* Meta row */}
      <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem', direction: 'rtl' }}>
        <F label="קטגוריה">
          <select style={{ ...input, cursor: 'pointer' }} value={data.categoryHe} onChange={e => handleCategoryHe(e.target.value)}>
            {CATS_HE.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </F>
        <F label="תאריך">
          <input type="date" style={input} value={data.date} onChange={e => set('date', e.target.value)} />
        </F>
        <F label="תמונה (URL)">
          <input style={input} value={data.image} onChange={e => set('image', e.target.value)} placeholder="/images/article.jpg" />
        </F>
        <F label="סטטוס">
          <button
            type="button"
            onClick={() => set('published', !data.published)}
            style={{
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
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <Link href="/admin/articles" style={{
          border: '1.5px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)',
          padding: '11px 24px', borderRadius: 50, textDecoration: 'none',
          fontSize: 13, fontWeight: 600,
        }}>
          ביטול
        </Link>
        <button
          onClick={() => onSave(data)}
          disabled={saving}
          style={{
            background: '#EAFF00', color: '#0A0A0A',
            border: 'none', padding: '11px 28px', borderRadius: 50,
            fontFamily: 'var(--font-heebo), sans-serif', fontSize: 13, fontWeight: 800,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
          }}>
          {saving ? 'שומר...' : 'שמור מאמר'}
        </button>
      </div>
    </div>
  )
}
