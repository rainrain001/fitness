ALTER TABLE "foods" ADD COLUMN "per_amount" real;--> statement-breakpoint
ALTER TABLE "foods" ADD COLUMN "per_unit" text;--> statement-breakpoint
ALTER TABLE "plan_foods" ADD COLUMN "amount" real;