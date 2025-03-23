CREATE TYPE "public"."type" AS ENUM('email');--> statement-breakpoint
CREATE TYPE "public"."package_status" AS ENUM('registered', 'received', 'processing', 'manifested', 'in_bag', 'in_transit', 'flying', 'at_customs', 'out_for_delivery', 'delivered', 'returned', 'lost', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('member', 'admin', 'superadmin', 'guest');--> statement-breakpoint
CREATE TABLE "account" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"account_type" "type" DEFAULT 'email' NOT NULL,
	"password" text,
	"salt" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"displayName" text,
	"imageId" text,
	"image" text,
	"bio" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "reset_token" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token" text,
	"token_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reset_token_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" text,
	"email_verified" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verify_email_token" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token" text,
	"token_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "verify_email_token_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reset_token" ADD CONSTRAINT "reset_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verify_email_token" ADD CONSTRAINT "verify_email_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_id_account_type_idx" ON "account" USING btree ("user_id","account_type");--> statement-breakpoint
CREATE INDEX "reset_tokens_token_idx" ON "reset_token" USING btree ("token");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verify_email_tokens_token_idx" ON "verify_email_token" USING btree ("token");