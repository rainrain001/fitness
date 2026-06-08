import { randomBytes, randomInt, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

// How long a freshly issued OTP stays valid.
export const OTP_TTL_MS = 10 * 60 * 1000

// Hash a password with scrypt and a per-password random salt. The salt is stored
// alongside the digest as `salt:digest` so verification is self-contained.
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derived = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt}:${derived.toString('hex')}`
}

// Constant-time comparison of a candidate password against a stored `salt:digest`.
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, digest] = stored.split(':')
  if (!salt || !digest) return false

  const derived = (await scryptAsync(password, salt, 64)) as Buffer
  const expected = Buffer.from(digest, 'hex')
  return expected.length === derived.length && timingSafeEqual(expected, derived)
}

// A 6-digit numeric verification code, e.g. "042918".
export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0')
}

// Issue (or replace) the pending OTP for a user and email it (see sendOtpEmail,
// which falls back to logging when SMTP isn't configured). The code is also
// returned so callers can expose it as `devCode` in dev for end-to-end testing.
export async function issueOtp(idUser: number, email: string): Promise<string> {
  const code = generateOtp()
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)

  await db
    .insert(schema.emailVerifications)
    .values({ idUser, code, expiresAt })
    .onConflictDoUpdate({
      target: schema.emailVerifications.idUser,
      set: { code, expiresAt, createdAt: new Date() }
    })

  await sendOtpEmail(email, code)
  return code
}

// The user shape safe to return to the client — never leak the password hash.
export function toProfile<T extends { passwordHash?: string | null }>(user: T): Omit<T, 'passwordHash'> {
  const { passwordHash: _passwordHash, ...profile } = user
  return profile
}
