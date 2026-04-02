import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Pages accessible only to admin role (not editor)
const ADMIN_ONLY = ['/admin/content', '/admin/brand', '/admin/articles']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get('admin_session')?.value

  // Protect admin pages (except login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Editors cannot access admin-only pages
    if (session === 'editor' && ADMIN_ONLY.some(p => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // Protect write API endpoints (except auth)
  if (
    pathname.startsWith('/api/') &&
    pathname !== '/api/auth' &&
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)
  ) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
