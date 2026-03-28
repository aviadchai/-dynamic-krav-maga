import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const noCache = { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' }

export async function GET() {
  return NextResponse.json(await db.content.get(), { headers: noCache })
}

export async function PUT(request: Request) {
  const data = await request.json()
  const updated = await db.content.update(data)
  return NextResponse.json(updated)
}
