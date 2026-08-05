// prisma/seeds/news.ts

import { PrismaClient } from "@prisma/client";
import { ADMIN_ID } from "./users";

export async function seedNews(prisma: PrismaClient) {
    const news = [
        {
            id: 1,
            categoryId: 3,
            authorId: ADMIN_ID,
            title: "Posyandu Aster Melaksanakan Pelayanan Rutin Bulanan",
            slug: "pelayanan-rutin-bulanan",
            excerpt:
                "Pelayanan Posyandu bulan ini berjalan lancar dengan antusiasme masyarakat yang tinggi.",
            content:
                "Kegiatan Posyandu meliputi penimbangan balita, pemeriksaan ibu hamil, imunisasi, penyuluhan gizi, dan konsultasi kesehatan berkala untuk masyarakat Desa Aster.",
            thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop",
            isPublished: true,
            publishedAt: new Date(),
        },
        {
            id: 2,
            categoryId: 1,
            authorId: ADMIN_ID,
            title: "Pentingnya Imunisasi Lengkap pada Anak",
            slug: "pentingnya-imunisasi-lengkap",
            excerpt:
                "Imunisasi lengkap membantu melindungi anak dari berbagai penyakit berbahaya.",
            content:
                "Imunisasi merupakan salah satu langkah pencegahan penyakit menular yang sangat penting bagi tumbuh kembang anak secara menyeluruh.",
            thumbnail: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop",
            isPublished: true,
            publishedAt: new Date(),
        },
        {
            id: 3,
            categoryId: 5,
            authorId: ADMIN_ID,
            title: "Menu Gizi Seimbang untuk Balita",
            slug: "menu-gizi-seimbang-balita",
            excerpt:
                "Penuhi kebutuhan gizi balita dengan makanan bergizi seimbang setiap hari.",
            content:
                "Pemberian makanan bergizi merupakan salah satu upaya pencegahan stunting sejak dini dengan memanfaatkan bahan pangan lokal kaya protein hewani.",
            thumbnail: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop",
            isPublished: true,
            publishedAt: new Date(),
        },
    ];

    for (const item of news) {
        await prisma.news.upsert({
            where: { id: item.id },
            update: {
                thumbnail: item.thumbnail,
                title: item.title,
                excerpt: item.excerpt,
                content: item.content,
            },
            create: item,
        });
    }

    console.log("✅ News Seeded");
}