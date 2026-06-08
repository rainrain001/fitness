import { eq } from 'drizzle-orm'

// Retrieve a user's expected macronutrient targets. Returns null when unset.
export default defineEventHandler(async (event) => {
  const idUser = getUserIdQuery(event)

  const targets = await db.query.macroTargets.findFirst({
    where: eq(schema.macroTargets.idUser, idUser)
  })

  return targets ?? null
})
