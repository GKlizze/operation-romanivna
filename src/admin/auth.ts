const SESSION_KEY = 'or-admin-session'

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function configuredHash(): string | undefined {
  const h = import.meta.env.VITE_ADMIN_PASSWORD_HASH?.trim().toLowerCase()
  return h && h.length === 64 ? h : undefined
}

export async function verifyPassword(password: string): Promise<boolean> {
  const expected = configuredHash()
  if (!expected) return false
  const actual = await sha256Hex(password)
  return actual === expected
}

export function rememberSession() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    /* ignore */
  }
}

export function hasSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function forgetSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}
