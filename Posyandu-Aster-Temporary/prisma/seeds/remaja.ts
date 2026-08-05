// prisma/seeds/remaja.ts
import { PrismaClient } from "@prisma/client";
import { VISITOR_REMAJA_ID } from "./visitors";
import { USER_ID } from "./users";

export async function seedRemaja(prisma: PrismaClient) {
  const records = [
    {
      id: 1,
      visitorId: VISITOR_REMAJA_ID,
      recordedBy: USER_ID,
      examinationDate: new Date("2026-06-12"),
      weight: 42.5,
      height: 148.0,
      armCircumference: 22.5,
      hb: 12.2,
      anemiaStatus: "Tidak Anemia",
      notes: "Kondisi fisik normal, berikan tablet tambah darah jika perlu.",
    },
  ];

  for (const record of records) {
    await prisma.monitoringRemaja.upsert({
      where: { id: record.id },
      update: {},
      create: record,
    });
  }

  console.log("✅ Monitoring Remaja Seeded");
}