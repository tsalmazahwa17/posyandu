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
