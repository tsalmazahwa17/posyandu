// prisma/seeds/archives.ts
import { PrismaClient } from "@prisma/client";
import { ADMIN_ID } from "./users";

export async function seedArchives(prisma: PrismaClient) {
  const records = [
    {
      id: 1,
      categoryId: 2, // Mengacu pada ArchiveCategory ID 2 (SOP)
      title: "SOP Penanganan Stunting Posyandu Aster",
      description: "Standar operasional prosedur kader dalam penanganan stunting.",
      fileUrl: "https://example.com/files/sop-stunting.pdf",
      uploadedBy: ADMIN_ID,
    },
  ];

  for (const record of records) {
    await prisma.archive.upsert({
      where: { id: record.id },
      update: {},
      create: record,
    });
  }

  console.log("✅ Archives Seeded");
}