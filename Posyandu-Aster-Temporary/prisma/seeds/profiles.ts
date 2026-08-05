// prisma/seeds/profiles.ts

import { PrismaClient } from "@prisma/client";

export async function seedProfiles(prisma: PrismaClient) {
    await prisma.profile.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            organizationName: "Posyandu Aster",
            tagline: "Mewujudkan Generasi Sehat Bersama Posyandu Aster",
            vision:
                "Menjadi Posyandu yang aktif, mandiri, dan berkualitas dalam meningkatkan derajat kesehatan masyarakat.",
            mission:
                "Memberikan pelayanan kesehatan dasar, meningkatkan kesadaran hidup sehat, dan mendukung tumbuh kembang masyarakat secara berkelanjutan.",
            history:
                "Posyandu Aster merupakan pos pelayanan terpadu yang melayani masyarakat melalui kegiatan kesehatan ibu dan anak, imunisasi, gizi, serta pelayanan kesehatan lainnya.",
            address:
                "Jl. Melati No. 10, Kelurahan Sumbersari, Kecamatan Lowokwaru, Kota Malang",
            phone: "081234567890",
            email: "posyanduaster@example.com",
            mapsEmbed: "https://maps.google.com/",
            logo: "/images/logo.png",
            heroImage: "/images/hero.jpg",
        },
    });

    console.log("✅ Profile Seeded");
}