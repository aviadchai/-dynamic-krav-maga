import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(db.instructors.list())
}

export async function POST(request: Request) {
  const data = await request.json()
  const instructor = db.instructors.create(data)
  return NextResponse.json(instructor, { status: 201 })
}
