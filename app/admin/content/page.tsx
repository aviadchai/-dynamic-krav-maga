"use client"
import { useEffect, useRef, useState } from 'react'
import type { SiteContent, Testimonial } from '@/lib/db'

const F = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ marginBottom: '1.25rem' }}>
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
  fontFamily: 'var(--font-heebo), sans-serif', fontSize: 14, outline: 'none',
}

function Section({ title, open, onToggle, children, locked, action }: {
  title: string, open: boolean, onToggle: () => void, children: React.ReactNode, locked: boolean, action?: React.ReactNode
}) {
  return (
    <div style={{ background: '#141414', border: `1.5px solid ${open ? 'rgba(234,255,0,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, marginBottom: '1rem', overflow: 'hidden', transition: 'border-color .2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem' }}>
        <button
          onClick={onToggle}
          style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif' }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: open ? '#EAFF00' : 'rgba(255,255,255,0.55)', textTransform: 'uppercase', transition: 'color .2s' }}>{title}</span>
          <span style={{ color: open ? '#EAFF00' : 'rgba(255,255,255,0.3)', fontSize: 18, transition: 'transform .25s, color .2s', display: 'block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', marginLeft: 12 }}>⌃</span>
        </button>
        {open && action && <div style={{ marginRight: 16 }}>{action}</div>}
      </div>
      {open && (
        <div style={{
          padding: '0 1.5rem 1.5rem',
          pointerEvents: locked ? 'none' : 'auto',
          opacity: locked ? 0.62 : 1,
          transition: 'opacity .2s',
        }}>
          {children}
        </div>
      )}
    </div>
  )
}

const twoCol: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }

function UploadInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    onChange(url); setUploading(false)
  }
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {value && <div style={{ width: 54, height: 36, borderRadius: 6, background: '#1C1C1C', backgroundImage: `url(${value})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.08)' }} />}
      <input ref={ref} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
      <button type="button" onClick={() => ref.current?.click()} disabled={uploading} style={{ background: 'rgba(234,255,0,0.08)', border: '1.5px solid rgba(234,255,0,0.2)', color: '#EAFF00', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontSize: 12, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>
        {uploading ? 'מעלה...' : '⬆ העלה'}
      </button>
      <input style={{ ...inp, flex: 1, fontSize: 12 }} value={value} onChange={e => onChange(e.target.value)} placeholder="URL..." dir="ltr" />
    </div>
  )
}

const HISTORY_KEY = 'site_content_history'
type HistoryEntry = { data: Partial<SiteContent>, at: string }
function pushHistory(data: Partial<SiteContent>) {
  try {
    const h: HistoryEntry[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    h.unshift({ data, at: new Date().toISOString() })
    h.splice(20)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h))
  } catch {}
}
function getHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}

export default function ContentPage() {
  const [content, setContent] = useState<SiteContent | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [open, setOpen] = useState<Set<string>>(new Set(['hero']))
  const [isEditing, setIsEditing] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const savedRef = useRef<SiteContent | null>(null)
  const [translating, setTranslating] = useState('')

  async function tr(id: string, fields: Record<string, string>): Promise<Record<string, string>> {
    setTranslating(id)
    try {
      const res = await fetch('/api/translate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      })
      const { translations } = await res.json()
      return translations || {}
    } finally { setTranslating('') }
  }

  const isDirty = isEditing && content && savedRef.current &&
    JSON.stringify(content) !== JSON.stringify(savedRef.current)

  function toggle(id: string) {
    setOpen(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  useEffect(() => {
    fetch('/api/content').then(r => r.json()).then((d: SiteContent) => {
      setContent(d)
      savedRef.current = d
    })
  }, [])

  // Warn before tab close/refresh when dirty + set global flag
  useEffect(() => {
    window.__adminDirty = !!isDirty
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => { window.removeEventListener('beforeunload', handler) }
  }, [isDirty])

  function set<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent(c => c ? { ...c, [key]: value } : c)
  }

  function setTestimonial(i: number, key: keyof Testimonial, value: string) {
    setContent(c => {
      if (!c) return c
      const arr = [...c.testimonials]
      arr[i] = { ...arr[i], [key]: value }
      return { ...c, testimonials: arr }
    })
  }

  function addTestimonial() {
    setContent(c => c ? { ...c, testimonials: [...c.testimonials, { name: '', nameEn: '', roleHe: '', roleEn: '', textHe: '', textEn: '' }] } : c)
  }

  function removeTestimonial(i: number) {
    setContent(c => c ? { ...c, testimonials: c.testimonials.filter((_, idx) => idx !== i) } : c)
  }

  function startEdit() {
    setIsEditing(true)
  }

  function cancelEdit() {
    if (isDirty && !confirm('לבטל את השינויים?')) return
    setContent(savedRef.current)
    setIsEditing(false)
  }

  async function save() {
    if (!content) return
    setSaving(true)
    // Save snapshot to history before overwriting
    pushHistory(content)
    const { reels: _r, brandColor: _bc, brandColorSecondary: _bcs, brandColorText: _bct,
      brandBg: _bb, brandLogoUrl: _blu, brandLogoLight: _bll,
      badgePillHe: _bph, badgePillEn: _bpe, ...contentFields } = content
    await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(contentFields) })
    savedRef.current = content
    setIsEditing(false)
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500)
  }

  function openHistory() {
    setHistory(getHistory())
    setShowHistory(true)
  }

  function restoreVersion(entry: HistoryEntry) {
    if (!confirm('לשחזר גרסה זו? השינויים הנוכחיים יימחקו.')) return
    setContent(c => c ? { ...c, ...entry.data } : c)
    setIsEditing(true)
    setShowHistory(false)
  }

  if (!content) return <div style={{ padding: '2.5rem', color: 'rgba(255,255,255,0.3)' }}>טוען...</div>

  const locked = !isEditing

  const trBtnStyle = (small?: boolean, loading?: boolean): React.CSSProperties => ({
    background: 'rgba(234,255,0,0.08)', border: '1.5px solid rgba(234,255,0,0.25)', color: '#EAFF00',
    padding: small ? '5px 12px' : '7px 16px', borderRadius: 50,
    cursor: loading ? 'wait' : 'pointer',
    fontFamily: 'var(--font-heebo), sans-serif', fontSize: small ? 11 : 12, fontWeight: 700,
    marginBottom: small ? 0 : '1.25rem', flexShrink: 0,
  })

  return (
    <div style={{ padding: '2.5rem', direction: 'rtl', maxWidth: 1000 }}>

      {/* Floating action button — always accessible */}
      <div style={{ position: 'fixed', bottom: '2rem', left: '2rem', zIndex: 1000, display: 'flex', gap: 8, flexDirection: 'column', alignItems: 'flex-end' }}>
        {isEditing && isDirty && (
          <button onClick={cancelEdit} style={{ background: 'rgba(30,30,30,0.95)', border: '1.5px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', padding: '10px 18px', borderRadius: 50, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-heebo), sans-serif', backdropFilter: 'blur(8px)', whiteSpace: 'nowrap' }}>ביטול</button>
        )}
        <button
          onClick={isEditing ? save : startEdit}
          disabled={saving}
          style={{ background: isEditing ? (saved ? 'rgba(234,255,0,0.85)' : '#EAFF00') : 'rgba(234,255,0,0.12)', color: isEditing ? '#0A0A0A' : '#EAFF00', border: isEditing ? 'none' : '1.5px solid rgba(234,255,0,0.35)', padding: '12px 24px', borderRadius: 50, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 800, fontSize: 14, backdropFilter: 'blur(8px)', whiteSpace: 'nowrap', boxShadow: isEditing ? '0 4px 20px rgba(234,255,0,0.3)' : '0 4px 16px rgba(0,0,0,0.4)' }}
        >
          {saving ? 'שומר...' : saved ? '✓ נשמר' : isEditing ? 'שמור שינויים' : '✏ עריכה'}
        </button>
      </div>

      {/* Unsaved changes bar */}
      {isDirty && (
        <div style={{
          position: 'fixed', top: 0, left: 240, right: 0, zIndex: 500,
          background: 'rgba(234,255,0,0.1)', borderBottom: '1.5px solid rgba(234,255,0,0.3)',
          padding: '10px 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backdropFilter: 'blur(8px)',
        }}>
          <span style={{ fontSize: 13, color: '#EAFF00', fontWeight: 700 }}>⚠ יש שינויים שלא נשמרו</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={cancelEdit} style={{ background: 'none', border: '1.5px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-heebo), sans-serif' }}>בטל שינויים</button>
            <button onClick={save} disabled={saving} style={{ background: '#EAFF00', color: '#0A0A0A', border: 'none', padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-heebo), sans-serif' }}>{saving ? 'שומר...' : 'שמור עכשיו'}</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>תוכן האתר</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* History button */}
          <button onClick={openHistory} style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', padding: '9px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-heebo), sans-serif' }}>
            🕐 גרסאות
          </button>
          {isEditing ? (
            <>
              <button onClick={cancelEdit} style={{ background: 'none', border: '1.5px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', padding: '9px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-heebo), sans-serif' }}>ביטול</button>
              <button onClick={save} disabled={saving} style={{ background: saved ? 'rgba(234,255,0,0.8)' : '#EAFF00', color: '#0A0A0A', border: 'none', padding: '9px 24px', borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 800, fontSize: 13, opacity: saving ? 0.7 : 1, transition: 'all .2s' }}>
                {saving ? 'שומר...' : saved ? '✓ נשמר' : 'שמור שינויים'}
              </button>
            </>
          ) : (
            <button onClick={startEdit} style={{ background: 'rgba(234,255,0,0.1)', border: '1.5px solid rgba(234,255,0,0.3)', color: '#EAFF00', padding: '9px 24px', borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 700, fontSize: 13 }}>
              ✏ עריכה
            </button>
          )}
        </div>
      </div>

      {/* Lock notice */}
      {locked && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 16px', marginBottom: '1.5rem', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          <span style={{ fontSize: 16 }}>🔒</span>
          <span>מצב תצוגה — לחץ <strong style={{ color: 'rgba(234,255,0,0.8)' }}>עריכה</strong> לעריכת השדות</span>
        </div>
      )}

      {/* ── HERO ── */}
      <Section title="Hero — סקשן ראשי" open={open.has('hero')} onToggle={() => toggle('hero')} locked={locked} action={
        <button type="button" disabled={translating === 'hero'} style={trBtnStyle(true, translating === 'hero')} onClick={async () => {
          if (!isEditing) startEdit()
          const t = await tr('hero', { badgePillHe: content.badgePillHe||'', heroTitleHe: content.heroTitleHe, heroSubHe: content.heroSubHe||'', heroBtnPrimaryHe: content.heroBtnPrimaryHe, heroBtnSecondaryHe: content.heroBtnSecondaryHe, heroNum1LblHe: content.heroNum1LblHe, heroNum2LblHe: content.heroNum2LblHe, heroNum3LblHe: content.heroNum3LblHe })
          if (t.badgePillHe) set('badgePillEn', t.badgePillHe)
          if (t.heroTitleHe) set('heroTitleEn', t.heroTitleHe)
          if (t.heroSubHe) set('heroSubEn', t.heroSubHe)
          if (t.heroBtnPrimaryHe) set('heroBtnPrimaryEn', t.heroBtnPrimaryHe)
          if (t.heroBtnSecondaryHe) set('heroBtnSecondaryEn', t.heroBtnSecondaryHe)
          if (t.heroNum1LblHe) set('heroNum1LblEn', t.heroNum1LblHe)
          if (t.heroNum2LblHe) set('heroNum2LblEn', t.heroNum2LblHe)
          if (t.heroNum3LblHe) set('heroNum3LblEn', t.heroNum3LblHe)
        }}>{translating === 'hero' ? '⏳' : '✨ תרגם'}</button>
      }>
        <div style={twoCol}>
          <F label='תג Hero — עברית'>
            <input style={inp} value={content.badgePillHe || ''} onChange={e => set('badgePillHe', e.target.value)} placeholder="מדריך מוסמך קרב מגע" />
          </F>
          <F label='Hero Badge — English'>
            <input style={{ ...inp, direction: 'ltr' }} value={content.badgePillEn || ''} onChange={e => set('badgePillEn', e.target.value)} placeholder="Certified Krav Maga Instructor" />
          </F>
        </div>
        <div style={twoCol}>
          <F label="כותרת ראשית — עברית">
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 90, lineHeight: 1.7 }}
              value={content.heroTitleHe} onChange={e => set('heroTitleHe', e.target.value)}
              placeholder={'הגן על\nעצמך\nבאמת'} />
          </F>
          <F label="Main Title — English">
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 90, lineHeight: 1.7, direction: 'ltr' }}
              value={content.heroTitleEn} onChange={e => set('heroTitleEn', e.target.value)}
              placeholder={'DEFEND\nYOUR\nSELF'} />
          </F>
        </div>
        <div style={twoCol}>
          <F label="תת כותרת — עברית">
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 70, lineHeight: 1.7 }} value={content.heroSubHe} onChange={e => set('heroSubHe', e.target.value)} />
          </F>
          <F label="Subtitle — English">
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 70, lineHeight: 1.7, direction: 'ltr' }} value={content.heroSubEn} onChange={e => set('heroSubEn', e.target.value)} />
          </F>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
          <F label="כפתור ראשי — עברית"><input style={inp} value={content.heroBtnPrimaryHe} onChange={e => set('heroBtnPrimaryHe', e.target.value)} /></F>
          <F label="Primary Btn — English"><input style={{ ...inp, direction: 'ltr' }} value={content.heroBtnPrimaryEn} onChange={e => set('heroBtnPrimaryEn', e.target.value)} /></F>
          <F label="כפתור משני — עברית"><input style={inp} value={content.heroBtnSecondaryHe} onChange={e => set('heroBtnSecondaryHe', e.target.value)} /></F>
          <F label="Secondary Btn — English"><input style={{ ...inp, direction: 'ltr' }} value={content.heroBtnSecondaryEn} onChange={e => set('heroBtnSecondaryEn', e.target.value)} /></F>
        </div>
        <F label="תמונת הירו">
          <UploadInput value={content.heroImage} onChange={v => set('heroImage', v)} />
        </F>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', marginTop: '.25rem' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, marginBottom: '1rem' }}>STATS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { val: content.heroNum1Val, lblHe: content.heroNum1LblHe, lblEn: content.heroNum1LblEn, kVal: 'heroNum1Val' as keyof SiteContent, kHe: 'heroNum1LblHe' as keyof SiteContent, kEn: 'heroNum1LblEn' as keyof SiteContent },
              { val: content.heroNum2Val, lblHe: content.heroNum2LblHe, lblEn: content.heroNum2LblEn, kVal: 'heroNum2Val' as keyof SiteContent, kHe: 'heroNum2LblHe' as keyof SiteContent, kEn: 'heroNum2LblEn' as keyof SiteContent },
              { val: content.heroNum3Val, lblHe: content.heroNum3LblHe, lblEn: content.heroNum3LblEn, kVal: 'heroNum3Val' as keyof SiteContent, kHe: 'heroNum3LblHe' as keyof SiteContent, kEn: 'heroNum3LblEn' as keyof SiteContent },
            ].map((n, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                <F label="ערך"><input style={{ ...inp, fontSize: 18, fontWeight: 900, textAlign: 'center' }} value={n.val} onChange={e => set(n.kVal, e.target.value)} /></F>
                <F label="תווית עברית"><input style={inp} value={n.lblHe} onChange={e => set(n.kHe, e.target.value)} /></F>
                <F label="Label English"><input style={{ ...inp, direction: 'ltr' }} value={n.lblEn} onChange={e => set(n.kEn, e.target.value)} /></F>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── ABOUT ── */}
      <Section title="עלינו — About" open={open.has('about')} onToggle={() => toggle('about')} locked={locked} action={
        <button type="button" disabled={translating === 'about'} style={trBtnStyle(true, translating === 'about')} onClick={async () => {
          if (!isEditing) startEdit()
          const paraFields: Record<string, string> = {}
          content.aboutParaHe.forEach((p, i) => { paraFields[`para${i}`] = p })
          const t = await tr('about', { aboutTitleHe: content.aboutTitleHe, aboutTagHe: content.aboutTagHe, aboutExcerptHe: content.aboutExcerptHe||'', ...paraFields })
          if (t.aboutTitleHe) set('aboutTitleEn', t.aboutTitleHe)
          if (t.aboutTagHe) set('aboutTagEn', t.aboutTagHe)
          if (t.aboutExcerptHe) set('aboutExcerptEn', t.aboutExcerptHe)
          const newParaEn = content.aboutParaHe.map((_, i) => t[`para${i}`] || content.aboutParaEn[i] || '')
          if (newParaEn.some(Boolean)) set('aboutParaEn', newParaEn)
        }}>{translating === 'about' ? '⏳' : '✨ תרגם'}</button>
      }>
        <div style={twoCol}>
          <F label="כותרת — עברית">
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 80, lineHeight: 1.7 }} value={content.aboutTitleHe} onChange={e => set('aboutTitleHe', e.target.value)} placeholder={'לחימה\nשמגיעה\nמהשטח'} />
          </F>
          <F label="Title — English">
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 80, lineHeight: 1.7, direction: 'ltr' }} value={content.aboutTitleEn} onChange={e => set('aboutTitleEn', e.target.value)} placeholder={'FIGHTING\nFROM THE\nFIELD'} />
          </F>
        </div>
        <div style={twoCol}>
          <F label='תג ("עלינו")'><input style={inp} value={content.aboutTagHe} onChange={e => set('aboutTagHe', e.target.value)} placeholder="עלינו" /></F>
          <F label='Tag ("About Us")'><input style={{ ...inp, direction: 'ltr' }} value={content.aboutTagEn} onChange={e => set('aboutTagEn', e.target.value)} placeholder="About Us" /></F>
        </div>
        <F label="תמונת סקשן עלינו">
          <UploadInput value={content.aboutImage} onChange={v => set('aboutImage', v)} />
        </F>
        <div style={twoCol}>
          <F label="פסקת תקציר — עברית">
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 70 }} value={content.aboutExcerptHe || ''} onChange={e => set('aboutExcerptHe', e.target.value)} />
          </F>
          <F label="Excerpt — English">
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 70, direction: 'ltr' }} value={content.aboutExcerptEn || ''} onChange={e => set('aboutExcerptEn', e.target.value)} />
          </F>
        </div>
        <div style={twoCol}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: '1rem', letterSpacing: 1 }}>עברית</div>
            {content.aboutParaHe.map((p, i) => (
              <F key={i} label={`פסקה ${i + 1}`}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <textarea style={{ ...inp, resize: 'vertical', minHeight: 70, flex: 1 }} value={p} onChange={e => { const arr = [...content.aboutParaHe]; arr[i] = e.target.value; set('aboutParaHe', arr) }} />
                  <button onClick={() => set('aboutParaHe', content.aboutParaHe.filter((_, j) => j !== i))} style={{ background: 'rgba(255,50,50,0.08)', border: 'none', color: 'rgba(255,80,80,0.6)', width: 30, borderRadius: 8, cursor: 'pointer', flexShrink: 0 }}>✕</button>
                </div>
              </F>
            ))}
            <button onClick={() => set('aboutParaHe', [...content.aboutParaHe, ''])} style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-heebo), sans-serif' }}>+ הוסף פסקה</button>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: '1rem', letterSpacing: 1 }}>English</div>
            {content.aboutParaEn.map((p, i) => (
              <F key={i} label={`Paragraph ${i + 1}`}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <textarea style={{ ...inp, resize: 'vertical', minHeight: 70, flex: 1, direction: 'ltr' }} value={p} onChange={e => { const arr = [...content.aboutParaEn]; arr[i] = e.target.value; set('aboutParaEn', arr) }} />
                  <button onClick={() => set('aboutParaEn', content.aboutParaEn.filter((_, j) => j !== i))} style={{ background: 'rgba(255,50,50,0.08)', border: 'none', color: 'rgba(255,80,80,0.6)', width: 30, borderRadius: 8, cursor: 'pointer', flexShrink: 0 }}>✕</button>
                </div>
              </F>
            ))}
            <button onClick={() => set('aboutParaEn', [...content.aboutParaEn, ''])} style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-heebo), sans-serif' }}>+ Add paragraph</button>
          </div>
        </div>
      </Section>

      {/* ── TESTIMONIALS ── */}
      <Section title="המלצות — Testimonials" open={open.has('testimonials')} onToggle={() => toggle('testimonials')} locked={locked}>
        {content.testimonials.map((tc, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', position: 'relative' }}>
            <button onClick={() => removeTestimonial(i)} style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,50,50,0.08)', border: 'none', color: 'rgba(255,80,80,0.6)', width: 28, height: 28, borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>✕</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: 1 }}>המלצה {i + 1}</div>
              <button type="button" disabled={translating === `tc${i}`} style={trBtnStyle(true, translating === `tc${i}`)} onClick={async () => {
                if (!isEditing) startEdit()
                const t = await tr(`tc${i}`, { roleHe: tc.roleHe, textHe: tc.textHe })
                setTestimonial(i, 'roleEn', t.roleHe || tc.roleEn)
                setTestimonial(i, 'textEn', t.textHe || tc.textEn)
              }}>{translating === `tc${i}` ? '⏳' : '✨ תרגם'}</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <F label="שם — עברית"><input style={inp} value={tc.name} onChange={e => setTestimonial(i, 'name', e.target.value)} placeholder="שם הממליץ בעברית" /></F>
              <F label="Name — English"><input style={{ ...inp, direction: 'ltr' }} value={tc.nameEn || ''} onChange={e => setTestimonial(i, 'nameEn', e.target.value)} placeholder="Reviewer name in English" /></F>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <F label="תפקיד עברית"><input style={inp} value={tc.roleHe} onChange={e => setTestimonial(i, 'roleHe', e.target.value)} /></F>
                <F label="Role English"><input style={{ ...inp, direction: 'ltr' }} value={tc.roleEn} onChange={e => setTestimonial(i, 'roleEn', e.target.value)} /></F>
              </div>
            </div>
            <div style={twoCol}>
              <F label="טקסט — עברית"><textarea style={{ ...inp, resize: 'vertical', minHeight: 80 }} value={tc.textHe} onChange={e => setTestimonial(i, 'textHe', e.target.value)} /></F>
              <F label="Text — English"><textarea style={{ ...inp, resize: 'vertical', minHeight: 80, direction: 'ltr' }} value={tc.textEn} onChange={e => setTestimonial(i, 'textEn', e.target.value)} /></F>
            </div>
          </div>
        ))}
        <button onClick={addTestimonial} style={{ background: 'rgba(234,255,0,0.06)', border: '1.5px dashed rgba(234,255,0,0.2)', color: '#EAFF00', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 700 }}>+ הוסף המלצה</button>
      </Section>

      {/* ── CONTACT ── */}
      <Section title="צור קשר — Contact" open={open.has('contact')} onToggle={() => toggle('contact')} locked={locked} action={
        <button type="button" disabled={translating === 'contact'} style={trBtnStyle(true, translating === 'contact')} onClick={async () => {
          if (!isEditing) startEdit()
          const t = await tr('contact', { contactTitleHe: content.contactTitleHe || '', contactSubHe: content.contactSubHe || '' })
          if (t.contactTitleHe) set('contactTitleEn', t.contactTitleHe)
          if (t.contactSubHe) set('contactSubEn', t.contactSubHe)
        }}>{translating === 'contact' ? '⏳' : '✨ תרגם'}</button>
      }>
        <div style={twoCol}>
          <F label="כותרת — עברית">
            <input style={inp} value={content.contactTitleHe || ''} onChange={e => set('contactTitleHe', e.target.value)} placeholder="צור קשר" />
          </F>
          <F label="Title — English">
            <input style={{ ...inp, direction: 'ltr' }} value={content.contactTitleEn || ''} onChange={e => set('contactTitleEn', e.target.value)} placeholder="GET IN TOUCH" dir="ltr" />
          </F>
        </div>
        <div style={twoCol}>
          <F label="טקסט תיאור — עברית">
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 70 }} value={content.contactSubHe || ''} onChange={e => set('contactSubHe', e.target.value)} placeholder="שאלה? רוצים לקבוע שיעור ראשון? פשוט כתבו." />
          </F>
          <F label="Description — English">
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 70, direction: 'ltr' }} value={content.contactSubEn || ''} onChange={e => set('contactSubEn', e.target.value)} placeholder="Questions? Want to book a first class? Just write." />
          </F>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', marginTop: '.25rem' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, marginBottom: '1rem' }}>פרטי קשר</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <F label="טלפון"><input style={inp} value={content.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="054-0000000" dir="ltr" /></F>
            <F label="WhatsApp"><input style={inp} value={content.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)} placeholder="054-0000000" dir="ltr" /></F>
            <F label="Email"><input style={inp} value={content.email || ''} onChange={e => set('email', e.target.value)} placeholder="mail@example.com" dir="ltr" /></F>
            <F label="Instagram"><input style={inp} value={content.instagram || ''} onChange={e => set('instagram', e.target.value)} placeholder="@username" dir="ltr" /></F>
            <F label="Facebook"><input style={inp} value={content.facebook || ''} onChange={e => set('facebook', e.target.value)} placeholder="שם הדף או URL" dir="ltr" /></F>
          </div>
        </div>
      </Section>

      {/* History modal */}
      {showHistory && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 16, width: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column', direction: 'rtl' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: 16 }}>היסטוריית שמירות</div>
              <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '1rem 1.5rem' }}>
              {history.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', padding: '2rem 0' }}>אין גרסאות שמורות עדיין</p>
              ) : history.map((entry, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                      גרסה {history.length - i}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 2 }}>
                      {new Date(entry.at).toLocaleString('he-IL')}
                    </div>
                  </div>
                  <button onClick={() => restoreVersion(entry)} style={{ background: 'rgba(234,255,0,0.08)', border: '1.5px solid rgba(234,255,0,0.2)', color: '#EAFF00', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-heebo), sans-serif' }}>
                    שחזר
                  </button>
                </div>
              ))}
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>* הגרסאות נשמרות בדפדפן זה. שחזור ידרוש שמירה ידנית לאחר מכן.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
