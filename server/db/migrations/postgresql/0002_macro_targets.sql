CREATE TABLE "macro_targets" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_user" integer NOT NULL,
	"calories" real,
	"protein" real,
	"carbs" real,
	"fat" real,
	"sugar" real,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "macro_targets_id_user_unique" UNIQUE("id_user")
);
--> statement-breakpoint
ALTER TABLE "macro_targets" ADD CONSTRAINT "macro_targets_id_user_users_id_fk" FOREIGN KEY ("id_user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;