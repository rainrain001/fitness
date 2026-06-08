import { eq } from 'drizzle-orm'

// Update a profile (name, age, height, weight, body fat).
export default defineEventHandler(async (event) => {
  const id = getIdParam(event)
  const changes = await validateBody(event, userUpdate)

  const [user] = await db.update(schema.users).set(changes).where(eq(schema.users.id, id)).returning()

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Profile not found' })
  }

  return user
})
