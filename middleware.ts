import { NextRequest, NextResponse } from 'next/server'

// Pages accessible only to admin role (not editor)
const ADMIN_ONLY = ['/admin/content', '/admin/brand', '/admin/articles']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/admin')) return NextResponse.next()
  if (pathname === '/admin/login') return NextResponse.next()

  const session = req.cookies.get('admin_session')?.value

  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  // Editors cannot access admin-only pages
  if (session === 'editor' && ADMIN_ONLY.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
