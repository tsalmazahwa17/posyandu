// prisma/seeds/attendances.ts
import { PrismaClient, AttendanceMethod, AttendanceStatus } from "@prisma/client";
import { VISITOR_BALITA_ID, VISITOR_BUMIL_ID } from "./visitors";
import { USER_ID } from "./users";

export async function seedAttendances(prisma: PrismaClient) {
  const records = [
    {
      id: 1,
      visitorId: VISITOR_BALITA_ID,
      recordedBy: USER_ID,
      attendanceDate: new Date("2026-06-15"),
      attendanceTime: new Date("2026-06-15T08:30:00Z"),
      method: AttendanceMethod.QR,
      status: AttendanceStatus.HADIR,
      notes: "Hadir untuk imunisasi berkala.",
    },
    {
      id: 2,
      visitorId: VISITOR_BUMIL_ID,
      recordedBy: USER_ID,
      attendanceDate: new Date("2026-06-15"),
      attendanceTime: new Date("2026-06-15T09:15:00Z"),
      method: AttendanceMethod.MANUAL,
      status: AttendanceStatus.HADIR,
      notes: "Absensi manual dibantu kader.",
    },
  ];

  for (const record of records) {
    await prisma.attendance.upsert({
      where: { id: record.id },
      update: {},
      create: record,
    });
  }

  console.log("✅ Attendances Seeded");
}