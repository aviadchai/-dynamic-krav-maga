import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { AdminRole } from './admin-session'

const adminName = () => (process.env.ADMIN_USERNAME || 'admin').trim()
export const recoveryAddress = () => (process.env.ADMIN_RECOVERY_EMAIL || '').trim().toLowerCase()

export const MIN_PASSWORD_LENGTH = 10

// Well-known weak values. An account configured with one of these is refused, so a
// forgotten default (the old code fell back to "admin123") can never grant access.
const WEAK_PASSWORDS = new Set([
  'admin', 'admin1', 'admin12', 'admin123', 'admin1234', 'admin12345', 'administrator',
  'password', 'password1', 'password123', 'passw0rd', '123456', '1234567', '12345678',
  '123456789', '1234567890', 'qwerty', 'qwerty123', '111111', '000000', 'changeme', 'letmein',
])

export function isWeakPassword(password: string, username = '') {
  const p = password.toLowerCase()
  return password.length < MIN_PASSWORD_LENGTH || WEAK_PASSWORDS.has(p) ||
    (!!username && p.includes(username.toLowerCase())) || /^(.)\1+$/.test(password)
}

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

// Constant-time comparison for credentials kept in environment variables.
function sameSecret(a: string, b: string) {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

type EnvAccount = { username: string; password: string; role: AdminRole }

function envAccounts(): EnvAccount[] {
  const list: EnvAccount[] = [
    { username: adminName(), password: process.env.ADMIN_PASSWORD || '', role: 'admin' },
    { username: (process.env.ADMIN_USERNAME_2 || '').trim(), password: process.env.ADMIN_PASSWORD_2 || '', role: 'admin' },
    { username: (process.env.EDITOR_USERNAME || '').trim(), password: process.env.EDITOR_PASSWORD || '', role: 'editor' },
  ]
  return list.filter(a => {
    if (!a.username || !a.password) return false
    if (isWeakPassword(a.password, a.username)) {
      console.error(`[admin-auth] Refusing login for "${a.username}": its configured password is too weak.`)
      return false
    }
    return true
  })
}

export async function verifyAdminLogin(username: string, password: string): Promise<AdminRole | null> {
  const db = credentialsDb()
  if (db) {
    const { data, error } = await db.from('admin_accounts').select('password_hash,role').eq('username', username).maybeSingle()
    // A database outage must not reactivate old Vercel credentials after a password reset.
    if (error) return null
    if (data) return matchesPassword(password, data.password_hash) && (data.role === 'admin' || data.role === 'editor') ? data.role : null
  }
  let role: AdminRole | null = null
  // Check every account so the response time does not reveal which username exists.
  for (const account of envAccounts()) {
    const userOk = sameSecret(username, account.username)
    const passOk = sameSecret(password, account.password)
    if (userOk && passOk && !role) role = account.role
  }
  return role
}

export async function updatePrimaryAdminPassword(password: string): Promise<boolean> {
  const db = credentialsDb()
  if (!db || !recoveryAddress()) return false
  const { error } = await db.from('admin_accounts').upsert({
    username: adminName(), email: recoveryAddress(), role: 'admin', password_hash: createPasswordHash(password),
    password_changed_at: new Date().toISOString(),
  }, { onConflict: 'username' })
  return !error
}

export function primaryAdminUsername() { return adminName() }
