import { eq } from 'drizzle-orm'

// Sign in with email + password. Unverified accounts are rejected so they finish
// the OTP step first.
export default defineEventHandler(async (event) => {
  const { email, password } = await validateBody(event, loginInput)

  const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) })

  if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  if (!user.emailVerified) {
    throw createError({ statusCode: 403, statusMessage: 'Verify your email to continue' })
  }

  return toProfile(user)
})
