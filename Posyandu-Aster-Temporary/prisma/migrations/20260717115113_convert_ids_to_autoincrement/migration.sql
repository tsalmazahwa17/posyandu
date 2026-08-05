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
