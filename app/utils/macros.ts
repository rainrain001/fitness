import type { Food, MacroTotals } from '~/types/food'

type MacroSource = Pick<MacroTotals, keyof MacroTotals>

// Scale a food's macros to the amount consumed. If the food has no "per" basis
// (or no amount is given), the macros are returned unchanged.
export function scaleFood(food: Food, amount?: number | null): MacroTotals {
  const factor = food.perAmount && food.perAmount > 0 && amount != null ? amount / food.perAmount : 1
  return {
    calories: food.calories * factor,
    protein: food.protein * factor,
    carbs: food.carbs * factor,
    fat: food.fat * factor,
    sugar: food.sugar * factor
  }
}

// Sum the macronutrients across a list of foods (or anything macro-shaped).
export function sumMacros(items: MacroSource[]): MacroTotals {
  return items.reduce<MacroTotals>(
    (totals, item) => ({
      calories: totals.calories + item.calories,
      protein: totals.protein + item.protein,
      carbs: totals.carbs + item.carbs,
      fat: totals.fat + item.fat,
      sugar: totals.sugar + item.sugar
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 }
  )
}

// Round to at most one decimal place for display.
export function round(value: number): number {
  return Math.round(value * 10) / 10
}
