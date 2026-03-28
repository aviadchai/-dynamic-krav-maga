"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Article, Instructor } from '@/lib/db'

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [reelsCount, setReelsCount] = useState(0)

  useEffect(() => {
    fetch('/api/articles').then(r => r.json()).then(setArticles)
    fetch('/api/instructors').then(r => r.json()).then(setInstructors)
    fetch('/api/content').then(r => r.json()).then((d: { reels?: unknown[] }) => setReelsCount(d.reels?.length ?? 0))
  }, [])

  const published = articles.filter(a => a.published).length
  const drafts = articles.filter(a => !a.published).length

  const stats = [
    { label: 'מאמרים פורסמו',  value: published,          color: '#EAFF00',               href: '/admin/articles' },
    { label: 'טיוטות',          value: drafts,             color: 'rgba(255,180,0,0.85)',  href: '/admin/articles' },
    { label: 'מאמנים',          value: instructors.length, color: '#9B5DE5',               href: '/admin/instructors' },
    { label: 'רילסים',          value: reelsCount,         color: '#00D4FF',               href: '/admin/reels' },
  ]

  const actions = [
    { label: '+ מאמר חדש',       href: '/admin/articles/new', primary: true },
    { label: 'תוכן האתר',        href: '/admin/content',      primary: false },
    { label: 'רילסים',           href: '/admin/reels',        primary: false },
    { label: 'מיתוג',            href: '/admin/brand',        primary: false },
  ]

  return (
    <div style={{ padding: '2.5rem', direction: 'rtl' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#EAFF00', textTransform: 'uppercase', marginBottom: 6 }}>
          Dynamic Krav Maga
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>סטטיסטיקות</h1>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {stats.map(s => (
          <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)',
              borderRadius: 14, padding: '1.5rem 1.25rem',
              transition: 'border-color .2s', cursor: 'pointer',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
            >
              <div style={{ fontSize: '2.6rem', fontWeight: 900, color: s.color, lineHeight: 1, fontFamily: 'var(--font-barlow), sans-serif' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 8, letterSpacing: 1 }}>
                {s.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1rem' }}>
        פעולות מהירות
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        {actions.map(a => (
          <Link key={a.label} href={a.href} style={{
            background: a.primary ? '#EAFF00' : 'transparent',
            color: a.primary ? '#0A0A0A' : 'rgba(255,255,255,0.6)',
            border: a.primary ? 'none' : '1.5px solid rgba(255,255,255,0.12)',
            padding: '10px 22px', borderRadius: 50,
            fontWeight: a.primary ? 800 : 600, fontSize: 13, textDecoration: 'none',
            transition: 'all .2s',
          }}>
            {a.label}
          </Link>
        ))}
      </div>

      {/* Recent articles */}
      {articles.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1rem' }}>
            מאמרים אחרונים
          </div>
          <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
            {articles.slice(0, 5).map((a, i) => (
              <Link key={a.id} href={`/admin/articles/${a.id}`} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '12px 20px', textDecoration: 'none',
                borderBottom: i < Math.min(articles.length, 5) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                transition: 'background .15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Thumbnail */}
                <div style={{
                  width: 56, height: 38, borderRadius: 6, flexShrink: 0,
                  background: '#1C1C1C', backgroundImage: a.image ? `url(${a.image})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  border: '1px solid rgba(255,255,255,0.06)',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.titleHe}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{a.date}{a.author ? ` · ${a.author}` : ''}</div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                  padding: '3px 10px', borderRadius: 50, whiteSpace: 'nowrap',
                  background: a.published ? 'rgba(234,255,0,0.1)' : 'rgba(255,255,255,0.05)',
                  color: a.published ? '#EAFF00' : 'rgba(255,255,255,0.35)',
                }}>
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
