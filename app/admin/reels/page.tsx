"use client"
import { useEffect, useState } from 'react'
import type { Reel } from '@/lib/db'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C' },
  { id: 'youtube',   label: 'YouTube',   color: '#FF0000' },
  { id: 'tiktok',    label: 'TikTok',    color: '#69C9D0' },
  { id: 'facebook',  label: 'Facebook',  color: '#1877F2' },
]

function detectPlatform(url: string): string {
  if (url.includes('instagram.com')) return 'instagram'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook'
  return 'instagram'
}

function isFbVideo(url: string) {
  return url.includes('/videos/') || url.includes('fb.watch')
}

// Facebook posts can't be reliably embedded — shown as link cards instead
export function isFbPost(platform: string, url: string) {
  return platform === 'facebook' && !isFbVideo(url)
}

function getEmbedUrl(url: string, platform: string): string {
  if (platform === 'instagram') {
    const m = url.match(/\/(reel|p)\/([A-Za-z0-9_-]+)/)
    if (m) return `https://www.instagram.com/${m[1]}/${m[2]}/embed/`
  }
  if (platform === 'youtube') {
    let id = ''
    if (url.includes('watch?v=')) id = url.split('watch?v=')[1].split('&')[0]
    else if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1].split('?')[0]
    else if (url.includes('/shorts/')) id = url.split('/shorts/')[1].split('?')[0]
    if (id) return `https://www.youtube.com/embed/${id}`
  }
  if (platform === 'tiktok') {
    const m = url.match(/\/video\/(\d+)/)
    if (m) return `https://www.tiktok.com/embed/v2/${m[1]}`
  }
  if (platform === 'facebook' && isFbVideo(url)) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=320`
  }
  return url
}

function getAspectRatio(platform: string, url: string): string {
  if (platform === 'youtube') return '16/9'
  return '9/16'
}

const inp: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1.5px solid rgba(255,255,255,0.1)',
  color: '#fff', padding: '11px 14px', borderRadius: 10,
  fontFamily: 'var(--font-heebo), sans-serif', fontSize: 14, outline: 'none',
}

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newPlatform, setNewPlatform] = useState('instagram')
  const [preview, setPreview] = useState('')

  useEffect(() => {
    fetch('/api/content').then(r => r.json()).then(d => setReels(d.reels || []))
  }, [])

  function handleUrlChange(url: string) {
    setNewUrl(url)
    if (url.trim()) {
      const p = detectPlatform(url)
      setNewPlatform(p)
      setPreview(getEmbedUrl(url.trim(), p))
    } else {
      setPreview('')
    }
  }

  async function addReel() {
    if (!newUrl.trim()) return
    const reel: Reel = {
      id: Date.now().toString(),
      url: newUrl.trim(),
      platform: newPlatform,
      title: newTitle.trim(),
    }
    const updated = [...reels, reel]
    setReels(updated)
    setNewUrl(''); setNewTitle(''); setPreview('')
    await saveReels(updated)
  }

  function removeReel(id: string) {
    setReels(r => r.filter(x => x.id !== id))
  }

  function moveUp(i: number) {
    if (i === 0) return
    const arr = [...reels]; [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; setReels(arr)
  }
  function moveDown(i: number) {
    if (i === reels.length - 1) return
    const arr = [...reels]; [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; setReels(arr)
  }

  async function saveReels(list: Reel[]) {
    setSaving(true)
    await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reels: list }),
    })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  async function save() {
    await saveReels(reels)
  }

  const platColor = PLATFORMS.find(p => p.id === newPlatform)?.color || '#fff'

  return (
    <div style={{ padding: '2.5rem', direction: 'rtl', maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>רילסים</h1>
        <button onClick={save} disabled={saving} style={{
          background: saved ? 'rgba(234,255,0,0.8)' : '#EAFF00', color: '#0A0A0A', border: 'none',
          padding: '11px 28px', borderRadius: 50, cursor: 'pointer',
          fontFamily: 'var(--font-heebo), sans-serif', fontWeight: 800, fontSize: 13,
          opacity: saving ? 0.7 : 1,
        }}>
          {saving ? 'שומר...' : saved ? '✓ נשמר' : 'שמור שינויים'}
        </button>
      </div>

      {/* Add new reel */}
      <div style={{ background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#EAFF00', textTransform: 'uppercase', marginBottom: '1.25rem' }}>הוסף רילס חדש</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>קישור</label>
            <input
              style={inp} dir="ltr"
              value={newUrl}
              onChange={e => handleUrlChange(e.target.value)}
              placeholder="https://www.instagram.com/reel/... או YouTube, TikTok, Facebook"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>פלטפורמה</label>
            <select
              style={{ ...inp, background: '#1C1C1C', cursor: 'pointer', width: 140 }}
              value={newPlatform}
              onChange={e => { setNewPlatform(e.target.value); setPreview(getEmbedUrl(newUrl.trim(), e.target.value)) }}
            >
              {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>כותרת (אופציונלי)</label>
          <input style={inp} value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="תיאור קצר..." />
        </div>

        {/* Preview */}
        {preview && (
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            {isFbPost(newPlatform, newUrl) ? (
              <div style={{ flex: '0 0 260px', borderRadius: 10, border: '1.5px solid #1877F233', background: '#1877F211', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>פוסט פייסבוק</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }} dir="ltr">{newUrl}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,180,0,0.8)', background: 'rgba(255,180,0,0.08)', padding: '6px 10px', borderRadius: 6 }}>
                  פייסבוק חוסמת הטמעה — יוצג ככרטיסיית קישור
                </div>
              </div>
            ) : (
              <div style={{ flex: '0 0 180px', borderRadius: 10, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.08)', background: '#0A0A0A', aspectRatio: getAspectRatio(newPlatform, newUrl), maxHeight: 320 }}>
                <iframe src={preview} style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} allowFullScreen scrolling="no" />
              </div>
            )}
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>תצוגה מקדימה</div>
              <div style={{ display: 'inline-block', background: platColor + '22', border: `1px solid ${platColor}55`, color: platColor, padding: '3px 12px', borderRadius: 50, fontSize: 11, fontWeight: 700 }}>
                {PLATFORMS.find(p => p.id === newPlatform)?.label}
              </div>
            </div>
          </div>
        )}

        <button onClick={addReel} style={{
          background: 'rgba(234,255,0,0.1)', border: '1.5px solid rgba(234,255,0,0.25)',
          color: '#EAFF00', padding: '10px 24px', borderRadius: 10,
          fontFamily: 'var(--font-heebo), sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>
          + הוסף לרשימה
        </button>
      </div>

      {/* Reels list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reels.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14, textAlign: 'center', padding: '2rem' }}>אין רילסים עדיין</div>
        )}
        {reels.map((reel, i) => {
          const pc = PLATFORMS.find(p => p.id === reel.platform)?.color || '#fff'
          const embedUrl = getEmbedUrl(reel.url, reel.platform)
          return (
            <div key={reel.id} style={{
              background: '#141414', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 14,
              padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'center',
            }}>
              {/* Preview thumb */}
              <div style={{ flex: '0 0 90px', borderRadius: 8, overflow: 'hidden', background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)', aspectRatio: getAspectRatio(reel.platform, reel.url), maxHeight: 160 }}>
                <iframe src={embedUrl} style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: 'none' }} scrolling="no" />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'inline-block', background: pc + '22', border: `1px solid ${pc}55`, color: pc, padding: '2px 10px', borderRadius: 50, fontSize: 10, fontWeight: 700, marginBottom: 6 }}>
                  {PLATFORMS.find(p => p.id === reel.platform)?.label}
                </div>
                {reel.title && <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{reel.title}</div>}
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} dir="ltr">{reel.url}</div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                <button onClick={() => moveUp(i)} disabled={i === 0} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: i === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)', width: 32, height: 32, borderRadius: 8, cursor: i === 0 ? 'default' : 'pointer', fontSize: 14 }}>↑</button>
                <button onClick={() => moveDown(i)} disabled={i === reels.length - 1} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: i === reels.length - 1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)', width: 32, height: 32, borderRadius: 8, cursor: i === reels.length - 1 ? 'default' : 'pointer', fontSize: 14 }}>↓</button>
                <button onClick={() => removeReel(reel.id)} style={{ background: 'rgba(255,50,50,0.08)', border: 'none', color: 'rgba(255,80,80,0.7)', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>✕</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
