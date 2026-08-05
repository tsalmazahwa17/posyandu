// prisma/seeds/documentations.ts
import { PrismaClient, MediaType } from "@prisma/client";
import { ADMIN_ID } from "./users";

export async function seedDocumentations(prisma: PrismaClient) {
  const records = [
    {
      id: 1,
      title: "Kegiatan Imunisasi Nasional Juni 2026",
      description: "Pemberian vaksinasi serentak bagi anak usia dini.",
      mediaType: MediaType.PHOTO,
      fileUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef",
      activityDate: new Date("2026-06-15"),
      uploadedBy: ADMIN_ID,
    },
  ];

  for (const record of records) {
    await prisma.documentation.upsert({
      where: { id: record.id },
      update: {},
      create: record,
    });
  }

  console.log("✅ Documentations Seeded");
}