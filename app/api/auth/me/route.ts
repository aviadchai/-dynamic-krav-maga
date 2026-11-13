import { NextRequest, NextResponse } from 'next/server'
import { readAdminSession } from '@/lib/admin-session'

export async function GET(request: NextRequest) {
  const role = await readAdminSession(request.cookies.get('admin_session')?.value)
  if (!role) return NextResponse.json({ role: null }, { status: 401 })
  return NextResponse.json({ role })
}
