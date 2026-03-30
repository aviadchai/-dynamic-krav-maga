"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Article } from '@/lib/db'

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const data = await fetch('/api/articles').then(r => r.json())
    setArticles(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function togglePublish(article: Article) {
    await fetch(`/api/articles/${article.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !article.published }),
    })
    load()
  }

  async function deleteArticle(id: string) {
    if (!confirm('למחוק את המאמר?')) return
    await fetch(`/api/articles/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div style={{ padding: 'clamp(1rem, 4vw, 2.5rem)', maxWidth: 900, margin: '0 auto', direction: 'rtl' }}>
      <style>{`
        .art-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem; }
        .art-row { display: flex; align-items: center; gap: 0.75rem; padding: 10px 16px; border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: rgba(255,255,255,0.05); }
        .art-row:last-child { border-bottom: none; }
        .art-row-info { flex: 1; min-width: 0; }
        .art-row-actions { display: flex; gap: 6px; flex-shrink: 0; align-items: center; }
        .art-row-badge { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 3px 10px; border-radius: 50px; white-space: nowrap; flex-shrink: 0; }
        .art-row-thumb { width: 60px; height: 42px; border-radius: 7px; flex-shrink: 0; background-size: cover; background-position: center; border: 1px solid rgba(255,255,255,0.06); }
        @media (max-width: 540px) {
          .art-row { flex-wrap: wrap; gap: 0.5rem; padding: 10px 12px; }
          .art-row-thumb { width: 44px; height: 32px; }
          .art-row-info { order: 1; width: calc(100% - 56px); }
          .art-row-badge { display: none; }
          .art-row-publish { display: none !important; }
          .art-row-actions { order: 2; width: 100%; justify-content: flex-end; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.04); }
        }
      `}</style>

      <div className="art-header">
        <div>
          <h1 style={{ fontSize: 'clamp(1.3rem, 5vw, 1.8rem)', fontWeight: 900, color: '#fff', marginBottom: 4 }}>מאמרים</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{articles.length} מאמרים</p>
        </div>
        <Link href="/admin/articles/new" style={{
          background: '#EAFF00', color: '#0A0A0A',
          padding: '10px 22px', borderRadius: 50,
          fontWeight: 800, fontSize: 13, textDecoration: 'none', flexShrink: 0,
        }}>+ מאמר חדש</Link>
      </div>

      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.3)' }}>טוען...</p>
      ) : articles.length === 0 ? (
        <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', marginBottom: '1rem' }}>אין מאמרים עדיין</p>
          <Link href="/admin/articles/new" style={{ color: '#EAFF00', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>כתוב את המאמר הראשון →</Link>
        </div>
      ) : (
        <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
          {articles.map((a) => (
            <div key={a.id} className="art-row">
              <div className="art-row-thumb" style={{ backgroundImage: a.image ? `url(${a.image})` : 'none', background: a.image ? undefined : '#1C1C1C' }} />

              <div className="art-row-info">
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.titleHe}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {[a.categoryHe, a.date, a.author].filter(Boolean).join(' · ')}
                </div>
              </div>

              <span className="art-row-badge" style={{
                background: a.published ? 'rgba(234,255,0,0.1)' : 'rgba(255,255,255,0.05)',
                color: a.published ? '#EAFF00' : 'rgba(255,255,255,0.35)',
              }}>
                {a.published ? 'פורסם' : 'טיוטה'}
              </span>

              <div className="art-row-actions">
                <button className="art-row-publish" onClick={() => togglePublish(a)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.5)', padding: '5px 11px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-heebo), sans-serif' }}>
                  {a.published ? 'בטל פרסום' : 'פרסם'}
                </button>
                <Link href={`/admin/articles/${a.id}`} style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', padding: '5px 11px', borderRadius: 7, fontSize: 12, fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-heebo), sans-serif' }}>
                  עריכה
                </Link>
                <button onClick={() => deleteArticle(a.id)}
                  style={{ background: 'rgba(255,50,50,0.08)', border: 'none', color: 'rgba(255,80,80,0.7)', padding: '5px 9px', borderRadius: 7, cursor: 'pointer', fontSize: 13 }}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
