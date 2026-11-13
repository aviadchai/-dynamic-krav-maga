// Signed role sessions verified in both Node.js routes and the Edge proxy.
export type AdminRole = 'admin' | 'editor'

function secret() {
  // This must be independent from user passwords to prevent offline guessing.
  const value = process.env.SESSION_SECRET
  if (!value || value.length < 32) throw new Error('A strong SESSION_SECRET must be configured')
  return value
}

async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return Array.from(new Uint8Array(signature), b => b.toString(16).padStart(2, '0')).join('')
}

export async function createAdminSession(role: AdminRole): Promise<string> {
  const payload = btoa(JSON.stringify({ role, exp: Date.now() + 86400_000 }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  return payload + '.' + await sign(payload)
}

export async function readAdminSession(cookie?: string): Promise<AdminRole | null> {
  if (!cookie) return null
  const parts = cookie.split('.')
  if (parts.length !== 2 || !/^[a-f0-9]{64}$/.test(parts[1])) return null
  try {
    const expected = await sign(parts[0])
    let diff = 0
    for (let i = 0; i < 64; i++) diff |= expected.charCodeAt(i) ^ parts[1].charCodeAt(i)
    if (diff !== 0) return null
    const normalized = parts[0].replace(/-/g, '+').replace(/_/g, '/')
    const data = JSON.parse(atob(normalized)) as { role?: string; exp?: number }
    if (typeof data.exp !== 'number' || data.exp <= Date.now()) return null
    return data.role === 'admin' || data.role === 'editor' ? data.role : null
  } catch {
    return null
  }
}
