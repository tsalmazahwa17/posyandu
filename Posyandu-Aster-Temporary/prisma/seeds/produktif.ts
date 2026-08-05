// prisma/seeds/produktif.ts
import { PrismaClient } from "@prisma/client";
import { VISITOR_PRODUKTIF_ID } from "./visitors";
import { USER_ID } from "./users";

export async function seedProduktif(prisma: PrismaClient) {
  const records = [
    {
      id: 1,
      visitorId: VISITOR_PRODUKTIF_ID,
      recordedBy: USER_ID,
      examinationDate: new Date("2026-06-12"),
      weight: 68.2,
      height: 170.0,
      bmi: 23.6,
      waistCircumference: 84.0,
      systolicBP: 125,
      diastolicBP: 85,
      bloodSugar: 105,
      cholesterol: 180,
      notes: "Gula darah dan kolesterol aman. Jaga pola tidur.",
    },
  ];

  for (const record of records) {
    await prisma.monitoringUsiaProduktif.upsert({
      where: { id: record.id },
      update: {},
      create: record,
    });
  }

  console.log("✅ Monitoring Usia Produktif Seeded");
}