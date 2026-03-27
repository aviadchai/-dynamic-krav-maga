"use client"
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArticleForm } from '../_form'
import type { Article } from '@/lib/db'

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/articles/${id}`).then(r => r.json()).then(setArticle)
  }, [id])

  async function handleSave(data: object) {
    setSaving(true)
    await fetch(`/api/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    router.push('/admin/articles')
  }

  if (!article) return <div style={{ padding: '2.5rem', color: 'rgba(255,255,255,0.3)' }}>טוען...</div>

  return (
    <div style={{ padding: '2.5rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '2rem' }}>
        עריכת מאמר
      </h1>
      <ArticleForm initialData={article} onSave={handleSave} saving={saving} />
    </div>
  )
}
