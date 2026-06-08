import { eq } from 'drizzle-orm'

// Retrieve a single profile.
export default defineEventHandler(async (event) => {
  const id = getIdParam(event)

  const user = await db.query.users.findFirst({ where: eq(schema.users.id, id) })

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Profile not found' })
  }

  return user
})
