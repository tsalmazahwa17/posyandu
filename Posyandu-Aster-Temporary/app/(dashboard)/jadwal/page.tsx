import { prisma } from "@/lib/prisma";
import { getAuthenticatedSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import JadwalPage, { JadwalEvent } from "@/components/jadwal/JadwalPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jadwal Posyandu | Posyandu Aster",
  description: "Jadwal kegiatan pelayanan Posyandu Aster — pemantauan kesehatan balita, ibu hamil, remaja, dan lansia.",
};

export default async function Page() {
  const session = await getAuthenticatedSession();
  if (!session) redirect("/logout");

  const rawEvents = await prisma.event.findMany({
    orderBy: { startDate: "asc" },
    // MASYARAKAT hanya melihat yang dipublikasi
    ...(session.role === "MASYARAKAT" ? { where: { isPublished: true } } : {}),
  });

  const events: JadwalEvent[] = rawEvents.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description ?? null,
    location: e.location ?? null,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate?.toISOString() ?? null,
    isPublished: e.isPublished,
    createdAt: e.createdAt.toISOString(),
  }));

  return <JadwalPage events={events} role={session.role} />;
}
