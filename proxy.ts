import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const VALID_ROLES = ['admin', 'editor']
const ADMIN_ONLY = ['/admin/content', '/admin/brand']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get('admin_session')?.value
  const isValidSession = session && VALID_ROLES.includes(session)

  // Protect admin pages (except login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isValidSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Only admin can access certain pages
    if (session !== 'admin' && ADMIN_ONLY.some(p => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // Protect write API endpoints (except auth)
  if (
    pathname.startsWith('/api/') &&
    pathname !== '/api/auth' &&
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)
  ) {
    if (!isValidSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
