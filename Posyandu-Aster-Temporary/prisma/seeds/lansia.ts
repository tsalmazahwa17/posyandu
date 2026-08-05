// prisma/seeds/lansia.ts
import { PrismaClient } from "@prisma/client";
import { VISITOR_LANSIA_ID } from "./visitors";
import { USER_ID } from "./users";

export async function seedLansia(prisma: PrismaClient) {
  const records = [
    {
      id: 1,
      visitorId: VISITOR_LANSIA_ID,
      recordedBy: USER_ID,
      examinationDate: new Date("2026-06-12"),
      weight: 60.5,
      systolicBP: 130,
      diastolicBP: 80,
      bloodSugar: 110,
      cholesterol: 195,
      uricAcid: 5.4,
      notes: "Asam urat dalam batas wajar. Kurangi konsumsi emping.",
    },
  ];

  for (const record of records) {
    await prisma.monitoringLansia.upsert({
      where: { id: record.id },
      update: {},
      create: record,
    });
  }

  console.log("✅ Monitoring Lansia Seeded");
}