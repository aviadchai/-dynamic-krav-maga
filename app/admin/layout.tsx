"use client"
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

declare global { interface Window { __adminDirty?: boolean } }

const S = (d: string) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

// Pages accessible only to admin role
const ADMIN_ONLY_HREFS = ['/admin/content', '/admin/brand', '/admin/articles']

const NAV_SECTIONS = [
  {
    label: 'מבנה כללי',
    items: [
      { href: '/admin', label: 'סטטיסטיקות', icon: S('M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z'), adminOnly: false },
      { href: '/admin/content', label: 'מבנה כללי', icon: S('M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'), adminOnly: true },
      { href: '/admin/brand', label: 'מיתוג', icon: S('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'), adminOnly: true },
    ],
  },
  {
    label: 'תוכן האתר',
    items: [
      { href: '/admin/about', label: 'אודות', icon: S('M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01'), adminOnly: false },
      { href: '/admin/instructors', label: 'מאמנים', icon: S('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'), adminOnly: false },
      { href: '/admin/services', label: 'שירותים', icon: S('M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12h6M9 16h4'), adminOnly: false },
      { href: '/admin/testimonials', label: 'המלצות', icon: S('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'), adminOnly: false },
      { href: '/admin/reels', label: 'רילסים', icon: S('M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z'), adminOnly: false },
      { href: '/admin/articles', label: 'מאמרים', icon: S('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8'), adminOnly: true },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.role) setRole(d.role)
    })
  }, [])

  if (pathname === '/admin/login') return <>{children}</>

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  function renderNavItems(items: typeof NAV_SECTIONS[0]['items'], mobile = false) {
    return items
      .filter(item => role === 'admin' || !item.adminOnly)
      .map(item => {
        const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
        if (mobile) {
          return (
            <Link key={item.href} href={item.href} className={active ? 'active' : ''} onClick={e => {
              if (window.__adminDirty && !confirm('יש שינויים שלא נשמרו. לעזוב את הדף?')) e.preventDefault()
            }}>
              {item.icon}
              {item.label}
            </Link>
          )
        }
        return (
          <Link key={item.href} href={item.href} onClick={e => {
            if (window.__adminDirty && !confirm('יש שינויים שלא נשמרו. לעזוב את הדף?')) e.preventDefault()
          }} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 10, marginBottom: 2,
            background: active ? 'rgba(234,255,0,0.1)' : 'transparent',
            color: active ? '#EAFF00' : 'rgba(255,255,255,0.45)',
            textDecoration: 'none', fontSize: 13, fontWeight: active ? 700 : 500,
            transition: 'all .15s',
          }}>
            <span style={{ display: 'flex', flexShrink: 0 }}>{item.icon}</span>
            {item.label}
          </Link>
        )
      })
  }

  return (
    <>
      <style>{`
        .admin-wrap { display: flex; min-height: 100vh; font-family: var(--font-heebo), sans-serif; background: #0A0A0A; direction: rtl; }
        .admin-sidebar { width: 240px; background: #0D0D0D; border-left: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; position: fixed; top: 0; right: 0; bottom: 0; z-index: 200; }
        .admin-main { flex: 1; margin-right: 240px; background: #111; min-height: 100vh; overflow-x: hidden; min-width: 0; }
        .admin-bottom-nav { display: none; }
        @media (max-width: 700px) {
          .admin-sidebar { display: none; }
          .admin-main { margin-right: 0; padding-bottom: 70px; }
          .admin-bottom-nav {
            display: flex;
            position: fixed; bottom: 0; left: 0; right: 0;
            background: #0D0D0D;
            border-top: 1px solid rgba(255,255,255,0.08);
            z-index: 300;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .admin-bottom-nav::-webkit-scrollbar { display: none; }
          .admin-bottom-nav a, .admin-bottom-nav button {
            flex: 0 0 auto;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            gap: 4px;
            padding: 10px 14px;
            min-width: 60px;
            color: rgba(255,255,255,0.4);
            font-size: 10px; font-weight: 600;
            text-decoration: none;
            border: none; background: none; cursor: pointer;
            font-family: var(--font-heebo), sans-serif;
            white-space: nowrap;
            transition: color .15s;
          }
          .admin-bottom-nav a.active { color: #EAFF00; }
        }
      `}</style>
      <div className="admin-wrap">
        {/* Desktop Sidebar */}
        <aside className="admin-sidebar">
          <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 10, color: '#EAFF00', letterSpacing: 3, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
              Dynamic Krav Maga
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>פאנל ניהול</div>
            {role && (
              <div style={{ marginTop: 6, fontSize: 10, color: role === 'admin' ? 'rgba(234,255,0,0.6)' : 'rgba(255,255,255,0.2)', letterSpacing: 1, fontWeight: 600 }}>
                {role === 'admin' ? '★ מנהל מערכת' : '● עורך'}
              </div>
            )}
          </div>
          <nav style={{ flex: 1, padding: '0.75rem 0.75rem', overflowY: 'auto' }}>
            {NAV_SECTIONS.map(section => {
              const visibleItems = section.items.filter(item => role === 'admin' || !item.adminOnly)
              if (visibleItems.length === 0) return null
              return (
                <div key={section.label} style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', padding: '8px 12px 4px' }}>
                    {section.label}
                  </div>
                  {renderNavItems(visibleItems)}
                </div>
              )
            })}
          </nav>
          <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <a href="/" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: 13, marginBottom: 4 }}>
              {S('M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3')} צפה באתר
            </a>
            <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'right' }}>
              {S('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9')} יציאה
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="admin-main">
          {/* Top bar — always visible */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, padding: '12px 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0D0D0D', direction: 'rtl' }}>
            <a href="/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(234,255,0,0.1)', border: '1.5px solid rgba(234,255,0,0.3)', color: '#EAFF00', padding: '8px 18px', borderRadius: 50, textDecoration: 'none', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-heebo), sans-serif' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
              מעבר לאתר
            </a>
            <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', padding: '8px 18px', borderRadius: 50, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-heebo), sans-serif' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              יציאה מהמערכת
            </button>
          </div>
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="admin-bottom-nav">
          {NAV_SECTIONS.flatMap(s => s.items)
            .filter(item => role === 'admin' || !item.adminOnly)
            .map(item => {
              const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href} className={active ? 'active' : ''} onClick={e => {
                  if (window.__adminDirty && !confirm('יש שינויים שלא נשמרו. לעזוב את הדף?')) e.preventDefault()
                }}>
                  {item.icon}
                  {item.label}
                </Link>
              )
            })}
          <button onClick={logout}>
            {S('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9')}
            יציאה
          </button>
        </nav>
      </div>
    </>
  )
}
