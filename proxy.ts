import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin pages (except login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = request.cookies.get('admin_session')
    if (!session || session.value !== 'ok') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Protect write API endpoints (except auth login/logout)
  if (
    pathname.startsWith('/api/') &&
    pathname !== '/api/auth' &&
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)
  ) {
    const session = request.cookies.get('admin_session')
    if (!session || session.value !== 'ok') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
