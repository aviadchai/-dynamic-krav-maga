"use client"
import { useEffect, useState, useRef } from 'react'
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

function Section({ id, title, open, onToggle, children }: { id: string, title: string, open: boolean, onToggle: () => void, children: React.ReactNode }) {
  return (
    <div style={{ background: '#141414', border: `1.5px solid ${open ? 'rgba(234,255,0,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, marginBottom: '1rem', overflow: 'hidden', transition: 'border-color .2s' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.1rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-heebo), sans-serif',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: open ? '#EAFF00' : 'rgba(255,255,255,0.55)', textTransform: 'uppercase', transition: 'color .2s' }}>{title}</span>
        <span style={{ color: open ? '#EAFF00' : 'rgba(255,255,255,0.3)', fontSize: 18, transition: 'transform .25s, color .2s', display: 'block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>⌃</span>
      </button>
      {open && <div style={{ padding: '0 1.5rem 1.5rem' }}>{children}</div>}
    </div>
  )
}

const twoCol: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }

function UploadInput({ value, onChange, placeholder }: { value: string, onChange: (v: string) => void, placeholder?: string }) {
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
      <input style={{ ...inp, flex: 1, fontSize: 12 }} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'URL...'} dir="ltr" />
    </div>
  )
}

export default function ContentPage() {
  const [content, setContent] = useState<SiteContent | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [open, setOpen] = useState<Set<string>>(new Set(['hero']))

  function toggle(id: string) {
    setOpen(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  useEffect(() => {
    fetch('/api/content').then(r => r.json()).then(setContent)
  }, [])

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
    setContent(c => c ? { ...c, testimonials: [...c.testimonials, { name: '', roleHe: '', roleEn: '', textHe: '', textEn: '' }] } : c)
  }

  function removeTestimonial(i: number) {
    setContent(c => c ? { ...c, testimonials: c.testimonials.filter((_, idx) => idx !== i) } : c)
  }

  async function save() {
    if (!content) return
    setSaving(true)
    // Only send fields managed by this page — NOT reels or brand fields
    // (those are saved by their own admin pages and must not be overwritten here)
    const { reels: _r, brandColor: _bc, brandColorSecondary: _bcs, brandColorText: _bct,
      brandBg: _bb, brandLogoUrl: _blu, brandLogoLight: _bll,
      badgePillHe: _bph, badgePillEn: _bpe, ...contentFields } = content
    await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(contentFields) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  if (!content) return <div style={{ padding: '2.5rem', color: 'rgba(255,255,255,0.3)' }}>טוען...</div>

  return (
    <div style={{ padding: '2.5rem', direction: 'rtl', maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>תוכן האתר</h1>
        <button onClick={save} disabled={saving} style={{
          background: saved ? 'rgba(234,255,0,0.8)' : '#EAFF00', color: '#0A0A0A', border: 'none',
          padding: '11px 28px', borderRadius: 50, cursor: 'pointer',
          fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 800, fontSize: 13,
          opacity: saving ? 0.7 : 1, transition: 'all .2s',
        }}>
          {saving ? 'שומר...' : saved ? '✓ נשמר' : 'שמור שינויים'}
        </button>
      </div>

      {/* ── HERO ── */}
      <Section id="hero" title="Hero — סקשן ראשי" open={open.has('hero')} onToggle={() => toggle('hero')}>
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
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>שורה חדשה = שבירת שורה. השורה האמצעית תודגש בצבע מותג.</div>
          </F>
          <F label="Main Title — English">
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 90, lineHeight: 1.7, direction: 'ltr' }}
              value={content.heroTitleEn} onChange={e => set('heroTitleEn', e.target.value)}
              placeholder={'DEFEND\nYOUR\nSELF'} />
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>New line = line break. Middle line will be highlighted.</div>
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
          <F label="כפתור ראשי — עברית">
            <input style={inp} value={content.heroBtnPrimaryHe} onChange={e => set('heroBtnPrimaryHe', e.target.value)} />
          </F>
          <F label="Primary Btn — English">
            <input style={{ ...inp, direction: 'ltr' }} value={content.heroBtnPrimaryEn} onChange={e => set('heroBtnPrimaryEn', e.target.value)} />
          </F>
          <F label="כפתור משני — עברית">
            <input style={inp} value={content.heroBtnSecondaryHe} onChange={e => set('heroBtnSecondaryHe', e.target.value)} />
          </F>
          <F label="Secondary Btn — English">
            <input style={{ ...inp, direction: 'ltr' }} value={content.heroBtnSecondaryEn} onChange={e => set('heroBtnSecondaryEn', e.target.value)} />
          </F>
        </div>
        <F label="תמונת הירו">
          <UploadInput value={content.heroImage} onChange={v => set('heroImage', v)} placeholder="/images/hero.jpg" />
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
      <Section id="about" title="עלינו — About" open={open.has('about')} onToggle={() => toggle('about')}>
        <div style={twoCol}>
          <F label="כותרת — עברית">
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 80, lineHeight: 1.7 }}
              value={content.aboutTitleHe} onChange={e => set('aboutTitleHe', e.target.value)}
              placeholder={'לחימה\nשמגיעה\nמהשטח'} />
          </F>
          <F label="Title — English">
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 80, lineHeight: 1.7, direction: 'ltr' }}
              value={content.aboutTitleEn} onChange={e => set('aboutTitleEn', e.target.value)}
              placeholder={'FIGHTING\nFROM THE\nFIELD'} />
          </F>
        </div>
        <div style={twoCol}>
          <F label='תג ("עלינו")'>
            <input style={inp} value={content.aboutTagHe} onChange={e => set('aboutTagHe', e.target.value)} placeholder="עלינו" />
          </F>
          <F label='Tag ("About Us")'>
            <input style={{ ...inp, direction: 'ltr' }} value={content.aboutTagEn} onChange={e => set('aboutTagEn', e.target.value)} placeholder="About Us" />
          </F>
        </div>
        <F label="תמונת סקשן עלינו">
          <UploadInput value={content.aboutImage} onChange={v => set('aboutImage', v)} placeholder="/images/about.jpg" />
        </F>
        <div style={twoCol}>
          <F label="פסקת תקציר — עברית">
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 70 }} value={content.aboutExcerptHe || ''} onChange={e => set('aboutExcerptHe', e.target.value)} placeholder="משפט פותח קצר ובולט שמסכם את הגישה שלכם..." />
          </F>
          <F label="Excerpt — English">
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 70, direction: 'ltr' }} value={content.aboutExcerptEn || ''} onChange={e => set('aboutExcerptEn', e.target.value)} placeholder="A short bold opening sentence..." />
          </F>
        </div>
        <div style={twoCol}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: '1rem', letterSpacing: 1 }}>עברית</div>
            {content.aboutParaHe.map((p, i) => (
              <F key={i} label={`פסקה ${i + 1}`}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <textarea style={{ ...inp, resize: 'vertical', minHeight: 70, flex: 1 }} value={p}
                    onChange={e => { const arr = [...content.aboutParaHe]; arr[i] = e.target.value; set('aboutParaHe', arr) }} />
                  <button onClick={() => { const arr = content.aboutParaHe.filter((_, j) => j !== i); set('aboutParaHe', arr) }}
                    style={{ background: 'rgba(255,50,50,0.08)', border: 'none', color: 'rgba(255,80,80,0.6)', width: 30, borderRadius: 8, cursor: 'pointer', flexShrink: 0 }}>✕</button>
                </div>
              </F>
            ))}
            <button onClick={() => set('aboutParaHe', [...content.aboutParaHe, ''])}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-heebo), sans-serif' }}>
              + הוסף פסקה
            </button>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: '1rem', letterSpacing: 1 }}>English</div>
            {content.aboutParaEn.map((p, i) => (
              <F key={i} label={`Paragraph ${i + 1}`}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <textarea style={{ ...inp, resize: 'vertical', minHeight: 70, flex: 1, direction: 'ltr' }} value={p}
                    onChange={e => { const arr = [...content.aboutParaEn]; arr[i] = e.target.value; set('aboutParaEn', arr) }} />
                  <button onClick={() => { const arr = content.aboutParaEn.filter((_, j) => j !== i); set('aboutParaEn', arr) }}
                    style={{ background: 'rgba(255,50,50,0.08)', border: 'none', color: 'rgba(255,80,80,0.6)', width: 30, borderRadius: 8, cursor: 'pointer', flexShrink: 0 }}>✕</button>
                </div>
              </F>
            ))}
            <button onClick={() => set('aboutParaEn', [...content.aboutParaEn, ''])}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-heebo), sans-serif' }}>
              + Add paragraph
            </button>
          </div>
        </div>
      </Section>

      {/* ── TESTIMONIALS ── */}
      <Section id="testimonials" title="המלצות — Testimonials" open={open.has('testimonials')} onToggle={() => toggle('testimonials')}>
        {content.testimonials.map((tc, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', position: 'relative' }}>
            <button onClick={() => removeTestimonial(i)}
              style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,50,50,0.08)', border: 'none', color: 'rgba(255,80,80,0.6)', width: 28, height: 28, borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>✕</button>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: '1rem', letterSpacing: 1 }}>המלצה {i + 1}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <F label="שם"><input style={inp} value={tc.name} onChange={e => setTestimonial(i, 'name', e.target.value)} placeholder="שם הממליץ" /></F>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <F label="תפקיד עברית"><input style={inp} value={tc.roleHe} onChange={e => setTestimonial(i, 'roleHe', e.target.value)} /></F>
                <F label="Role English"><input style={{ ...inp, direction: 'ltr' }} value={tc.roleEn} onChange={e => setTestimonial(i, 'roleEn', e.target.value)} /></F>
              </div>
            </div>
            <div style={twoCol}>
              <F label="טקסט — עברית">
                <textarea style={{ ...inp, resize: 'vertical', minHeight: 80 }} value={tc.textHe} onChange={e => setTestimonial(i, 'textHe', e.target.value)} />
              </F>
              <F label="Text — English">
                <textarea style={{ ...inp, resize: 'vertical', minHeight: 80, direction: 'ltr' }} value={tc.textEn} onChange={e => setTestimonial(i, 'textEn', e.target.value)} />
              </F>
            </div>
          </div>
        ))}
        <button onClick={addTestimonial}
          style={{ background: 'rgba(234,255,0,0.06)', border: '1.5px dashed rgba(234,255,0,0.2)', color: '#EAFF00', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 700 }}>
          + הוסף המלצה
        </button>
      </Section>

      {/* ── CONTACT ── */}
      <Section id="contact" title="פרטי יצירת קשר" open={open.has('contact')} onToggle={() => toggle('contact')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <F label="טלפון"><input style={inp} value={content.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="054-0000000" dir="ltr" /></F>
          <F label="WhatsApp"><input style={inp} value={content.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)} placeholder="054-0000000" dir="ltr" /></F>
          <F label="Email"><input style={inp} value={content.email || ''} onChange={e => set('email', e.target.value)} placeholder="mail@example.com" dir="ltr" /></F>
          <F label="Instagram"><input style={inp} value={content.instagram || ''} onChange={e => set('instagram', e.target.value)} placeholder="@username" dir="ltr" /></F>
          <F label="Facebook"><input style={inp} value={content.facebook || ''} onChange={e => set('facebook', e.target.value)} placeholder="שם הדף או URL" dir="ltr" /></F>
        </div>
      </Section>
    </div>
  )
}
