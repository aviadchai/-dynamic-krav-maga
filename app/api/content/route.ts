import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { readAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

const noCache = { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' }

// Fields an editor may change (the editor pages: About, Services, Testimonials, Reels).
// Site structure and branding stay admin-only.
const EDITOR_FIELDS = new Set(['aboutTimeline', 'services', 'testimonials', 'reels'])

export async function GET() {
  return NextResponse.json(await db.content.get(), { headers: noCache })
}

export async function PUT(request: NextRequest) {
  const role = await readAdminSession(request.cookies.get('admin_session')?.value)
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let data: unknown
  try { data = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  if (role === 'editor') {
    const forbidden = Object.keys(data).filter(k => !EDITOR_FIELDS.has(k))
    if (forbidden.length) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const updated = await db.content.update(data as Parameters<typeof db.content.update>[0])
  return NextResponse.json(updated)
}
