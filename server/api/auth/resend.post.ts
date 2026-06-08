import { eq } from 'drizzle-orm'

// Re-issue the OTP for a pending sign-up, replacing any previous code.
export default defineEventHandler(async (event) => {
  const { email } = await validateBody(event, resendInput)

  const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) })

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'No sign-up found for that email' })
  }

  if (user.emailVerified) {
    throw createError({ statusCode: 400, statusMessage: 'That email is already verified' })
  }

  const code = await issueOtp(user.id, email)

  return { email, ...(import.meta.dev ? { devCode: code } : {}) }
})
