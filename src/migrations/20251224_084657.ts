import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'user');
  CREATE TYPE "public"."enum_lottery_draws_round" AS ENUM('morning', 'afternoon', 'evening');
  CREATE TYPE "public"."enum_lottery_draws_status" AS ENUM('pending', 'completed', 'cancelled');
  CREATE TYPE "public"."enum_lottery_tickets_numbers_bet_type" AS ENUM('straight', 'running', 'tod');
  CREATE TYPE "public"."enum_lottery_tickets_status" AS ENUM('pending', 'won', 'lost', 'cancelled');
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "lottery_draws" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"draw_number" varchar NOT NULL,
  	"draw_date" timestamp(3) with time zone NOT NULL,
  	"round" "enum_lottery_draws_round" DEFAULT 'morning' NOT NULL,
  	"status" "enum_lottery_draws_status" DEFAULT 'pending' NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "lottery_tickets_numbers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL,
  	"bet_type" "enum_lottery_tickets_numbers_bet_type" NOT NULL
  );
  
  CREATE TABLE "lottery_tickets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"ticket_number" varchar NOT NULL,
  	"user_id" integer NOT NULL,
  	"draw_id" integer NOT NULL,
  	"amount" numeric NOT NULL,
  	"status" "enum_lottery_tickets_status" DEFAULT 'pending' NOT NULL,
  	"prize_amount" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "lottery_results_second_prize" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL
  );
  
  CREATE TABLE "lottery_results_third_prize" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL
  );
  
  CREATE TABLE "lottery_results_fourth_prize" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL
  );
  
  CREATE TABLE "lottery_results_fifth_prize" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL
  );
  
  CREATE TABLE "lottery_results_front_three_digits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL
  );
  
  CREATE TABLE "lottery_results_back_three_digits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL
  );
  
  CREATE TABLE "lottery_results_front_two_digits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL
  );
  
  CREATE TABLE "lottery_results_back_two_digits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL
  );
  
  CREATE TABLE "lottery_results" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"draw_id" integer NOT NULL,
  	"first_prize" varchar NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"lottery_draws_id" integer,
  	"lottery_tickets_id" integer,
  	"lottery_results_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lottery_tickets_numbers" ADD CONSTRAINT "lottery_tickets_numbers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lottery_tickets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lottery_tickets" ADD CONSTRAINT "lottery_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lottery_tickets" ADD CONSTRAINT "lottery_tickets_draw_id_lottery_draws_id_fk" FOREIGN KEY ("draw_id") REFERENCES "public"."lottery_draws"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lottery_results_second_prize" ADD CONSTRAINT "lottery_results_second_prize_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lottery_results"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lottery_results_third_prize" ADD CONSTRAINT "lottery_results_third_prize_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lottery_results"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lottery_results_fourth_prize" ADD CONSTRAINT "lottery_results_fourth_prize_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lottery_results"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lottery_results_fifth_prize" ADD CONSTRAINT "lottery_results_fifth_prize_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lottery_results"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lottery_results_front_three_digits" ADD CONSTRAINT "lottery_results_front_three_digits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lottery_results"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lottery_results_back_three_digits" ADD CONSTRAINT "lottery_results_back_three_digits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lottery_results"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lottery_results_front_two_digits" ADD CONSTRAINT "lottery_results_front_two_digits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lottery_results"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lottery_results_back_two_digits" ADD CONSTRAINT "lottery_results_back_two_digits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lottery_results"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lottery_results" ADD CONSTRAINT "lottery_results_draw_id_lottery_draws_id_fk" FOREIGN KEY ("draw_id") REFERENCES "public"."lottery_draws"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lottery_draws_fk" FOREIGN KEY ("lottery_draws_id") REFERENCES "public"."lottery_draws"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lottery_tickets_fk" FOREIGN KEY ("lottery_tickets_id") REFERENCES "public"."lottery_tickets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lottery_results_fk" FOREIGN KEY ("lottery_results_id") REFERENCES "public"."lottery_results"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "lottery_draws_draw_number_idx" ON "lottery_draws" USING btree ("draw_number");
  CREATE INDEX "lottery_draws_draw_date_idx" ON "lottery_draws" USING btree ("draw_date");
  CREATE INDEX "lottery_draws_updated_at_idx" ON "lottery_draws" USING btree ("updated_at");
  CREATE INDEX "lottery_draws_created_at_idx" ON "lottery_draws" USING btree ("created_at");
  CREATE INDEX "lottery_tickets_numbers_order_idx" ON "lottery_tickets_numbers" USING btree ("_order");
  CREATE INDEX "lottery_tickets_numbers_parent_id_idx" ON "lottery_tickets_numbers" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "lottery_tickets_ticket_number_idx" ON "lottery_tickets" USING btree ("ticket_number");
  CREATE INDEX "lottery_tickets_user_idx" ON "lottery_tickets" USING btree ("user_id");
  CREATE INDEX "lottery_tickets_draw_idx" ON "lottery_tickets" USING btree ("draw_id");
  CREATE INDEX "lottery_tickets_updated_at_idx" ON "lottery_tickets" USING btree ("updated_at");
  CREATE INDEX "lottery_tickets_created_at_idx" ON "lottery_tickets" USING btree ("created_at");
  CREATE INDEX "lottery_results_second_prize_order_idx" ON "lottery_results_second_prize" USING btree ("_order");
  CREATE INDEX "lottery_results_second_prize_parent_id_idx" ON "lottery_results_second_prize" USING btree ("_parent_id");
  CREATE INDEX "lottery_results_third_prize_order_idx" ON "lottery_results_third_prize" USING btree ("_order");
  CREATE INDEX "lottery_results_third_prize_parent_id_idx" ON "lottery_results_third_prize" USING btree ("_parent_id");
  CREATE INDEX "lottery_results_fourth_prize_order_idx" ON "lottery_results_fourth_prize" USING btree ("_order");
  CREATE INDEX "lottery_results_fourth_prize_parent_id_idx" ON "lottery_results_fourth_prize" USING btree ("_parent_id");
  CREATE INDEX "lottery_results_fifth_prize_order_idx" ON "lottery_results_fifth_prize" USING btree ("_order");
  CREATE INDEX "lottery_results_fifth_prize_parent_id_idx" ON "lottery_results_fifth_prize" USING btree ("_parent_id");
  CREATE INDEX "lottery_results_front_three_digits_order_idx" ON "lottery_results_front_three_digits" USING btree ("_order");
  CREATE INDEX "lottery_results_front_three_digits_parent_id_idx" ON "lottery_results_front_three_digits" USING btree ("_parent_id");
  CREATE INDEX "lottery_results_back_three_digits_order_idx" ON "lottery_results_back_three_digits" USING btree ("_order");
  CREATE INDEX "lottery_results_back_three_digits_parent_id_idx" ON "lottery_results_back_three_digits" USING btree ("_parent_id");
  CREATE INDEX "lottery_results_front_two_digits_order_idx" ON "lottery_results_front_two_digits" USING btree ("_order");
  CREATE INDEX "lottery_results_front_two_digits_parent_id_idx" ON "lottery_results_front_two_digits" USING btree ("_parent_id");
  CREATE INDEX "lottery_results_back_two_digits_order_idx" ON "lottery_results_back_two_digits" USING btree ("_order");
  CREATE INDEX "lottery_results_back_two_digits_parent_id_idx" ON "lottery_results_back_two_digits" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "lottery_results_draw_idx" ON "lottery_results" USING btree ("draw_id");
  CREATE INDEX "lottery_results_updated_at_idx" ON "lottery_results" USING btree ("updated_at");
  CREATE INDEX "lottery_results_created_at_idx" ON "lottery_results" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_lottery_draws_id_idx" ON "payload_locked_documents_rels" USING btree ("lottery_draws_id");
  CREATE INDEX "payload_locked_documents_rels_lottery_tickets_id_idx" ON "payload_locked_documents_rels" USING btree ("lottery_tickets_id");
  CREATE INDEX "payload_locked_documents_rels_lottery_results_id_idx" ON "payload_locked_documents_rels" USING btree ("lottery_results_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "lottery_draws" CASCADE;
  DROP TABLE "lottery_tickets_numbers" CASCADE;
  DROP TABLE "lottery_tickets" CASCADE;
  DROP TABLE "lottery_results_second_prize" CASCADE;
  DROP TABLE "lottery_results_third_prize" CASCADE;
  DROP TABLE "lottery_results_fourth_prize" CASCADE;
  DROP TABLE "lottery_results_fifth_prize" CASCADE;
  DROP TABLE "lottery_results_front_three_digits" CASCADE;
  DROP TABLE "lottery_results_back_three_digits" CASCADE;
  DROP TABLE "lottery_results_front_two_digits" CASCADE;
  DROP TABLE "lottery_results_back_two_digits" CASCADE;
  DROP TABLE "lottery_results" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_lottery_draws_round";
  DROP TYPE "public"."enum_lottery_draws_status";
  DROP TYPE "public"."enum_lottery_tickets_numbers_bet_type";
  DROP TYPE "public"."enum_lottery_tickets_status";`)
}
