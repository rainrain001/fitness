// A user profile — the root of a personal food-tracking portfolio.
// Mirrors the `users` table in server/db/schema.ts.
export interface UserProfile {
  id: number
  name: string
  email: string | null
  emailVerified: boolean
  age: number | null
  height: number | null // cm
  weight: number | null // kg
  bodyFat: number | null // %
  createdAt: string
}

// A user's expected daily macronutrient targets.
// Mirrors the `macro_targets` table in server/db/schema.ts.
export interface MacroTargets {
  id: number
  idUser: number
  calories: number | null // kcal
  protein: number | null // g
  carbs: number | null // g
  fat: number | null // g
  sugar: number | null // g
  createdAt: string
  updatedAt: string
}
