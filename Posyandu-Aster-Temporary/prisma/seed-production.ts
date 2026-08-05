import { loadEnvConfig } from "@next/env";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { validateNewPassword } from "../utils/password";
import { seedCategories } from "./seeds/categories";
import { seedProfiles } from "./seeds/profiles";
import { seedNewsCategories } from "./seeds/newsCategories";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} wajib diisi sebelum menjalankan seed production.`);
  return value;
}

function validatedPassword(name: string): string {
  const password = requiredEnv(name);
  const validationError = validateNewPassword(password);
  if (validationError) throw new Error(`${name}: ${validationError}`);
  return password;
}

async function upsertInitialUsers() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@posyanduaster.id").trim().toLowerCase();
  const adminName = (process.env.SEED_ADMIN_NAME || "Administrator").trim();
  const kaderEmail = (process.env.SEED_KADER_EMAIL || "kader@posyanduaster.id").trim().toLowerCase();
  const kaderName = (process.env.SEED_KADER_NAME || "Kader Aster").trim();

  const [adminHash, kaderHash] = await Promise.all([
    bcrypt.hash(validatedPassword("SEED_ADMIN_PASSWORD"), 12),
    bcrypt.hash(validatedPassword("SEED_USER_PASSWORD"), 12),
  ]);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { fullName: adminName, role: Role.ADMIN, isActive: true },
    create: {
      fullName: adminName,
      email: adminEmail,
      password: adminHash,
      role: Role.ADMIN,
      isActive: true,
      mustChangePassword: true,
    },
  });

  await prisma.user.upsert({
    where: { email: kaderEmail },
    update: { fullName: kaderName, role: Role.KADER, isActive: true },
    create: {
      fullName: kaderName,
      email: kaderEmail,
      password: kaderHash,
      role: Role.KADER,
      isActive: true,
      mustChangePassword: true,
    },
  });
}

async function synchronizeSequence(table: string) {
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM "${table}";`
  );
}

async function main() {
  console.log("\nPosyandu Aster — seed production (tanpa data kesehatan contoh)\n");
  await seedCategories(prisma);
  await seedNewsCategories(prisma);
  await seedProfiles(prisma);
  await upsertInitialUsers();

  for (const table of ["users", "categories", "archive_categories", "profiles", "news_categories"]) {
    await synchronizeSequence(table);
  }

  console.log("✓ Master data dan akun awal production siap.");
  console.log("✓ Tidak ada sasaran, pemeriksaan, absensi, arsip, produk, atau konten demo yang dimasukkan.\n");
}

main()
  .catch((error) => {
    console.error("Seed production gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
