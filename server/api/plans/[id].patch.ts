import { eq } from 'drizzle-orm'

// Update a plan: edit its details, toggle "Completed", or replace its foods.
export default defineEventHandler(async (event) => {
  const id = getIdParam(event)
  const { idFoods, amounts, ...changes } = await validateBody(event, planUpdate)

  if (Object.keys(changes).length) {
    await db.update(schema.plans).set(changes).where(eq(schema.plans.id, id))
  }

  if (idFoods) {
    await db.delete(schema.planFoods).where(eq(schema.planFoods.idPlan, id))
    if (idFoods.length) {
      await db
        .insert(schema.planFoods)
        .values(idFoods.map((idFood) => ({ idPlan: id, idFood, amount: amounts?.[String(idFood)] ?? null })))
    }
  }

  const plan = await db.query.plans.findFirst({
    where: eq(schema.plans.id, id),
    with: { planFoods: { with: { food: true } } }
  })

  if (!plan) {
    throw createError({ statusCode: 404, statusMessage: 'Plan not found' })
  }

  const { planFoods, ...rest } = plan
  return { ...rest, foods: planFoods.map((pf) => ({ ...pf.food, amount: pf.amount })) }
})
