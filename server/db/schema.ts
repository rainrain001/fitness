import { relations } from 'drizzle-orm'
import { boolean, date, integer, pgTable, real, serial, text, timestamp } from 'drizzle-orm/pg-core'

// A user owns their whole portfolio: profile, food library and daily/weekly plans.
// Authentication lives here too: email + hashed password, gated by OTP email
// verification (see emailVerifications). email is nullable so pre-auth profiles
// created before sign-up existed still validate.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique(),
  passwordHash: text('password_hash'),
  emailVerified: boolean('email_verified').notNull().default(false),
  age: integer('age'),
  height: real('height'), // cm
  weight: real('weight'), // kg
  bodyFat: real('body_fat'), // %
  createdAt: timestamp('created_at').notNull().defaultNow()
})

// A pending email-verification challenge — one active OTP per user, replaced on
// resend and deleted once the email is verified.
export const emailVerifications = pgTable('email_verifications', {
  id: serial('id').primaryKey(),
  idUser: integer('id_user')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

// A user's expected daily macronutrient targets — one row per user, compared
// against a plan's totals. Each macro is optional (null = no target set).
export const macroTargets = pgTable('macro_targets', {
  id: serial('id').primaryKey(),
  idUser: integer('id_user')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  calories: real('calories'), // kcal
  protein: real('protein'), // g
  carbs: real('carbs'), // g
  fat: real('fat'), // g
  sugar: real('sugar'), // g
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// A saved food and its macronutrients. Calories in kcal, everything else in grams.
export const foods = pgTable('foods', {
  id: serial('id').primaryKey(),
  idUser: integer('id_user')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  picture: text('picture'), // data URL or remote URL
  calories: real('calories').notNull().default(0), // kcal
  protein: real('protein').notNull().default(0), // g
  carbs: real('carbs').notNull().default(0), // g
  fat: real('fat').notNull().default(0), // g
  sugar: real('sugar').notNull().default(0), // g
  // Optional basis the macros are measured against, e.g. "per 100 grams".
  // When set, computations scale by the amount actually consumed.
  perAmount: real('per_amount'),
  perUnit: text('per_unit'), // 'grams' | 'serving' | 'lbs'
  createdAt: timestamp('created_at').notNull().defaultNow()
})

// A food choice for a given day or week, marked completed once achieved.
export const plans = pgTable('plans', {
  id: serial('id').primaryKey(),
  idUser: integer('id_user')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title'),
  period: text('period').notNull().default('day'), // 'day' | 'week'
  date: date('date').notNull(), // the day, or the week's start date
  completed: boolean('completed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

// Join table: the foods selected for a plan.
export const planFoods = pgTable('plan_foods', {
  id: serial('id').primaryKey(),
  idPlan: integer('id_plan')
    .notNull()
    .references(() => plans.id, { onDelete: 'cascade' }),
  idFood: integer('id_food')
    .notNull()
    .references(() => foods.id, { onDelete: 'cascade' }),
  // Amount consumed for this plan, in the food's perUnit. Null = use the food as-is.
  amount: real('amount')
})

export const usersRelations = relations(users, ({ one, many }) => ({
  foods: many(foods),
  plans: many(plans),
  macroTargets: one(macroTargets, { fields: [users.id], references: [macroTargets.idUser] }),
  emailVerification: one(emailVerifications, { fields: [users.id], references: [emailVerifications.idUser] })
}))

export const emailVerificationsRelations = relations(emailVerifications, ({ one }) => ({
  user: one(users, { fields: [emailVerifications.idUser], references: [users.id] })
}))

export const macroTargetsRelations = relations(macroTargets, ({ one }) => ({
  user: one(users, { fields: [macroTargets.idUser], references: [users.id] })
}))

export const foodsRelations = relations(foods, ({ one, many }) => ({
  user: one(users, { fields: [foods.idUser], references: [users.id] }),
  planFoods: many(planFoods)
}))

export const plansRelations = relations(plans, ({ one, many }) => ({
  user: one(users, { fields: [plans.idUser], references: [users.id] }),
  planFoods: many(planFoods)
}))

export const planFoodsRelations = relations(planFoods, ({ one }) => ({
  plan: one(plans, { fields: [planFoods.idPlan], references: [plans.id] }),
  food: one(foods, { fields: [planFoods.idFood], references: [foods.id] })
}))
