// prisma/seeds/bumil.ts
import { PrismaClient } from "@prisma/client";
import { VISITOR_BUMIL_ID } from "./visitors";
import { USER_ID } from "./users";

export async function seedBumil(prisma: PrismaClient) {
  const records = [
    {
      id: 1,
      visitorId: VISITOR_BUMIL_ID,
      recordedBy: USER_ID,
      examinationDate: new Date("2026-06-10"),
      gestationalAge: 16, // 16 minggu
      weight: 57.2,
      systolicBP: 115,
      diastolicBP: 75,
      hb: 11.8,
      lila: 25.0,
      hpht: new Date("2026-02-15"),
      hpl: new Date("2026-11-22"),
      notes: "Perkembangan janin terpantau aktif dan normal.",
    },
  ];

  for (const record of records) {
    await prisma.monitoringIbuHamil.upsert({
      where: { id: record.id },
      update: {},
      create: record,
    });
  }

  console.log("✅ Monitoring Ibu Hamil Seeded");
}