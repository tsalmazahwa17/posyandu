// prisma/seeds/faqs.ts

import { PrismaClient } from "@prisma/client";

export async function seedFaqs(prisma: PrismaClient) {
    const faqs = [
        {
            id: 1,
            question: "Apa itu Posyandu?",
            answer:
                "Posyandu merupakan layanan kesehatan dasar bagi masyarakat yang diselenggarakan secara terpadu.",
            order: 1,
            isActive: true,
        },
        {
            id: 2,
            question: "Apakah pelayanan Posyandu gratis?",
            answer:
                "Ya. Seluruh pelayanan Posyandu diberikan secara gratis sesuai ketentuan yang berlaku.",
            order: 2,
            isActive: true,
        },
        {
            id: 3,
            question: "Kapan jadwal Posyandu dilaksanakan?",
            answer:
                "Jadwal kegiatan Posyandu diumumkan setiap bulan melalui website dan papan informasi Posyandu.",
            order: 3,
            isActive: true,
        },
        {
            id: 4,
            question: "Siapa saja yang dapat mengikuti kegiatan Posyandu?",
            answer:
                "Balita, ibu hamil, remaja, usia produktif, dan lansia dapat mengikuti layanan sesuai jenis kegiatan.",
            order: 4,
            isActive: true,
        },
    ];

    for (const faq of faqs) {
        await prisma.fAQ.upsert({
            where: { id: faq.id },
            update: {},
            create: faq,
        });
    }

    console.log("✅ FAQs Seeded");
}