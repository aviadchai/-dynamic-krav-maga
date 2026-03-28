"use client"
import { useEffect, useState, useRef } from 'react'
import type { SiteContent } from '@/lib/db'

const inp: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1.5px solid rgba(255,255,255,0.1)',
  color: '#fff', padding: '11px 14px', borderRadius: 10,
  fontFamily: 'var(--font-heebo), sans-serif', fontSize: 14, outline: 'none',
}

const F = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ marginBottom: '1.25rem' }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
      {label}
    </label>
    {children}
  </div>
)

export default function BrandPage() {
  const [content, setContent] = useState<SiteContent | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingLight, setUploadingLight] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const fileLightRef = useRef<HTMLInputElement>(null)
  const savedRef = useRef<SiteContent | null>(null)

  const isDirty = isEditing && content && savedRef.current &&
    JSON.stringify(content) !== JSON.stringify(savedRef.current)

  useEffect(() => {
    fetch('/api/content').then(r => r.json()).then((d: SiteContent) => {
      setContent(d)
      savedRef.current = d
    })
  }, [])

  useEffect(() => {
    window.__adminDirty = !!isDirty
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => { window.removeEventListener('beforeunload', handler) }
  }, [isDirty])

  function set(key: keyof SiteContent, value: string) {
    setContent(c => c ? { ...c, [key]: value } : c)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    set('brandLogoUrl', url)
    setUploading(false)
  }

  async function handleLogoLightUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLight(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    set('brandLogoLight', url)
    setUploadingLight(false)
  }

  function cancelEdit() {
    if (isDirty && !confirm('לבטל את השינויים?')) return
    setContent(savedRef.current)
    setIsEditing(false)
  }

  async function save() {
    if (!content) return
    setSaving(true)
    await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brandColor: content.brandColor,
        brandColorSecondary: content.brandColorSecondary,
        brandColorText: content.brandColorText,
        brandBg: content.brandBg,
        brandLogoUrl: content.brandLogoUrl,
        brandLogoLight: content.brandLogoLight,
        badgePillHe: content.badgePillHe,
        badgePillEn: content.badgePillEn,
      }),
    })
    savedRef.current = content
    setIsEditing(false)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!content) return <div style={{ padding: '2.5rem', color: 'rgba(255,255,255,0.3)' }}>טוען...</div>

  const logoDark = content.brandLogoUrl || '/images/logo.png'
  const logoLightSrc = content.brandLogoLight || logoDark

  return (
    <div style={{ padding: '2.5rem', direction: 'rtl' }}>

      {/* Floating action button */}
      <div style={{ position: 'fixed', bottom: '2rem', left: '2rem', zIndex: 1000, display: 'flex', gap: 8, flexDirection: 'column', alignItems: 'flex-end' }}>
        {isEditing && isDirty && (
          <button onClick={cancelEdit} style={{ background: 'rgba(30,30,30,0.95)', border: '1.5px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', padding: '10px 18px', borderRadius: 50, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-heebo), sans-serif', backdropFilter: 'blur(8px)', whiteSpace: 'nowrap' }}>ביטול</button>
        )}
        <button
          onClick={isEditing ? save : () => setIsEditing(true)}
          disabled={saving}
          style={{ background: isEditing ? (saved ? 'rgba(234,255,0,0.85)' : '#EAFF00') : 'rgba(234,255,0,0.12)', color: isEditing ? '#0A0A0A' : '#EAFF00', border: isEditing ? 'none' : '1.5px solid rgba(234,255,0,0.35)', padding: '12px 24px', borderRadius: 50, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 800, fontSize: 14, backdropFilter: 'blur(8px)', whiteSpace: 'nowrap', boxShadow: isEditing ? '0 4px 20px rgba(234,255,0,0.3)' : '0 4px 16px rgba(0,0,0,0.4)' }}
        >
          {saving ? 'שומר...' : saved ? '✓ נשמר' : isEditing ? 'שמור שינויים' : '✏ עריכה'}
        </button>
      </div>

      {/* Warning banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(234,255,0,0.07)', border: '1.5px solid rgba(234,255,0,0.25)',
        borderRadius: 12, padding: '12px 18px', marginBottom: '1.75rem',
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#EAFF00', marginBottom: 2 }}>שים לב — הנך עורך את עיצוב האתר</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>שינויים כאן ישפיעו על המראה הכללי של האתר. שמור רק לאחר בדיקה.</div>
        </div>
      </div>

      {isDirty && (
        <div style={{ position: 'fixed', top: 0, left: 240, right: 0, zIndex: 500, background: 'rgba(234,255,0,0.1)', borderBottom: '1.5px solid rgba(234,255,0,0.3)', padding: '10px 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(8px)' }}>
          <span style={{ fontSize: 13, color: '#EAFF00', fontWeight: 700 }}>⚠ יש שינויים שלא נשמרו</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={cancelEdit} style={{ background: 'none', border: '1.5px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-heebo), sans-serif' }}>בטל שינויים</button>
            <button onClick={save} disabled={saving} style={{ background: '#EAFF00', color: '#0A0A0A', border: 'none', padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-heebo), sans-serif' }}>{saving ? 'שומר...' : 'שמור עכשיו'}</button>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>מיתוג</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {isEditing ? (
            <>
              <button onClick={cancelEdit} style={{ background: 'none', border: '1.5px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', padding: '9px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-heebo), sans-serif' }}>ביטול</button>
              <button onClick={save} disabled={saving} style={{ background: saved ? 'rgba(234,255,0,0.8)' : '#EAFF00', color: '#0A0A0A', border: 'none', padding: '9px 24px', borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 800, fontSize: 13, opacity: saving ? 0.7 : 1 }}>
                {saving ? 'שומר...' : saved ? '✓ נשמר' : 'שמור שינויים'}
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} style={{ background: 'rgba(234,255,0,0.1)', border: '1.5px solid rgba(234,255,0,0.3)', color: '#EAFF00', padding: '9px 24px', borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 700, fontSize: 13 }}>✏ עריכה</button>
          )}
        </div>
      </div>
      {!isEditing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 16px', marginBottom: '1.5rem', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          <span style={{ fontSize: 16 }}>🔒</span>
          <span>מצב תצוגה — לחץ <strong style={{ color: 'rgba(234,255,0,0.8)' }}>עריכה</strong> לעריכת השדות</span>
        </div>
      )}

      {/* Logos */}
      <div style={{ pointerEvents: isEditing ? 'auto' : 'none', opacity: isEditing ? 1 : 0.65, transition: 'opacity .2s' }}>
      <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#EAFF00', textTransform: 'uppercase', marginBottom: '1.25rem' }}>לוגו</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Dark bg logo */}
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 10, letterSpacing: 1 }}>גרסה לרקע כהה</div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ width: 100, height: 52, borderRadius: 8, background: '#0A0A0A', border: '1.5px solid rgba(255,255,255,0.08)', backgroundImage: `url(${logoDark})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ background: 'rgba(234,255,0,0.08)', border: '1.5px solid rgba(234,255,0,0.2)', color: '#EAFF00', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                  {uploading ? 'מעלה...' : '⬆ העלה'}
                </button>
                <input style={{ ...inp, fontSize: 11, padding: '6px 10px' }} value={content.brandLogoUrl || ''} onChange={e => set('brandLogoUrl', e.target.value)} placeholder="URL..." dir="ltr" />
              </div>
            </div>
          </div>
          {/* Light bg logo */}
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 10, letterSpacing: 1 }}>גרסה לרקע בהיר</div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ width: 100, height: 52, borderRadius: 8, background: '#EEECEA', border: '1.5px solid rgba(0,0,0,0.08)', backgroundImage: `url(${logoLightSrc})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <input ref={fileLightRef} type="file" accept="image/*" onChange={handleLogoLightUpload} style={{ display: 'none' }} />
                <button type="button" onClick={() => fileLightRef.current?.click()} disabled={uploadingLight} style={{ background: 'rgba(234,255,0,0.08)', border: '1.5px solid rgba(234,255,0,0.2)', color: '#EAFF00', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                  {uploadingLight ? 'מעלה...' : '⬆ העלה'}
                </button>
                <input style={{ ...inp, fontSize: 11, padding: '6px 10px' }} value={content.brandLogoLight || ''} onChange={e => set('brandLogoLight', e.target.value)} placeholder="URL..." dir="ltr" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Colors */}
      <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#EAFF00', textTransform: 'uppercase', marginBottom: '1.25rem' }}>צבעי מותג</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
          {([
            { key: 'brandColor', label: 'צבע ראשי', def: '#EAFF00' },
            { key: 'brandColorSecondary', label: 'צבע משני', def: '#EAFF00' },
            { key: 'brandColorText', label: 'צבע טקסט', def: '#FFFFFF' },
            { key: 'brandBg', label: 'רקע', def: '#0A0A0A' },
          ] as { key: keyof typeof content, label: string, def: string }[]).map(({ key, label, def }) => (
            <F key={key} label={label}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={(content[key] as string) || def} onChange={e => set(key, e.target.value)}
                  style={{ width: 44, height: 44, borderRadius: 8, border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }} />
                <input style={{ ...inp, flex: 1, fontSize: 12 }} value={(content[key] as string) || def} onChange={e => set(key, e.target.value)} dir="ltr" />
              </div>
            </F>
          ))}
        </div>
        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: 10, background: content.brandBg || '#0A0A0A', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: content.brandColor || '#EAFF00', fontWeight: 900, fontSize: 14 }}>צבע ראשי</span>
          <span style={{ color: content.brandColorSecondary || content.brandColor || '#EAFF00', fontWeight: 700, fontSize: 14 }}>צבע משני</span>
          <span style={{ color: content.brandColorText || '#fff', fontSize: 13 }}>טקסט</span>
        </div>
      </div>
      </div>{/* end lock wrapper */}

    </div>
  )
}
