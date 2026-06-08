import { eq } from 'drizzle-orm'

// Complete sign-up: check the OTP, mark the email verified, and return the
// signed-in profile. The verification challenge is consumed on success.
export default defineEventHandler(async (event) => {
  const { email, code } = await validateBody(event, verifyInput)

  const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) })

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'No sign-up found for that email' })
  }

  if (user.emailVerified) {
    return toProfile(user)
  }

  const challenge = await db.query.emailVerifications.findFirst({
    where: eq(schema.emailVerifications.idUser, user.id)
  })

  if (!challenge) {
    throw createError({ statusCode: 400, statusMessage: 'No active code — request a new one' })
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    throw createError({ statusCode: 400, statusMessage: 'That code has expired — request a new one' })
  }

  if (challenge.code !== code) {
    throw createError({ statusCode: 400, statusMessage: 'Incorrect code' })
  }

  const [verified] = await db
    .update(schema.users)
    .set({ emailVerified: true })
    .where(eq(schema.users.id, user.id))
    .returning()

  await db.delete(schema.emailVerifications).where(eq(schema.emailVerifications.idUser, user.id))

  return toProfile(verified)
})
