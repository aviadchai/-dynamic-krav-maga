import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = await request.json()
  console.log('[PUT /api/instructors/:id] id=', id, 'data=', JSON.stringify(data))
  const instructor = await db.instructors.update(id, data)
  console.log('[PUT /api/instructors/:id] result=', JSON.stringify(instructor))
  if (!instructor) return NextResponse.json({ error: 'Not found or save failed' }, { status: 404 })
  return NextResponse.json(instructor)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ok = await db.instructors.delete(id)
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
