"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArticleForm } from '../_form'

export default function NewArticlePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  async function handleSave(data: object) {
    setSaving(true)
    await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    router.push('/admin/articles')
  }

  return (
    <div style={{ padding: '2.5rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '2rem' }}>
        מאמר חדש
      </h1>
      <ArticleForm onSave={handleSave} saving={saving} />
    </div>
  )
}
