"use client"
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

declare global { interface Window { __adminDirty?: boolean } }

const S = (d: string) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const NAV = [
  { href: '/admin', label: 'סטטיסטיקות', icon: S('M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z') },
  { href: '/admin/content', label: 'תוכן האתר', icon: S('M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z') },
  { href: '/admin/articles', label: 'מאמרים', icon: S('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8') },
  { href: '/admin/instructors', label: 'מאמנים', icon: S('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z') },
  { href: '/admin/services', label: 'שירותים', icon: S('M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12h6M9 16h4') },
  { href: '/admin/reels', label: 'רילסים', icon: S('M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z') },
  { href: '/admin/brand', label: 'מיתוג', icon: S('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z') },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/admin/login') return <>{children}</>

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      fontFamily: 'var(--font-heebo), sans-serif',
      background: '#0A0A0A', direction: 'rtl',
    }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#0D0D0D',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, right: 0, bottom: 0,
        zIndex: 200,
      }}>
        {/* Logo */}
        <div style={{
          padding: '1.5rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: 10, color: '#EAFF00', letterSpacing: 3, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
            Dynamic Krav Maga
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
            פאנל ניהול
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
          {NAV.map(item => {
            const active = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} onClick={e => {
                if (window.__adminDirty && !confirm('יש שינויים שלא נשמרו. לעזוב את הדף?')) e.preventDefault()
              }} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                marginBottom: 4,
                background: active ? 'rgba(234,255,0,0.1)' : 'transparent',
                color: active ? '#EAFF00' : 'rgba(255,255,255,0.45)',
                textDecoration: 'none', fontSize: 14, fontWeight: active ? 700 : 500,
                transition: 'all .15s',
              }}>
                <span style={{ display: 'flex', flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{
          padding: '1rem 0.75rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <a href="/" target="_blank" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10,
            color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
            fontSize: 13, marginBottom: 4,
          }}>
            {S('M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3')} צפה באתר
          </a>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10, width: '100%',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'right',
          }}>
            {S('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9')} יציאה
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{
        flex: 1, marginRight: 240,
        background: '#111', minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  )
}
