import { inArray } from 'drizzle-orm'

// Create a plan for a day or week and attach the selected foods (with amounts).
export default defineEventHandler(async (event) => {
  const { idFoods, amounts, ...planData } = await validateBody(event, planInput)

  const [plan] = await db.insert(schema.plans).values(planData).returning()

  let foods: (typeof schema.foods.$inferSelect & { amount: number | null })[] = []
  if (idFoods.length) {
    await db
      .insert(schema.planFoods)
      .values(idFoods.map((idFood) => ({ idPlan: plan.id, idFood, amount: amounts?.[String(idFood)] ?? null })))
    const rows = await db.select().from(schema.foods).where(inArray(schema.foods.id, idFoods))
    foods = rows.map((food) => ({ ...food, amount: amounts?.[String(food.id)] ?? null }))
  }

  setResponseStatus(event, 201)
  return { ...plan, foods }
})
