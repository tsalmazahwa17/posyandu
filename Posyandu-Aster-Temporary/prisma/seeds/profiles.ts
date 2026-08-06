// prisma/seeds/profiles.ts

import { PrismaClient } from "@prisma/client";

export async function seedProfiles(prisma: PrismaClient) {
    await prisma.profile.upsert({
        where: { id: 1 },
        update: {
            organizationName: "Posyandu Aster",
            tagline: "Mewujudkan Generasi Sehat Bersama Posyandu Aster",
            vision:
                'Terwujudnya Keluarga Sehat, Mandiri, dan Sejahtera Berbasis Pemberdayaan Masyarakat menuju Generasi Bebas Stunting.',
            mission:
                `- Meningkatkan Kualitas Pelayanan Kesehatan Ibu, Anak, dan Lansia\nMenyediakan pelayanan pemantauan tumbuh kembang, imunisasi, pencegahan stunting, serta pemeriksaan kesehatan rutin secara inklusif, ramah, dan ramah lingkungan.\n- Mendorong Edukasi dan Pola Hidup Bersih dan Sehat (PHBS)\nMemberikan edukasi gizi seimbang, pemanfaatan bahan pangan lokal, saniter, serta pola asuh positif kepada orang tua dan kader.\n- Memperkuat Kapasitas dan Kemandirian Kader Posyandu\nMeningkatkan keterampilan, pengetahuan, dan pemanfaatan teknologi digital sederhana bagi kader dalam pendataan dan pengelolaan layanan kesehatan berbasis komunitas.\n- Membangun Sinergi Strategis dan Pemanfaatan Lingkungan\nMengembangkan kolaborasi dengan pemerintah lokal, sektor swasta/CSR, dunia usaha, dan tokoh masyarakat dalam mendukung keberlanjutan program kesehatan terpadu.`,
            history:
                "Posyandu Aster merupakan pos pelayanan terpadu yang melayani masyarakat melalui kegiatan kesehatan ibu dan anak, imunisasi, gizi, serta pelayanan kesehatan lainnya.",
            address:
                "Jl. Aster Raya No. 12, Kel. Harapan Baru, Kecamatan Aster Sejahtera",
            phone: "+62 856-4651-9926",
            email: "nrl.azizah@gmail.com",
            mapsEmbed: "https://maps.app.goo.gl/WcqukfBndZsPDvG59?g_st=aw",
        },
        create: {
            id: 1,
            organizationName: "Posyandu Aster",
            tagline: "Mewujudkan Generasi Sehat Bersama Posyandu Aster",
            vision:
                'Terwujudnya Keluarga Sehat, Mandiri, dan Sejahtera Berbasis Pemberdayaan Masyarakat menuju Generasi Bebas Stunting.',
            mission:
                `- Meningkatkan Kualitas Pelayanan Kesehatan Ibu, Anak, dan Lansia\nMenyediakan pelayanan pemantauan tumbuh kembang, imunisasi, pencegahan stunting, serta pemeriksaan kesehatan rutin secara inklusif, ramah, dan ramah lingkungan.\n- Mendorong Edukasi dan Pola Hidup Bersih dan Sehat (PHBS)\nMemberikan edukasi gizi seimbang, pemanfaatan bahan pangan lokal, saniter, serta pola asuh positif kepada orang tua dan kader.\n- Memperkuat Kapasitas dan Kemandirian Kader Posyandu\nMeningkatkan keterampilan, pengetahuan, dan pemanfaatan teknologi digital sederhana bagi kader dalam pendataan dan pengelolaan layanan kesehatan berbasis komunitas.\n- Membangun Sinergi Strategis dan Pemanfaatan Lingkungan\nMengembangkan kolaborasi dengan pemerintah lokal, sektor swasta/CSR, dunia usaha, dan tokoh masyarakat dalam mendukung keberlanjutan program kesehatan terpadu.`,
            history:
                "Posyandu Aster merupakan pos pelayanan terpadu yang melayani masyarakat melalui kegiatan kesehatan ibu dan anak, imunisasi, gizi, serta pelayanan kesehatan lainnya.",
            address:
                "Jl. Aster Raya No. 12, Kel. Harapan Baru, Kecamatan Aster Sejahtera",
            phone: "+62 856-4651-9926",
            email: "nrl.azizah@gmail.com",
            mapsEmbed: "https://maps.app.goo.gl/WcqukfBndZsPDvG59?g_st=aw",
            logo: "/images/logo.png",
            heroImage: "/images/hero.jpg",
        },
    });

    console.log("✅ Profile Seeded");
}