// Upsert a user's expected macronutrient targets — one row per user.
export default defineEventHandler(async (event) => {
  const { idUser, ...macros } = await validateBody(event, macroTargetInput)

  const [targets] = await db
    .insert(schema.macroTargets)
    .values({ idUser, ...macros })
    .onConflictDoUpdate({
      target: schema.macroTargets.idUser,
      set: { ...macros, updatedAt: new Date() }
    })
    .returning()

  return targets
})
