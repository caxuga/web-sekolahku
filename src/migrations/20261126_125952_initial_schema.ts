import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "web_sekolahku"."enum_users_role" AS ENUM('super-admin', 'admin-sekolah', 'kepala-sekolah', 'editor', 'guru');
  CREATE TYPE "web_sekolahku"."enum_takwim_status" AS ENUM('draft', 'review', 'published', 'rejected');
  CREATE TYPE "web_sekolahku"."enum_siaran_status" AS ENUM('draft', 'review', 'published', 'rejected');
  CREATE TYPE "web_sekolahku"."enum_categories_colors" AS ENUM('#10B981', '#2563EB', '#D69E36');
  CREATE TABLE "web_sekolahku"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "web_sekolahku"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "web_sekolahku"."enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "web_sekolahku"."media" (
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
  
  CREATE TABLE "web_sekolahku"."articles_media" (
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
  
  CREATE TABLE "web_sekolahku"."takwim" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"excerpt" varchar,
  	"image_id" integer,
  	"article_date" timestamp(3) with time zone NOT NULL,
  	"content" jsonb,
  	"category_id" integer,
  	"status" "web_sekolahku"."enum_takwim_status" DEFAULT 'draft' NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "web_sekolahku"."siaran" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"excerpt" varchar,
  	"image_id" integer,
  	"article_date" timestamp(3) with time zone NOT NULL,
  	"content" jsonb NOT NULL,
  	"category_id" integer,
  	"status" "web_sekolahku"."enum_siaran_status" DEFAULT 'draft' NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "web_sekolahku"."categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"colors" "web_sekolahku"."enum_categories_colors" DEFAULT '#2563EB',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "web_sekolahku"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "web_sekolahku"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "web_sekolahku"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"articles_media_id" integer,
  	"takwim_id" integer,
  	"siaran_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "web_sekolahku"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "web_sekolahku"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "web_sekolahku"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "web_sekolahku"."school_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"school_name" varchar DEFAULT 'Nama Sekolah' NOT NULL,
  	"tagline" varchar DEFAULT 'Membangun generasi berkarakter dan berprestasi',
  	"hero_title" varchar DEFAULT 'Selamat Datang di Website Resmi Sekolah',
  	"hero_description" varchar DEFAULT 'Informasi, berita, dan kegiatan terbaru sekolah.',
  	"logo_id" integer,
  	"address" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"footer_text" varchar DEFAULT 'Website resmi sekolah',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "web_sekolahku"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "web_sekolahku"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "web_sekolahku"."takwim" ADD CONSTRAINT "takwim_image_id_articles_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "web_sekolahku"."articles_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "web_sekolahku"."takwim" ADD CONSTRAINT "takwim_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "web_sekolahku"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "web_sekolahku"."takwim" ADD CONSTRAINT "takwim_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "web_sekolahku"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "web_sekolahku"."siaran" ADD CONSTRAINT "siaran_image_id_articles_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "web_sekolahku"."articles_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "web_sekolahku"."siaran" ADD CONSTRAINT "siaran_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "web_sekolahku"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "web_sekolahku"."siaran" ADD CONSTRAINT "siaran_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "web_sekolahku"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "web_sekolahku"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "web_sekolahku"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "web_sekolahku"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "web_sekolahku"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "web_sekolahku"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "web_sekolahku"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "web_sekolahku"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_media_fk" FOREIGN KEY ("articles_media_id") REFERENCES "web_sekolahku"."articles_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "web_sekolahku"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_takwim_fk" FOREIGN KEY ("takwim_id") REFERENCES "web_sekolahku"."takwim"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "web_sekolahku"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_siaran_fk" FOREIGN KEY ("siaran_id") REFERENCES "web_sekolahku"."siaran"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "web_sekolahku"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "web_sekolahku"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "web_sekolahku"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "web_sekolahku"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "web_sekolahku"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "web_sekolahku"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "web_sekolahku"."school_settings" ADD CONSTRAINT "school_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "web_sekolahku"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "web_sekolahku"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "web_sekolahku"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "web_sekolahku"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "web_sekolahku"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "web_sekolahku"."users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "web_sekolahku"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "web_sekolahku"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "web_sekolahku"."media" USING btree ("filename");
  CREATE INDEX "articles_media_updated_at_idx" ON "web_sekolahku"."articles_media" USING btree ("updated_at");
  CREATE INDEX "articles_media_created_at_idx" ON "web_sekolahku"."articles_media" USING btree ("created_at");
  CREATE UNIQUE INDEX "articles_media_filename_idx" ON "web_sekolahku"."articles_media" USING btree ("filename");
  CREATE UNIQUE INDEX "takwim_slug_idx" ON "web_sekolahku"."takwim" USING btree ("slug");
  CREATE INDEX "takwim_image_idx" ON "web_sekolahku"."takwim" USING btree ("image_id");
  CREATE INDEX "takwim_category_idx" ON "web_sekolahku"."takwim" USING btree ("category_id");
  CREATE INDEX "takwim_created_by_idx" ON "web_sekolahku"."takwim" USING btree ("created_by_id");
  CREATE INDEX "takwim_updated_at_idx" ON "web_sekolahku"."takwim" USING btree ("updated_at");
  CREATE INDEX "takwim_created_at_idx" ON "web_sekolahku"."takwim" USING btree ("created_at");
  CREATE UNIQUE INDEX "siaran_slug_idx" ON "web_sekolahku"."siaran" USING btree ("slug");
  CREATE INDEX "siaran_image_idx" ON "web_sekolahku"."siaran" USING btree ("image_id");
  CREATE INDEX "siaran_category_idx" ON "web_sekolahku"."siaran" USING btree ("category_id");
  CREATE INDEX "siaran_created_by_idx" ON "web_sekolahku"."siaran" USING btree ("created_by_id");
  CREATE INDEX "siaran_updated_at_idx" ON "web_sekolahku"."siaran" USING btree ("updated_at");
  CREATE INDEX "siaran_created_at_idx" ON "web_sekolahku"."siaran" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_name_idx" ON "web_sekolahku"."categories" USING btree ("name");
  CREATE UNIQUE INDEX "categories_value_idx" ON "web_sekolahku"."categories" USING btree ("value");
  CREATE INDEX "categories_updated_at_idx" ON "web_sekolahku"."categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "web_sekolahku"."categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "web_sekolahku"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "web_sekolahku"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "web_sekolahku"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "web_sekolahku"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "web_sekolahku"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "web_sekolahku"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "web_sekolahku"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "web_sekolahku"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "web_sekolahku"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_articles_media_id_idx" ON "web_sekolahku"."payload_locked_documents_rels" USING btree ("articles_media_id");
  CREATE INDEX "payload_locked_documents_rels_takwim_id_idx" ON "web_sekolahku"."payload_locked_documents_rels" USING btree ("takwim_id");
  CREATE INDEX "payload_locked_documents_rels_siaran_id_idx" ON "web_sekolahku"."payload_locked_documents_rels" USING btree ("siaran_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "web_sekolahku"."payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_preferences_key_idx" ON "web_sekolahku"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "web_sekolahku"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "web_sekolahku"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "web_sekolahku"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "web_sekolahku"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "web_sekolahku"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "web_sekolahku"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "web_sekolahku"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "web_sekolahku"."payload_migrations" USING btree ("created_at");
  CREATE INDEX "school_settings_logo_idx" ON "web_sekolahku"."school_settings" USING btree ("logo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "web_sekolahku"."users_sessions" CASCADE;
  DROP TABLE "web_sekolahku"."users" CASCADE;
  DROP TABLE "web_sekolahku"."media" CASCADE;
  DROP TABLE "web_sekolahku"."articles_media" CASCADE;
  DROP TABLE "web_sekolahku"."takwim" CASCADE;
  DROP TABLE "web_sekolahku"."siaran" CASCADE;
  DROP TABLE "web_sekolahku"."categories" CASCADE;
  DROP TABLE "web_sekolahku"."payload_kv" CASCADE;
  DROP TABLE "web_sekolahku"."payload_locked_documents" CASCADE;
  DROP TABLE "web_sekolahku"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "web_sekolahku"."payload_preferences" CASCADE;
  DROP TABLE "web_sekolahku"."payload_preferences_rels" CASCADE;
  DROP TABLE "web_sekolahku"."payload_migrations" CASCADE;
  DROP TABLE "web_sekolahku"."school_settings" CASCADE;
  DROP TYPE "web_sekolahku"."enum_users_role";
  DROP TYPE "web_sekolahku"."enum_takwim_status";
  DROP TYPE "web_sekolahku"."enum_siaran_status";
  DROP TYPE "web_sekolahku"."enum_categories_colors";`)
}
