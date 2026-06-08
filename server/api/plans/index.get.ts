import { desc, eq } from 'drizzle-orm'

// List a user's day/week plans with the foods chosen for each, newest first.
export default defineEventHandler(async (event) => {
  const idUser = getUserIdQuery(event)

  const rows = await db.query.plans.findMany({
    where: eq(schema.plans.idUser, idUser),
    orderBy: [desc(schema.plans.date), desc(schema.plans.createdAt)],
    with: { planFoods: { with: { food: true } } }
  })

  return rows.map(({ planFoods, ...plan }) => ({
    ...plan,
    foods: planFoods.map((pf) => ({ ...pf.food, amount: pf.amount }))
  }))
})
