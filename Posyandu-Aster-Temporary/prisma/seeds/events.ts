// prisma/seeds/events.ts

import { PrismaClient } from "@prisma/client";

export async function seedEvents(prisma: PrismaClient) {
    const events = [
        {
            id: 1,
            title: "Posyandu Balita Bulan Agustus",
            description: "Pelayanan kesehatan balita dan imunisasi.",
            location: "Balai RW 03",
            startDate: new Date("2026-08-05T08:00:00"),
            endDate: new Date("2026-08-05T11:00:00"),
            image: "/images/events/event-1.jpg",
            isPublished: true,
        },
        {
            id: 2,
            title: "Pemeriksaan Ibu Hamil",
            description: "Pemeriksaan rutin ibu hamil bersama bidan.",
            location: "Posyandu Aster",
            startDate: new Date("2026-08-12T08:00:00"),
            endDate: new Date("2026-08-12T10:00:00"),
            image: "/images/events/event-2.jpg",
            isPublished: true,
        },
        {
            id: 3,
            title: "Senam Lansia",
            description: "Kegiatan olahraga bersama lansia.",
            location: "Balai Kelurahan",
            startDate: new Date("2026-08-18T07:00:00"),
            endDate: new Date("2026-08-18T08:30:00"),
            image: "/images/events/event-3.jpg",
            isPublished: true,
        },
    ];

    for (const event of events) {
        await prisma.event.upsert({
            where: { id: event.id },
            update: {},
            create: event,
        });
    }

    console.log("✅ Events Seeded");
}