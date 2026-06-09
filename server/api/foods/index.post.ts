// Save a new food with its macronutrients.
export default defineEventHandler(async (event) => {
  const input = await validateBody(event, foodInput)

  const [food] = await db.insert(schema.foods).values(input).returning()

  setResponseStatus(event, 201)
  return await withPictureUrl(food)
})
