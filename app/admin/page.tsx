"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Article, Instructor } from '@/lib/db'

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])

  useEffect(() => {
    fetch('/api/articles').then(r => r.json()).then(setArticles)
    fetch('/api/instructors').then(r => r.json()).then(setInstructors)
  }, [])

  const published = articles.filter(a => a.published).length
  const drafts = articles.filter(a => !a.published).length

  const stats = [
    { label: 'מאמרים פורסמו', value: published, color: '#EAFF00', href: '/admin/articles' },
    { label: 'טיוטות', value: drafts, color: 'rgba(255,255,255,0.4)', href: '/admin/articles' },
    { label: 'מאמנים', value: instructors.length, color: '#9B5DE5', href: '/admin/instructors' },
    { label: 'סה״כ מאמרים', value: articles.length, color: 'rgba(255,255,255,0.4)', href: '/admin/articles' },
  ]

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>
          שלום 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>ברוך הבא לפאנל הניהול של Dynamic Krav Maga</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {stats.map(s => (
          <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)',
              borderRadius: 14, padding: '1.5rem',
              transition: 'border-color .2s',
            }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 6, letterSpacing: 1 }}>
                {s.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h2 style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1rem' }}>
        פעולות מהירות
      </h2>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link href="/admin/articles/new" style={{
          background: '#EAFF00', color: '#0A0A0A',
          padding: '12px 24px', borderRadius: 50,
          fontWeight: 800, fontSize: 13, textDecoration: 'none',
          letterSpacing: 1,
        }}>
          + מאמר חדש
        </Link>
        <Link href="/admin/instructors" style={{
          border: '1.5px solid rgba(255,255,255,0.15)', color: '#fff',
          padding: '12px 24px', borderRadius: 50,
          fontWeight: 600, fontSize: 13, textDecoration: 'none',
        }}>
          + מאמן חדש
        </Link>
        <Link href="/admin/content" style={{
          border: '1.5px solid rgba(255,255,255,0.15)', color: '#fff',
          padding: '12px 24px', borderRadius: 50,
          fontWeight: 600, fontSize: 13, textDecoration: 'none',
        }}>
          עריכת תוכן האתר
        </Link>
      </div>

      {/* Recent articles */}
      {articles.length > 0 && (
        <div style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1rem' }}>
            מאמרים אחרונים
          </h2>
          <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
            {articles.slice(0, 5).map((a, i) => (
              <Link key={a.id} href={`/admin/articles/${a.id}`} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px', textDecoration: 'none',
                borderBottom: i < Math.min(articles.length, 5) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{a.titleHe}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{a.date}</div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                  padding: '3px 10px', borderRadius: 50,
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
