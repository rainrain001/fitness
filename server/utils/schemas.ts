import { z } from 'zod'

// Profile: name plus optional body metrics. Heights in cm, weight in kg, body fat in %.
export const userInput = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().int().min(0).max(150).nullable().optional(),
  height: z.number().min(0).max(300).nullable().optional(),
  weight: z.number().min(0).max(700).nullable().optional(),
  bodyFat: z.number().min(0).max(100).nullable().optional()
})

export const userUpdate = userInput.partial()

export const perUnits = ['grams', 'ml', 'serving', 'lbs'] as const

// A food and its macros. Calories in kcal, protein/carbs/fat/sugar in grams.
// perAmount/perUnit are optional: when set, the macros are measured "per" that
// amount (e.g. per 100 grams) and computations scale by the amount consumed.
export const foodInput = z.object({
  idUser: z.number().int().positive(),
  name: z.string().min(1, 'Name is required'),
  picture: z.string().nullable().optional(),
  calories: z.number().min(0).default(0),
  protein: z.number().min(0).default(0),
  carbs: z.number().min(0).default(0),
  fat: z.number().min(0).default(0),
  sugar: z.number().min(0).default(0),
  perAmount: z.number().positive().nullable().optional(),
  perUnit: z.enum(perUnits).nullable().optional()
})

export const foodUpdate = foodInput.omit({ idUser: true }).partial()

// A plan groups selected foods for a day or week. `amounts` optionally maps a
// food id (as string key) to the amount consumed, used to scale "per" foods.
const planAmounts = z.record(z.string(), z.number().positive())

export const planInput = z.object({
  idUser: z.number().int().positive(),
  title: z.string().nullable().optional(),
  period: z.enum(['day', 'week']).default('day'),
  date: z.string().min(1, 'Date is required'),
  idFoods: z.array(z.number().int().positive()).default([]),
  amounts: planAmounts.optional()
})

export const planUpdate = z.object({
  title: z.string().nullable().optional(),
  period: z.enum(['day', 'week']).optional(),
  date: z.string().min(1).optional(),
  completed: z.boolean().optional(),
  idFoods: z.array(z.number().int().positive()).optional(),
  amounts: planAmounts.optional()
})
