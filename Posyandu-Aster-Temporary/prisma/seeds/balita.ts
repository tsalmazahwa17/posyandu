// prisma/seeds/balita.ts
import { PrismaClient } from "@prisma/client";
import { VISITOR_BALITA_ID } from "./visitors";
import { USER_ID } from "./users";

export async function seedBalita(prisma: PrismaClient) {
  const records = [
    {
      id: 1,
      visitorId: VISITOR_BALITA_ID,
      recordedBy: USER_ID,
      examinationDate: new Date("2026-04-15"),
      monthNumber: 1,
      ageMonth: 10,
      weight: 7.2,
      height: 68.5,
      headCircumference: 42.1,
      nutritionalStatus: "Gizi Baik",
      immunization: "DPT-HB-Hib 1, Polio 2",
      vitamin: "Vitamin A Biru",
      kpspResult: "Sesuai",
      notes: "Kondisi sangat sehat dan lincah.",
    },
    {
      id: 2,
      visitorId: VISITOR_BALITA_ID,
      recordedBy: USER_ID,
      examinationDate: new Date("2026-05-15"),
      monthNumber: 2,
      ageMonth: 11,
      weight: 7.8,
      height: 70.2,
      headCircumference: 43.0,
      nutritionalStatus: "Gizi Baik",
      immunization: "DPT-HB-Hib 2, Polio 3",
      vitamin: "Vitamin A Merah",
      kpspResult: "Sesuai",
      notes: "Nafsu makan baik, pertahankan asupan nutrisi.",
    },
  ];

  for (const record of records) {
    await prisma.monitoringBalita.upsert({
      where: { id: record.id },
      update: {},
      create: record,
    });
  }

  console.log("✅ Monitoring Balita Seeded");
}