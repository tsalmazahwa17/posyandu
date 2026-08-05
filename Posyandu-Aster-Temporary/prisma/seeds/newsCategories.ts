// prisma/seeds/newsCategories.ts

import { PrismaClient } from "@prisma/client";

export async function seedNewsCategories(prisma: PrismaClient) {
    const categories = [
        {
            id: 1,
            name: "Edukasi",
            slug: "edukasi",
            description: "Artikel edukasi kesehatan.",
        },
        {
            id: 2,
            name: "Pengumuman",
            slug: "pengumuman",
            description: "Pengumuman resmi Posyandu.",
        },
        {
            id: 3,
            name: "Kegiatan",
            slug: "kegiatan",
            description: "Kegiatan Posyandu Aster.",
        },
        {
            id: 4,
            name: "Imunisasi",
            slug: "imunisasi",
            description: "Informasi program imunisasi.",
        },
        {
            id: 5,
            name: "Gizi",
            slug: "gizi",
            description: "Artikel mengenai gizi masyarakat.",
        },
    ];

    for (const category of categories) {
        await prisma.newsCategory.upsert({
            where: { id: category.id },
            update: {},
            create: category,
        });
    }

    console.log("✅ News Categories Seeded");
}