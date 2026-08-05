// prisma/seeds/categories.ts
import { PrismaClient } from "@prisma/client";

export async function seedCategories(prisma: PrismaClient) {
  // Master Kategori Pengunjung
  const categories = [
    { id: 1, name: "Balita", description: "Kategori anak usia 0-5 tahun" },
    { id: 2, name: "Ibu Hamil", description: "Kategori ibu mengandung" },
    { id: 3, name: "Remaja", description: "Kategori anak usia 10-19 tahun" },
    { id: 4, name: "Usia Produktif", description: "Kategori dewasa usia 15-49 tahun" },
    { id: 5, name: "Lanjut Usia", description: "Kategori lansia usia 60 tahun ke atas" },
  ];

  for (const item of categories) {
    await prisma.category.upsert({
      where: { id: item.id },
      update: { name: item.name, description: item.description },
      create: item,
    });
  }

  // Master Kategori Arsip (Mengikuti Skema Teroptimasi)
  const archiveCategories = [
    { id: 1, name: "Proposal", description: "Proposal kegiatan posyandu" },
    { id: 2, name: "SOP", description: "Standard Operating Procedure" },
    { id: 3, name: "Surat", description: "Surat masuk dan keluar" },
    { id: 4, name: "Laporan", description: "Laporan bulanan dan tahunan" },
    { id: 5, name: "Dokumen Lainnya", description: "Dokumen pendukung lainnya" },
  ];

  for (const item of archiveCategories) {
    await prisma.archiveCategory.upsert({
      where: { id: item.id },
      update: { name: item.name, description: item.description },
      create: item,
    });
  }

  console.log("✅ Categories Seeded");
}