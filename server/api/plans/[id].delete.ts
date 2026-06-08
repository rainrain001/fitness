import { eq } from 'drizzle-orm'

// Remove a plan (its food links are cascade-deleted).
export default defineEventHandler(async (event) => {
  const id = getIdParam(event)

  const [plan] = await db.delete(schema.plans).where(eq(schema.plans.id, id)).returning()

  if (!plan) {
    throw createError({ statusCode: 404, statusMessage: 'Plan not found' })
  }

  return { id: plan.id }
})
