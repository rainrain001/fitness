import { eq } from 'drizzle-orm'
import { useFileStorage } from '~~/server/utils/storage'

// Update a saved food.
export default defineEventHandler(async (event) => {
  const id = getIdParam(event)
  const changes = await validateBody(event, foodUpdate)

  // Grab the current picture so we can clean up the old file if it's replaced.
  const [existing] = await db
    .select({ picture: schema.foods.picture })
    .from(schema.foods)
    .where(eq(schema.foods.id, id))

  const [food] = await db.update(schema.foods).set(changes).where(eq(schema.foods.id, id)).returning()

  if (!food) {
    throw createError({ statusCode: 404, statusMessage: 'Food not found' })
  }

  // Best-effort removal of the orphaned image; don't fail the request on it.
  if ('picture' in changes && existing?.picture && existing.picture !== food.picture) {
    await useFileStorage()
      .remove(existing.picture)
      .catch(() => {})
  }

  return await withPictureUrl(food)
})
