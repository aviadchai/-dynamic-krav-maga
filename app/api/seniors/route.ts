import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const noCache = { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' }

export async function GET() {
  return NextResponse.json(await db.seniors.list(), { headers: noCache })
}

export async function POST(request: Request) {
  const data = await request.json()
  const senior = await db.seniors.create(data)
  return NextResponse.json(senior, { status: 201 })
}
