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
