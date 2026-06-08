import { eq } from 'drizzle-orm'

// Begin sign-up: create an unverified account (or reuse an existing unverified
// one) and issue an OTP to the email. Verification happens on /auth/verify.
export default defineEventHandler(async (event) => {
  const { email, password } = await validateBody(event, signupInput)

  const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) })

  if (existing?.emailVerified) {
    throw createError({ statusCode: 409, statusMessage: 'That email is already registered' })
  }

  const passwordHash = await hashPassword(password)
  let idUser = existing?.id

  if (existing) {
    // Unverified re-signup — refresh the password in case they changed it.
    await db.update(schema.users).set({ passwordHash }).where(eq(schema.users.id, existing.id))
  } else {
    const name = email.split('@')[0] || email
    const [created] = await db.insert(schema.users).values({ name, email, passwordHash }).returning()
    idUser = created.id
  }

  const code = await issueOtp(idUser!, email)

  setResponseStatus(event, 201)
  return { email, ...(import.meta.dev ? { devCode: code } : {}) }
})
