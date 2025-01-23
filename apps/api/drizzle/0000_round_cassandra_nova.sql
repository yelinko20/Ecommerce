CREATE TYPE "public"."Gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."Permission" AS ENUM('CREATE', 'READ', 'UPDATE', 'DELETE');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('ADMIN', 'USER', 'GUEST');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" varchar(255) NOT NULL,
	"user_id" uuid,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT 'null'::jsonb
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"permissions" "Permission"[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"token" text NOT NULL,
	"expired_at" timestamp with time zone NOT NULL,
	CONSTRAINT "tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"user_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_super_user" boolean DEFAULT false NOT NULL,
	"phone" varchar(20),
	"gender" "Gender" DEFAULT 'other' NOT NULL,
	"birth_date" timestamp,
	"address" varchar(255),
	"hashed_password" varchar(255),
	"role" "UserRole" DEFAULT 'USER' NOT NULL,
	"role_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"last_login" timestamp with time zone,
	"failed_login_attempts" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "email_index" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "user_name_index" ON "users" USING btree ("user_name");