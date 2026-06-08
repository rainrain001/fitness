import type { H3Event } from 'h3'
import type { ZodType } from 'zod'

// Parse the request body against a Zod schema, returning a clean 400 on failure.
export async function validateBody<T>(event: H3Event, schema: ZodType<T>): Promise<T> {
  const body = await readBody(event)
  const result = schema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message ?? 'Invalid input'
    })
  }

  return result.data
}

// Read a required numeric id from the route params (e.g. /foods/[id]).
export function getIdParam(event: H3Event, name = 'id'): number {
  const value = Number(getRouterParam(event, name))

  if (!Number.isInteger(value) || value <= 0) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${name}` })
  }

  return value
}

// Read a required idUser from the query string (used to scope reads to one portfolio).
export function getUserIdQuery(event: H3Event): number {
  const value = Number(getQuery(event).idUser)

  if (!Number.isInteger(value) || value <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'idUser query parameter is required' })
  }

  return value
}
