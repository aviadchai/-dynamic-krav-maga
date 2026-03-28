import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const noCache = { 'Cache-Control': 'no-store, no-cache, must-revalidate' }

export async function GET() {
  return NextResponse.json(await db.articles.list(), { headers: noCache })
}

export async function POST(request: Request) {
  const data = await request.json()
  const article = await db.articles.create(data)
  return NextResponse.json(article, { status: 201 })
}
