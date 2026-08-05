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
