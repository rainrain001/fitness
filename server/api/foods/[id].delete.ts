import { eq } from 'drizzle-orm'

// Remove a food from the library.
export default defineEventHandler(async (event) => {
  const id = getIdParam(event)

  const [food] = await db.delete(schema.foods).where(eq(schema.foods.id, id)).returning()

  if (!food) {
    throw createError({ statusCode: 404, statusMessage: 'Food not found' })
  }

  return { id: food.id }
})
