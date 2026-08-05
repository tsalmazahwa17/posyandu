-- ============================================================================
-- POSYANDU ASTER — FULL DATABASE REFERENCE FOR A FRESH SUPABASE PROJECT
-- ============================================================================
-- Gabungan migration berurutan: enum, tabel, kolom, indeks, foreign key,
-- security/RLS, distributed rate limit, dan trigger Supabase Realtime.
--
-- REKOMENDASI UTAMA:
--   npm run supabase:bootstrap
--
-- File ini untuk audit atau instalasi manual pada project Supabase yang benar-
-- benar kosong. Jangan jalankan setelah `prisma migrate deploy` pada database
-- yang sama karena history migration dan objek database dapat tidak sinkron.
-- ============================================================================


-- ============================================================================
-- SOURCE: prisma/migrations/20260717004328_init_database/migration.sql
-- ============================================================================
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "AttendanceMethod" AS ENUM ('QR', 'MANUAL');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('HADIR', 'TIDAK_HADIR');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('PHOTO', 'VIDEO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archive_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "archive_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitors" (
    "id" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "nik" VARCHAR(20),
    "full_name" VARCHAR(100) NOT NULL,
    "gender" "Gender" NOT NULL,
    "birth_place" VARCHAR(100),
    "birth_date" DATE NOT NULL,
    "phone" VARCHAR(20),
    "address" TEXT,
    "qr_code" VARCHAR(255),
    "photo" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring_balita" (
    "id" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "recorded_by" TEXT NOT NULL,
    "examination_date" DATE NOT NULL,
    "month_number" INTEGER NOT NULL,
    "age_month" INTEGER NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL,
    "height" DECIMAL(5,2) NOT NULL,
    "head_circumference" DECIMAL(5,2),
    "nutritional_status" VARCHAR(30),
    "immunization" VARCHAR(100),
    "vitamin" VARCHAR(50),
    "kpsp_result" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monitoring_balita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring_ibu_hamil" (
    "id" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "recorded_by" TEXT NOT NULL,
    "examination_date" DATE NOT NULL,
    "gestational_age" INTEGER,
    "weight" DECIMAL(5,2),
    "systolic_bp" INTEGER,
    "diastolic_bp" INTEGER,
    "hb" DECIMAL(4,2),
    "lila" DECIMAL(5,2),
    "hpht" DATE,
    "hpl" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monitoring_ibu_hamil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring_remaja" (
    "id" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "recorded_by" TEXT NOT NULL,
    "examination_date" DATE NOT NULL,
    "weight" DECIMAL(5,2),
    "height" DECIMAL(5,2),
    "arm_circumference" DECIMAL(5,2),
    "hb" DECIMAL(4,2),
    "anemia_status" VARCHAR(30),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monitoring_remaja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring_usia_produktif" (
    "id" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "recorded_by" TEXT NOT NULL,
    "examination_date" DATE NOT NULL,
    "weight" DECIMAL(5,2),
    "height" DECIMAL(5,2),
    "bmi" DECIMAL(5,2),
    "waist_circumference" DECIMAL(5,2),
    "systolic_bp" INTEGER,
    "diastolic_bp" INTEGER,
    "blood_sugar" DECIMAL(5,2),
    "cholesterol" DECIMAL(5,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monitoring_usia_produktif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring_lansia" (
    "id" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "recorded_by" TEXT NOT NULL,
    "examination_date" DATE NOT NULL,
    "weight" DECIMAL(5,2),
    "systolic_bp" INTEGER,
    "diastolic_bp" INTEGER,
    "blood_sugar" DECIMAL(5,2),
    "cholesterol" DECIMAL(5,2),
    "uric_acid" DECIMAL(5,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monitoring_lansia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "recorded_by" TEXT,
    "attendance_date" DATE NOT NULL,
    "attendance_time" TIME(6) NOT NULL,
    "method" "AttendanceMethod" NOT NULL DEFAULT 'QR',
    "status" "AttendanceStatus" NOT NULL DEFAULT 'HADIR',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "image" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentations" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "media_type" "MediaType" NOT NULL DEFAULT 'PHOTO',
    "file_url" VARCHAR(255) NOT NULL,
    "activity_date" DATE NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archives" (
    "id" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "file_url" VARCHAR(255) NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "archives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "archive_categories_name_key" ON "archive_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "visitors_nik_key" ON "visitors"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "visitors_qr_code_key" ON "visitors"("qr_code");

-- CreateIndex
CREATE INDEX "visitors_full_name_idx" ON "visitors"("full_name");

-- CreateIndex
CREATE INDEX "visitors_category_id_full_name_idx" ON "visitors"("category_id", "full_name");

-- CreateIndex
CREATE INDEX "monitoring_balita_examination_date_idx" ON "monitoring_balita"("examination_date");

-- CreateIndex
CREATE INDEX "monitoring_balita_recorded_by_idx" ON "monitoring_balita"("recorded_by");

-- CreateIndex
CREATE UNIQUE INDEX "monitoring_balita_visitor_id_month_number_key" ON "monitoring_balita"("visitor_id", "month_number");

-- CreateIndex
CREATE INDEX "monitoring_ibu_hamil_visitor_id_gestational_age_idx" ON "monitoring_ibu_hamil"("visitor_id", "gestational_age");

-- CreateIndex
CREATE INDEX "monitoring_ibu_hamil_examination_date_idx" ON "monitoring_ibu_hamil"("examination_date");

-- CreateIndex
CREATE INDEX "monitoring_ibu_hamil_recorded_by_idx" ON "monitoring_ibu_hamil"("recorded_by");

-- CreateIndex
CREATE UNIQUE INDEX "monitoring_ibu_hamil_visitor_id_examination_date_key" ON "monitoring_ibu_hamil"("visitor_id", "examination_date");

-- CreateIndex
CREATE INDEX "monitoring_remaja_examination_date_idx" ON "monitoring_remaja"("examination_date");

-- CreateIndex
CREATE INDEX "monitoring_remaja_recorded_by_idx" ON "monitoring_remaja"("recorded_by");

-- CreateIndex
CREATE UNIQUE INDEX "monitoring_remaja_visitor_id_examination_date_key" ON "monitoring_remaja"("visitor_id", "examination_date");

-- CreateIndex
CREATE INDEX "monitoring_usia_produktif_examination_date_idx" ON "monitoring_usia_produktif"("examination_date");

-- CreateIndex
CREATE INDEX "monitoring_usia_produktif_recorded_by_idx" ON "monitoring_usia_produktif"("recorded_by");

-- CreateIndex
CREATE UNIQUE INDEX "monitoring_usia_produktif_visitor_id_examination_date_key" ON "monitoring_usia_produktif"("visitor_id", "examination_date");

-- CreateIndex
CREATE INDEX "monitoring_lansia_examination_date_idx" ON "monitoring_lansia"("examination_date");

-- CreateIndex
CREATE INDEX "monitoring_lansia_recorded_by_idx" ON "monitoring_lansia"("recorded_by");

-- CreateIndex
CREATE UNIQUE INDEX "monitoring_lansia_visitor_id_examination_date_key" ON "monitoring_lansia"("visitor_id", "examination_date");

-- CreateIndex
CREATE INDEX "attendances_attendance_date_idx" ON "attendances"("attendance_date");

-- CreateIndex
CREATE INDEX "attendances_recorded_by_idx" ON "attendances"("recorded_by");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_visitor_id_attendance_date_key" ON "attendances"("visitor_id", "attendance_date");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_is_active_idx" ON "products"("is_active");

-- CreateIndex
CREATE INDEX "documentations_activity_date_idx" ON "documentations"("activity_date");

-- CreateIndex
CREATE INDEX "documentations_uploaded_by_idx" ON "documentations"("uploaded_by");

-- CreateIndex
CREATE INDEX "archives_category_id_idx" ON "archives"("category_id");

-- CreateIndex
CREATE INDEX "archives_uploaded_by_idx" ON "archives"("uploaded_by");

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_balita" ADD CONSTRAINT "monitoring_balita_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_balita" ADD CONSTRAINT "monitoring_balita_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_ibu_hamil" ADD CONSTRAINT "monitoring_ibu_hamil_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_ibu_hamil" ADD CONSTRAINT "monitoring_ibu_hamil_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_remaja" ADD CONSTRAINT "monitoring_remaja_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_remaja" ADD CONSTRAINT "monitoring_remaja_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_usia_produktif" ADD CONSTRAINT "monitoring_usia_produktif_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_usia_produktif" ADD CONSTRAINT "monitoring_usia_produktif_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_lansia" ADD CONSTRAINT "monitoring_lansia_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_lansia" ADD CONSTRAINT "monitoring_lansia_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentations" ADD CONSTRAINT "documentations_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archives" ADD CONSTRAINT "archives_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "archive_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archives" ADD CONSTRAINT "archives_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================================
-- SOURCE: prisma/migrations/20260717115113_convert_ids_to_autoincrement/migration.sql
-- ============================================================================
/*
  Warnings:

  - The primary key for the `archives` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `archives` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `attendances` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `attendances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `recorded_by` column on the `attendances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `documentations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `documentations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `monitoring_balita` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `monitoring_balita` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `monitoring_ibu_hamil` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `monitoring_ibu_hamil` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `monitoring_lansia` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `monitoring_lansia` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `monitoring_remaja` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `monitoring_remaja` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `monitoring_usia_produktif` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `monitoring_usia_produktif` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `visitors` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `visitors` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `uploaded_by` on the `archives` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `visitor_id` on the `attendances` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uploaded_by` on the `documentations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `visitor_id` on the `monitoring_balita` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `recorded_by` on the `monitoring_balita` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `visitor_id` on the `monitoring_ibu_hamil` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `recorded_by` on the `monitoring_ibu_hamil` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `visitor_id` on the `monitoring_lansia` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `recorded_by` on the `monitoring_lansia` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `visitor_id` on the `monitoring_remaja` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `recorded_by` on the `monitoring_remaja` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `visitor_id` on the `monitoring_usia_produktif` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `recorded_by` on the `monitoring_usia_produktif` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "archives" DROP CONSTRAINT "archives_uploaded_by_fkey";

-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_recorded_by_fkey";

-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_visitor_id_fkey";

-- DropForeignKey
ALTER TABLE "documentations" DROP CONSTRAINT "documentations_uploaded_by_fkey";

-- DropForeignKey
ALTER TABLE "monitoring_balita" DROP CONSTRAINT "monitoring_balita_recorded_by_fkey";

-- DropForeignKey
ALTER TABLE "monitoring_balita" DROP CONSTRAINT "monitoring_balita_visitor_id_fkey";

-- DropForeignKey
ALTER TABLE "monitoring_ibu_hamil" DROP CONSTRAINT "monitoring_ibu_hamil_recorded_by_fkey";

-- DropForeignKey
ALTER TABLE "monitoring_ibu_hamil" DROP CONSTRAINT "monitoring_ibu_hamil_visitor_id_fkey";

-- DropForeignKey
ALTER TABLE "monitoring_lansia" DROP CONSTRAINT "monitoring_lansia_recorded_by_fkey";

-- DropForeignKey
ALTER TABLE "monitoring_lansia" DROP CONSTRAINT "monitoring_lansia_visitor_id_fkey";

-- DropForeignKey
ALTER TABLE "monitoring_remaja" DROP CONSTRAINT "monitoring_remaja_recorded_by_fkey";

-- DropForeignKey
ALTER TABLE "monitoring_remaja" DROP CONSTRAINT "monitoring_remaja_visitor_id_fkey";

-- DropForeignKey
ALTER TABLE "monitoring_usia_produktif" DROP CONSTRAINT "monitoring_usia_produktif_recorded_by_fkey";

-- DropForeignKey
ALTER TABLE "monitoring_usia_produktif" DROP CONSTRAINT "monitoring_usia_produktif_visitor_id_fkey";

-- AlterTable
ALTER TABLE "archives" DROP CONSTRAINT "archives_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "uploaded_by",
ADD COLUMN     "uploaded_by" INTEGER NOT NULL,
ADD CONSTRAINT "archives_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "visitor_id",
ADD COLUMN     "visitor_id" INTEGER NOT NULL,
DROP COLUMN "recorded_by",
ADD COLUMN     "recorded_by" INTEGER,
ADD CONSTRAINT "attendances_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "documentations" DROP CONSTRAINT "documentations_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "uploaded_by",
ADD COLUMN     "uploaded_by" INTEGER NOT NULL,
ADD CONSTRAINT "documentations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "monitoring_balita" DROP CONSTRAINT "monitoring_balita_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "visitor_id",
ADD COLUMN     "visitor_id" INTEGER NOT NULL,
DROP COLUMN "recorded_by",
ADD COLUMN     "recorded_by" INTEGER NOT NULL,
ADD CONSTRAINT "monitoring_balita_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "monitoring_ibu_hamil" DROP CONSTRAINT "monitoring_ibu_hamil_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "visitor_id",
ADD COLUMN     "visitor_id" INTEGER NOT NULL,
DROP COLUMN "recorded_by",
ADD COLUMN     "recorded_by" INTEGER NOT NULL,
ADD CONSTRAINT "monitoring_ibu_hamil_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "monitoring_lansia" DROP CONSTRAINT "monitoring_lansia_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "visitor_id",
ADD COLUMN     "visitor_id" INTEGER NOT NULL,
DROP COLUMN "recorded_by",
ADD COLUMN     "recorded_by" INTEGER NOT NULL,
ADD CONSTRAINT "monitoring_lansia_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "monitoring_remaja" DROP CONSTRAINT "monitoring_remaja_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "visitor_id",
ADD COLUMN     "visitor_id" INTEGER NOT NULL,
DROP COLUMN "recorded_by",
ADD COLUMN     "recorded_by" INTEGER NOT NULL,
ADD CONSTRAINT "monitoring_remaja_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "monitoring_usia_produktif" DROP CONSTRAINT "monitoring_usia_produktif_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "visitor_id",
ADD COLUMN     "visitor_id" INTEGER NOT NULL,
DROP COLUMN "recorded_by",
ADD COLUMN     "recorded_by" INTEGER NOT NULL,
ADD CONSTRAINT "monitoring_usia_produktif_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "products" DROP CONSTRAINT "products_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "visitors" DROP CONSTRAINT "visitors_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "visitors_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "archives_uploaded_by_idx" ON "archives"("uploaded_by");

-- CreateIndex
CREATE INDEX "attendances_recorded_by_idx" ON "attendances"("recorded_by");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_visitor_id_attendance_date_key" ON "attendances"("visitor_id", "attendance_date");

-- CreateIndex
CREATE INDEX "documentations_uploaded_by_idx" ON "documentations"("uploaded_by");

-- CreateIndex
CREATE INDEX "monitoring_balita_recorded_by_idx" ON "monitoring_balita"("recorded_by");

-- CreateIndex
CREATE UNIQUE INDEX "monitoring_balita_visitor_id_month_number_key" ON "monitoring_balita"("visitor_id", "month_number");

-- CreateIndex
CREATE INDEX "monitoring_ibu_hamil_visitor_id_gestational_age_idx" ON "monitoring_ibu_hamil"("visitor_id", "gestational_age");

-- CreateIndex
CREATE INDEX "monitoring_ibu_hamil_recorded_by_idx" ON "monitoring_ibu_hamil"("recorded_by");

-- CreateIndex
CREATE UNIQUE INDEX "monitoring_ibu_hamil_visitor_id_examination_date_key" ON "monitoring_ibu_hamil"("visitor_id", "examination_date");

-- CreateIndex
CREATE INDEX "monitoring_lansia_recorded_by_idx" ON "monitoring_lansia"("recorded_by");

-- CreateIndex
CREATE UNIQUE INDEX "monitoring_lansia_visitor_id_examination_date_key" ON "monitoring_lansia"("visitor_id", "examination_date");

-- CreateIndex
CREATE INDEX "monitoring_remaja_recorded_by_idx" ON "monitoring_remaja"("recorded_by");

-- CreateIndex
CREATE UNIQUE INDEX "monitoring_remaja_visitor_id_examination_date_key" ON "monitoring_remaja"("visitor_id", "examination_date");

-- CreateIndex
CREATE INDEX "monitoring_usia_produktif_recorded_by_idx" ON "monitoring_usia_produktif"("recorded_by");

-- CreateIndex
CREATE UNIQUE INDEX "monitoring_usia_produktif_visitor_id_examination_date_key" ON "monitoring_usia_produktif"("visitor_id", "examination_date");

-- AddForeignKey
ALTER TABLE "monitoring_balita" ADD CONSTRAINT "monitoring_balita_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_balita" ADD CONSTRAINT "monitoring_balita_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_ibu_hamil" ADD CONSTRAINT "monitoring_ibu_hamil_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_ibu_hamil" ADD CONSTRAINT "monitoring_ibu_hamil_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_remaja" ADD CONSTRAINT "monitoring_remaja_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_remaja" ADD CONSTRAINT "monitoring_remaja_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_usia_produktif" ADD CONSTRAINT "monitoring_usia_produktif_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_usia_produktif" ADD CONSTRAINT "monitoring_usia_produktif_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_lansia" ADD CONSTRAINT "monitoring_lansia_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_lansia" ADD CONSTRAINT "monitoring_lansia_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentations" ADD CONSTRAINT "documentations_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archives" ADD CONSTRAINT "archives_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================================
-- SOURCE: prisma/migrations/20260723132015_add_cms_module/migration.sql
-- ============================================================================
-- CreateTable
CREATE TABLE "profiles" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "organization_name" VARCHAR(150) NOT NULL,
    "tagline" VARCHAR(255),
    "vision" TEXT NOT NULL,
    "mission" TEXT NOT NULL,
    "history" TEXT,
    "address" TEXT NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(150),
    "maps_embed" TEXT,
    "logo" VARCHAR(255),
    "hero_image" VARCHAR(255),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "thumbnail" VARCHAR(255),
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "location" VARCHAR(255),
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "image" VARCHAR(255),
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "news_categories_name_key" ON "news_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "news_categories_slug_key" ON "news_categories"("slug");

-- CreateIndex
CREATE INDEX "news_categories_slug_idx" ON "news_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "news_slug_key" ON "news"("slug");

-- CreateIndex
CREATE INDEX "news_slug_idx" ON "news"("slug");

-- CreateIndex
CREATE INDEX "news_published_at_idx" ON "news"("published_at");

-- CreateIndex
CREATE INDEX "news_category_id_idx" ON "news"("category_id");

-- CreateIndex
CREATE INDEX "news_author_id_idx" ON "news"("author_id");

-- CreateIndex
CREATE INDEX "events_start_date_idx" ON "events"("start_date");

-- CreateIndex
CREATE INDEX "events_is_published_idx" ON "events"("is_published");

-- CreateIndex
CREATE INDEX "faqs_order_idx" ON "faqs"("order");

-- CreateIndex
CREATE INDEX "faqs_is_active_idx" ON "faqs"("is_active");

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "news_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================================
-- SOURCE: prisma/migrations/20260725000000_add_must_change_password/migration.sql
-- ============================================================================
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "must_change_password" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "password_changed_at" TIMESTAMP(3);

-- ============================================================================
-- SOURCE: prisma/migrations/20260728060000_fix_auth_and_balita_uniqueness/migration.sql
-- ============================================================================
-- CreateEnum
CREATE TYPE "PasswordResetStatus" AS ENUM ('PENDING', 'RESOLVED', 'REJECTED');

-- CreateTable
CREATE TABLE "password_reset_requests" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "email" VARCHAR(150) NOT NULL,
    "status" "PasswordResetStatus" NOT NULL DEFAULT 'PENDING',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "handled_at" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "password_reset_requests_pkey" PRIMARY KEY ("id")
);

-- Fix the old uniqueness rule: month_number repeats every year.
DROP INDEX IF EXISTS "monitoring_balita_visitor_id_month_number_key";
CREATE UNIQUE INDEX "monitoring_balita_visitor_id_examination_date_key"
ON "monitoring_balita"("visitor_id", "examination_date");

-- CreateIndex
CREATE INDEX "password_reset_requests_email_requested_at_idx"
ON "password_reset_requests"("email", "requested_at");

-- CreateIndex
CREATE INDEX "password_reset_requests_status_requested_at_idx"
ON "password_reset_requests"("status", "requested_at");

-- AddForeignKey
ALTER TABLE "password_reset_requests"
ADD CONSTRAINT "password_reset_requests_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- SOURCE: prisma/migrations/20260729080000_add_posyandu_session_qr_absensi/migration.sql
-- ============================================================================
-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "posyandu_sessions" (
    "id" SERIAL NOT NULL,
    "session_date" DATE NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'OPEN',
    "opened_by" INTEGER NOT NULL,
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "posyandu_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "posyandu_sessions_token_key" ON "posyandu_sessions"("token");

-- CreateIndex
CREATE INDEX "posyandu_sessions_session_date_idx" ON "posyandu_sessions"("session_date");

-- CreateIndex
CREATE INDEX "posyandu_sessions_status_idx" ON "posyandu_sessions"("status");

-- CreateIndex
CREATE INDEX "posyandu_sessions_opened_by_idx" ON "posyandu_sessions"("opened_by");

-- AlterTable
ALTER TABLE "attendances" ADD COLUMN "session_id" INTEGER;

-- CreateIndex
CREATE INDEX "attendances_session_id_idx" ON "attendances"("session_id");

-- AddForeignKey
ALTER TABLE "posyandu_sessions" ADD CONSTRAINT "posyandu_sessions_opened_by_fkey" FOREIGN KEY ("opened_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "posyandu_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- SOURCE: prisma/migrations/20260730100000_merge_roles_accounts_audit/migration.sql
-- ============================================================================
-- Expand application roles while preserving existing USER accounts as KADER.
ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('ADMIN', 'KADER', 'MASYARAKAT');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users"
  ALTER COLUMN "role" TYPE "Role"
  USING (CASE WHEN "role"::text = 'USER' THEN 'KADER' ELSE "role"::text END)::"Role";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'KADER';
DROP TYPE "Role_old";

-- Link an optional login account to one Posyandu target/visitor.
ALTER TABLE "users" ADD COLUMN "visitor_id" INTEGER;
CREATE UNIQUE INDEX "users_visitor_id_key" ON "users"("visitor_id");
ALTER TABLE "users"
  ADD CONSTRAINT "users_visitor_id_fkey"
  FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Operational audit trail used by merged CRUD modules.
CREATE TABLE "audit_logs" (
  "id" SERIAL NOT NULL,
  "action" VARCHAR(100) NOT NULL,
  "user_id" INTEGER,
  "ip_address" VARCHAR(50),
  "details" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- ============================================================================
-- SOURCE: prisma/migrations/20260731100000_secure_supabase_data_api/migration.sql
-- ============================================================================
-- Posyandu Aster accesses application tables only through server-side Prisma.
-- Protect all application tables from direct Supabase Data API access.
DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> '_prisma_migrations'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM anon, authenticated', table_record.tablename);
  END LOOP;
END
$$;

DO $$
DECLARE
  sequence_record RECORD;
BEGIN
  FOR sequence_record IN
    SELECT sequencename
    FROM pg_sequences
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('REVOKE ALL PRIVILEGES ON SEQUENCE public.%I FROM anon, authenticated', sequence_record.sequencename);
  END LOOP;
END
$$;

-- ============================================================================
-- SOURCE: prisma/migrations/20260801163000_realtime_and_distributed_rate_limit/migration.sql
-- ============================================================================
-- Distributed rate limiting: replaces process-local memory with Supabase Postgres.
CREATE TABLE IF NOT EXISTS "rate_limit_buckets" (
  "key" VARCHAR(255) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "reset_at" TIMESTAMP(3) NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("key")
);

CREATE INDEX IF NOT EXISTS "rate_limit_buckets_reset_at_idx"
ON "rate_limit_buckets"("reset_at");

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.rate_limit_buckets FROM anon, authenticated;

-- Keeps expired limiter keys from accumulating indefinitely.
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_buckets()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.rate_limit_buckets
  WHERE reset_at < now() - interval '1 day';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_rate_limit_buckets() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limit_buckets() TO postgres, service_role;

-- Secure real-time invalidation. The public broadcast contains no health,
-- identity, password, or document payload. Authenticated application pages
-- receive only the table name and operation, then re-fetch through protected
-- Next.js server/API routes.
CREATE OR REPLACE FUNCTION public.notify_posyandu_realtime()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, realtime
AS $$
BEGIN
  PERFORM realtime.send(
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'changedAt', timezone('utc', now())
    ),
    'data_changed',
    'posyandu:changes',
    false
  );
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_posyandu_realtime() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_posyandu_realtime() TO postgres, service_role;

DO $$
DECLARE
  table_name text;
  realtime_tables text[] := ARRAY[
    'users',
    'password_reset_requests',
    'categories',
    'archive_categories',
    'visitors',
    'monitoring_balita',
    'monitoring_ibu_hamil',
    'monitoring_remaja',
    'monitoring_usia_produktif',
    'monitoring_lansia',
    'attendances',
    'posyandu_sessions',
    'products',
    'documentations',
    'archives',
    'profiles',
    'news_categories',
    'news',
    'events',
    'faqs',
    'audit_logs'
  ];
BEGIN
  FOREACH table_name IN ARRAY realtime_tables LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', 'trg_' || table_name || '_realtime', table_name);
      EXECUTE format(
        'CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH STATEMENT EXECUTE FUNCTION public.notify_posyandu_realtime()',
        'trg_' || table_name || '_realtime',
        table_name
      );
    END IF;
  END LOOP;
END
$$;
