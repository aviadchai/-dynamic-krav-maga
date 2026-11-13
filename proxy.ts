import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { readAdminSession } from './lib/admin-session'

// Pages only the admin role may open. Editors keep About, Instructors, Seniors,
// Services, Testimonials, Reels and Articles (matching the admin navigation).
const ADMIN_ONLY = ['/admin/content', '/admin/brand']
const PUBLIC_ADMIN = ['/admin/login', '/admin/forgot-password', '/admin/reset-password']
const AUTH_ENDPOINTS = ['/api/auth', '/api/auth/recovery', '/api/auth/reset-password']
const MUTATING = ['POST', 'PUT', 'DELETE', 'PATCH']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const role = await readAdminSession(request.cookies.get('admin_session')?.value)

  if (pathname.startsWith('/admin') && !PUBLIC_ADMIN.includes(pathname)) {
    if (!role) return NextResponse.redirect(new URL('/admin/login', request.url))
    if (role !== 'admin' && ADMIN_ONLY.some(p => pathname === p || pathname.startsWith(p + '/')))
      return NextResponse.redirect(new URL('/admin', request.url))
  }

  if (pathname.startsWith('/api/') && MUTATING.includes(request.method)) {
    // CSRF defense in depth: browsers always send Origin on cross-site POSTs.
    const origin = request.headers.get('origin')
    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (!AUTH_ENDPOINTS.includes(pathname) && !role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*', '/api/:path*'] }
