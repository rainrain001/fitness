// The unit a food's "per" amount is measured in.
export type PerUnit = 'grams' | 'ml' | 'serving' | 'lbs'

// A saved food and its macronutrients.
// Mirrors the `foods` table in server/db/schema.ts.
export interface Food {
  id: number
  idUser: number
  name: string
  picture: string | null // stored filename in the bucket
  pictureUrl: string | null // public URL for display, resolved by the server
  calories: number // kcal
  protein: number // g
  carbs: number // g
  fat: number // g
  sugar: number // g
  // When set, the macros above are measured per `perAmount` `perUnit`.
  perAmount: number | null
  perUnit: PerUnit | null
  createdAt: string
}

// Aggregated macronutrients across a selection of foods.
export interface MacroTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
}
