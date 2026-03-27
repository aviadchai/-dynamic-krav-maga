import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(db.articles.list())
}

export async function POST(request: Request) {
  const data = await request.json()
  const article = db.articles.create(data)
  return NextResponse.json(article, { status: 201 })
}
