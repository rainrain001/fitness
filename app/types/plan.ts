import type { Food } from '~/types/food'

export type PlanPeriod = 'day' | 'week'

// A food within a plan, carrying the amount consumed (in the food's perUnit).
export interface PlanFood extends Food {
  amount: number | null
}

// A day/week food choice with the foods selected for it.
// Mirrors the `plans` table in server/db/schema.ts.
export interface Plan {
  id: number
  idUser: number
  title: string | null
  period: PlanPeriod
  date: string // YYYY-MM-DD
  completed: boolean
  createdAt: string
  foods: PlanFood[]
}
