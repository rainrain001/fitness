import { eq } from 'drizzle-orm'

// Update a saved food.
export default defineEventHandler(async (event) => {
  const id = getIdParam(event)
  const changes = await validateBody(event, foodUpdate)

  const [food] = await db.update(schema.foods).set(changes).where(eq(schema.foods.id, id)).returning()

  if (!food) {
    throw createError({ statusCode: 404, statusMessage: 'Food not found' })
  }

  return food
})
