import { desc, eq } from 'drizzle-orm'

// List every food in a user's library, newest first.
export default defineEventHandler(async (event) => {
  const idUser = getUserIdQuery(event)

  return db.select().from(schema.foods).where(eq(schema.foods.idUser, idUser)).orderBy(desc(schema.foods.createdAt))
})
