import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const session = request.cookies.get('admin_session')?.value
  if (!session) return NextResponse.json({ role: null }, { status: 401 })
  return NextResponse.json({ role: session })
}
