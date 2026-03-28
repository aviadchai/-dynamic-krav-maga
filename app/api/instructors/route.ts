import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const noCache = { 'Cache-Control': 'no-store, no-cache, must-revalidate' }

export async function GET() {
  return NextResponse.json(await db.instructors.list(), { headers: noCache })
}

export async function POST(request: Request) {
  const data = await request.json()
  const instructor = await db.instructors.create(data)
  return NextResponse.json(instructor, { status: 201 })
}
