"use client"
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

const NAV = [
  { href: '/admin', label: 'לוח בקרה', icon: '⊞' },
  { href: '/admin/articles', label: 'מאמרים', icon: '✍' },
  { href: '/admin/instructors', label: 'מאמנים', icon: '👤' },
  { href: '/admin/content', label: 'תוכן האתר', icon: '✏' },
  { href: '/admin/brand', label: 'מיתוג', icon: '🎨' },
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
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                marginBottom: 4,
                background: active ? 'rgba(234,255,0,0.1)' : 'transparent',
                color: active ? '#EAFF00' : 'rgba(255,255,255,0.45)',
                textDecoration: 'none', fontSize: 14, fontWeight: active ? 700 : 500,
                transition: 'all .15s',
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
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
            <span>🌐</span> צפה באתר
          </a>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10, width: '100%',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'right',
          }}>
            <span>↩</span> יציאה
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
