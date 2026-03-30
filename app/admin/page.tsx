"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Article, Instructor } from '@/lib/db'

type TickerItem = { textHe: string; textEn: string; link?: string }

const inp: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1.5px solid rgba(255,255,255,0.1)',
  color: '#fff', padding: '9px 12px', borderRadius: 8,
  fontFamily: 'var(--font-heebo), sans-serif', fontSize: 13, outline: 'none',
}

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [reelsCount, setReelsCount] = useState(0)
  const [items, setItems] = useState<TickerItem[]>([])
  const [announceSaving, setAnnounceSaving] = useState(false)

  useEffect(() => {
    fetch('/api/articles').then(r => r.json()).then(setArticles)
    fetch('/api/instructors').then(r => r.json()).then(setInstructors)
    fetch('/api/content').then(r => r.json()).then((d: { reels?: unknown[], announcementItems?: TickerItem[] }) => {
      setReelsCount(d.reels?.length ?? 0)
      setItems(d.announcementItems || [])
    })
  }, [])

  function addItem() { setItems(prev => [...prev, { textHe: '', textEn: '', link: '' }]) }
  function removeItem(i: number) { setItems(prev => prev.filter((_, idx) => idx !== i)) }
  function updateItem(i: number, field: keyof TickerItem, val: string) {
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: val } : it))
  }

  async function saveAnnouncement() {
    setAnnounceSaving(true)
    const cleaned = items.filter(it => it.textHe || it.textEn).map(it => ({ ...it, link: it.link || undefined }))
    await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcementItems: cleaned }),
    })
    setAnnounceSaving(false)
  }

  const published = articles.filter(a => a.published).length
  const drafts = articles.filter(a => !a.published).length

  const stats = [
    { label: 'מאמרים פורסמו', value: published,          color: '#EAFF00',              href: '/admin/articles' },
    { label: 'טיוטות',         value: drafts,             color: 'rgba(255,180,0,0.85)', href: '/admin/articles' },
    { label: 'מאמנים',         value: instructors.length, color: '#9B5DE5',              href: '/admin/instructors' },
    { label: 'רילסים',         value: reelsCount,         color: '#00D4FF',              href: '/admin/reels' },
  ]

  const actions = [
    { label: '+ מאמר חדש', href: '/admin/articles/new', primary: true },
    { label: 'תוכן האתר',   href: '/admin/content',     primary: false },
    { label: 'רילסים',      href: '/admin/reels',       primary: false },
    { label: 'מיתוג',       href: '/admin/brand',       primary: false },
  ]

  return (
    <div style={{ padding: 'clamp(1rem, 4vw, 2.5rem)', direction: 'rtl', maxWidth: 900, margin: '0 auto' }}>
      <style>{`
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2.5rem; }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
          .dash-actions { flex-wrap: wrap; gap: 0.5rem !important; }
        }
      `}</style>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#EAFF00', textTransform: 'uppercase', marginBottom: 6 }}>Dynamic Krav Maga</div>
        <h1 style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: 900, color: '#fff' }}>סטטיסטיקות</h1>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map(s => (
          <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.25rem 1rem', transition: 'border-color .2s', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
            >
              <div style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', fontWeight: 900, color: s.color, lineHeight: 1, fontFamily: 'var(--font-barlow), sans-serif' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 6, letterSpacing: 1 }}>{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1rem' }}>פעולות מהירות</div>
      <div className="dash-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        {actions.map(a => (
          <Link key={a.label} href={a.href} style={{
            background: a.primary ? '#EAFF00' : 'transparent',
            color: a.primary ? '#0A0A0A' : 'rgba(255,255,255,0.6)',
            border: a.primary ? 'none' : '1.5px solid rgba(255,255,255,0.12)',
            padding: '10px 20px', borderRadius: 50,
            fontWeight: a.primary ? 800 : 600, fontSize: 13, textDecoration: 'none',
          }}>
            {a.label}
          </Link>
        ))}
      </div>

      {/* Announcement ticker */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1rem' }}>
          טיקר הודעות — מוצג בראש האתר כשיש הודעות
        </div>
        <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((it, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem', marginBottom: '0.6rem' }}>
                <input style={inp} value={it.textHe} onChange={e => updateItem(i, 'textHe', e.target.value)} placeholder="טקסט — עברית" />
                <input style={{ ...inp, direction: 'ltr' }} value={it.textEn} onChange={e => updateItem(i, 'textEn', e.target.value)} placeholder="Text — English" />
                <input style={{ ...inp, direction: 'ltr', gridColumn: 'span 1' }} value={it.link || ''} onChange={e => updateItem(i, 'link', e.target.value)} placeholder="קישור (אופציונלי) https://..." />
              </div>
              <button onClick={() => removeItem(i)} style={{ background: 'rgba(255,50,50,0.08)', border: 'none', color: 'rgba(255,80,80,0.7)', padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-heebo), sans-serif' }}>
                הסר הודעה
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, textAlign: 'center', padding: '0.5rem 0' }}>אין הודעות — הטיקר לא יוצג</div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <button onClick={addItem} style={{ border: '1.5px solid rgba(234,255,0,0.25)', color: '#EAFF00', background: 'rgba(234,255,0,0.05)', padding: '8px 16px', borderRadius: 50, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontSize: 12, fontWeight: 700 }}>
              + הוסף הודעה
            </button>
            <button onClick={saveAnnouncement} disabled={announceSaving} style={{ background: '#EAFF00', color: '#0A0A0A', border: 'none', padding: '8px 20px', borderRadius: 50, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 800, fontSize: 12, opacity: announceSaving ? 0.7 : 1 }}>
              {announceSaving ? 'שומר...' : 'שמור'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent articles */}
      {articles.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1rem' }}>מאמרים אחרונים</div>
          <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
            {articles.slice(0, 5).map((a, i) => (
              <Link key={a.id} href={`/admin/articles/${a.id}`} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '10px 16px', textDecoration: 'none',
                borderBottom: i < Math.min(articles.length, 5) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                transition: 'background .15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 48, height: 34, borderRadius: 6, flexShrink: 0, background: '#1C1C1C', backgroundImage: a.image ? `url(${a.image})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid rgba(255,255,255,0.06)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.titleHe}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{a.date}{a.author ? ` · ${a.author}` : ''}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 50, whiteSpace: 'nowrap', background: a.published ? 'rgba(234,255,0,0.1)' : 'rgba(255,255,255,0.05)', color: a.published ? '#EAFF00' : 'rgba(255,255,255,0.35)', flexShrink: 0 }}>
                  {a.published ? 'פורסם' : 'טיוטה'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
