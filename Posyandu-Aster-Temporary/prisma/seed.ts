// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { seedCategories } from "./seeds/categories";
import { seedUsers } from "./seeds/users";
import { seedVisitors } from "./seeds/visitors";
import { seedBalita } from "./seeds/balita";
import { seedBumil } from "./seeds/bumil";
import { seedRemaja } from "./seeds/remaja";
import { seedProduktif } from "./seeds/produktif";
import { seedLansia } from "./seeds/lansia";
import { seedAttendances } from "./seeds/attendances";
import { seedProducts } from "./seeds/products";
import { seedDocumentations } from "./seeds/documentations";
import { seedArchives } from "./seeds/archives";
import { seedProfiles } from "./seeds/profiles";
import { seedNewsCategories } from "./seeds/newsCategories";
import { seedNews } from "./seeds/news";
import { seedEvents } from "./seeds/events";
import { seedFaqs } from "./seeds/faqs";

const prisma = new PrismaClient();

const AUTO_INCREMENT_TABLES = [
  "users",
  "categories",
  "archive_categories",
  "visitors",
  "monitoring_balita",
  "monitoring_ibu_hamil",
  "monitoring_remaja",
  "monitoring_usia_produktif",
  "monitoring_lansia",
  "attendances",
  "products",
  "documentations",
  "archives",
  "news_categories",
  "news",
  "events",
  "faqs",
] as const;

async function synchronizeSequences() {
  for (const table of AUTO_INCREMENT_TABLES) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM "${table}";`
    );
  }
}

async function main() {
  console.log("🌱 Memulai proses Seeding Database Posyandu Aster...");

  // Tahap 1: Seed Data Master Utama
  await seedCategories(prisma);

  // Tahap 2: Seed Pengunjung (Membutuhkan Category ID)
  await seedVisitors(prisma);

  // Akun masyarakat ditautkan ke salah satu sasaran yang sudah dibuat.
  await seedUsers(prisma);

  // Tahap 3: Seed Riwayat Pemeriksaan Kesehatan (Membutuhkan Visitor ID & User ID perekam)
  await seedBalita(prisma);
  await seedBumil(prisma);
  await seedRemaja(prisma);
  await seedProduktif(prisma);
  await seedLansia(prisma);

  // Tahap 4: Seed Absensi & Informasi Pendukung
  await seedAttendances(prisma);
  await seedProducts(prisma);
  await seedDocumentations(prisma);
  await seedArchives(prisma);

  await seedProfiles(prisma);
  await seedNewsCategories(prisma);
  await seedNews(prisma);
  await seedEvents(prisma);
  await seedFaqs(prisma);

  // Seed memakai ID eksplisit. Sinkronkan sequence agar insert berikutnya tidak bentrok.
  await synchronizeSequences();

  console.log("🎉 Seeding Database Sukses & Selesai Tanpa Hambatan!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal dengan error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });