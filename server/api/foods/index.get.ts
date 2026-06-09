import { desc, eq } from 'drizzle-orm'

// List every food in a user's library, newest first. Each food's stored picture
// filename is resolved to a public URL for display.
export default defineEventHandler(async (event) => {
  const idUser = getUserIdQuery(event)

  const foods = await db
    .select()
    .from(schema.foods)
    .where(eq(schema.foods.idUser, idUser))
    .orderBy(desc(schema.foods.createdAt))

  return Promise.all(foods.map(withPictureUrl))
})
