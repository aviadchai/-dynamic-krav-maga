import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { readAdminSession } from './lib/admin-session'

const ADMIN_ONLY = ['/admin/content', '/admin/brand', '/admin/articles']
const PUBLIC_ADMIN = ['/admin/login', '/admin/forgot-password', '/admin/reset-password']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const role = await readAdminSession(request.cookies.get('admin_session')?.value)

  if (pathname.startsWith('/admin') && !PUBLIC_ADMIN.includes(pathname)) {
    if (!role) return NextResponse.redirect(new URL('/admin/login', request.url))
    if (role !== 'admin' && ADMIN_ONLY.some(p => pathname.startsWith(p)))
      return NextResponse.redirect(new URL('/admin', request.url))
  }

  if (pathname.startsWith('/api/') && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const isAuthEndpoint = pathname === '/api/auth' || pathname === '/api/auth/recovery' || pathname === '/api/auth/reset-password'
    if (!isAuthEndpoint && !role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!isAuthEndpoint && role === 'editor' && ['/api/content', '/api/articles'].some(p => pathname.startsWith(p)))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*', '/api/:path*'] }
