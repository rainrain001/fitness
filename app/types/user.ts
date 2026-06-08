// A user profile — the root of a personal food-tracking portfolio.
// Mirrors the `users` table in server/db/schema.ts.
export interface UserProfile {
  id: number
  name: string
  age: number | null
  height: number | null // cm
  weight: number | null // kg
  bodyFat: number | null // %
  createdAt: string
}
