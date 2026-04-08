import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const noCache = { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' }

export async function GET() {
  return NextResponse.json(await db.seniors.list(), { headers: noCache })
}

export async function POST(request: Request) {
  const data = await request.json()
  const { data: senior, error } = await db.seniors.create(data)
  if (error || !senior) return NextResponse.json({ error: error || 'Insert failed' }, { status: 500 })
  return NextResponse.json(senior, { status: 201 })
}
