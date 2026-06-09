import { eq } from 'drizzle-orm'
import { useFileStorage } from '~~/server/utils/storage'

// Remove a food from the library, along with its stored picture.
export default defineEventHandler(async (event) => {
  const id = getIdParam(event)

  const [food] = await db.delete(schema.foods).where(eq(schema.foods.id, id)).returning()

  if (!food) {
    throw createError({ statusCode: 404, statusMessage: 'Food not found' })
  }

  // Best-effort: a failed cleanup shouldn't fail the delete.
  if (food.picture) {
    await useFileStorage()
      .remove(food.picture)
      .catch(() => {})
  }

  return { id: food.id }
})
