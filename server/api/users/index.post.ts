// Create a profile. Each profile is the root of its own food-tracking portfolio.
export default defineEventHandler(async (event) => {
  const input = await validateBody(event, userInput)

  const [user] = await db.insert(schema.users).values(input).returning()

  setResponseStatus(event, 201)
  return user
})
