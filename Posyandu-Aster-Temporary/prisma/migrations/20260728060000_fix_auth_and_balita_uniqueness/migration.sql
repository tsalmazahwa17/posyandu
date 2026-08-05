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
