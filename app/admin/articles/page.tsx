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
    <div style={{ padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>מאמרים</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{articles.length} מאמרים</p>
        </div>
        <Link href="/admin/articles/new" style={{
          background: '#EAFF00', color: '#0A0A0A',
          padding: '11px 24px', borderRadius: 50,
          fontWeight: 800, fontSize: 13, textDecoration: 'none',
        }}>
          + מאמר חדש
        </Link>
      </div>

      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.3)' }}>טוען...</p>
      ) : articles.length === 0 ? (
        <div style={{
          background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)',
          borderRadius: 14, padding: '3rem', textAlign: 'center',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', marginBottom: '1rem' }}>אין מאמרים עדיין</p>
          <Link href="/admin/articles/new" style={{
            color: '#EAFF00', textDecoration: 'none', fontWeight: 700, fontSize: 13,
          }}>כתוב את המאמר הראשון →</Link>
        </div>
      ) : (
        <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
          {articles.map((a, i) => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '12px 20px',
              borderBottom: i < articles.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              {/* Thumbnail */}
              <div style={{
                width: 64, height: 44, borderRadius: 8, flexShrink: 0,
                background: '#1C1C1C', backgroundImage: a.image ? `url(${a.image})` : 'none',
                backgroundSize: 'cover', backgroundPosition: 'center',
                border: '1px solid rgba(255,255,255,0.06)',
              }} />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.titleHe}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                  {a.categoryHe} · {a.date}{a.author ? ` · ${a.author}` : ''}
                </div>
              </div>

              {/* Status badge */}
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                padding: '3px 10px', borderRadius: 50, whiteSpace: 'nowrap',
                background: a.published ? 'rgba(234,255,0,0.1)' : 'rgba(255,255,255,0.05)',
                color: a.published ? '#EAFF00' : 'rgba(255,255,255,0.35)',
              }}>
                {a.published ? 'פורסם' : 'טיוטה'}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => togglePublish(a)}
                  title={a.published ? 'הסר פרסום' : 'פרסם'}
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: 'none',
                    color: 'rgba(255,255,255,0.5)', padding: '6px 12px',
                    borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  }}>
                  {a.published ? 'בטל פרסום' : 'פרסם'}
                </button>
                <Link href={`/admin/articles/${a.id}`} style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.5)', padding: '6px 12px',
                  borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none',
                }}>
                  עריכה
                </Link>
                <button
                  onClick={() => deleteArticle(a.id)}
                  style={{
                    background: 'rgba(255,50,50,0.08)', border: 'none',
                    color: 'rgba(255,80,80,0.7)', padding: '6px 10px',
                    borderRadius: 8, cursor: 'pointer', fontSize: 12,
                  }}>
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
