import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { AdminRole } from './admin-session'

const adminName = () => process.env.ADMIN_USERNAME || 'admin'
export const recoveryAddress = () => (process.env.ADMIN_RECOVERY_EMAIL || '').trim().toLowerCase()

export function credentialsDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return 'scrypt$' + salt + '$' + hash
}

function matchesPassword(password: string, stored: string) {
  const [kind, salt, hash] = stored.split('$')
  if (kind !== 'scrypt' || !/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{128}$/.test(hash || '')) return false
  const expected = Buffer.from(hash, 'hex')
  return timingSafeEqual(scryptSync(password, salt, expected.length), expected)
}

export async function verifyAdminLogin(username: string, password: string): Promise<AdminRole | null> {
  const db = credentialsDb()
  if (db) {
    const { data, error } = await db.from('admin_accounts').select('password_hash,role').eq('username', username).maybeSingle()
    // A database outage must not reactivate old Vercel credentials after a password reset.
    if (error) return null
    if (data) return matchesPassword(password, data.password_hash) && (data.role === 'admin' || data.role === 'editor') ? data.role : null
  }
  if (username === adminName() && process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) return 'admin'
  if (process.env.ADMIN_USERNAME_2 && process.env.ADMIN_PASSWORD_2 && username === process.env.ADMIN_USERNAME_2 && password === process.env.ADMIN_PASSWORD_2) return 'admin'
  if (process.env.EDITOR_USERNAME && process.env.EDITOR_PASSWORD && username === process.env.EDITOR_USERNAME && password === process.env.EDITOR_PASSWORD) return 'editor'
  return null
}

export async function updatePrimaryAdminPassword(password: string): Promise<boolean> {
  const db = credentialsDb()
  if (!db || !recoveryAddress()) return false
  const { error } = await db.from('admin_accounts').upsert({
    username: adminName(), email: recoveryAddress(), role: 'admin', password_hash: createPasswordHash(password),
  }, { onConflict: 'username' })
  return !error
}

export function primaryAdminUsername() { return adminName() }
