// prisma/seeds/visitors.ts
import { PrismaClient, Gender } from "@prisma/client";

// Static UUID Pengunjung untuk dihubungkan ke data pemeriksaan
export const VISITOR_BALITA_ID = 1;
export const VISITOR_BUMIL_ID = 2;
export const VISITOR_REMAJA_ID = 3;
export const VISITOR_PRODUKTIF_ID = 4;
export const VISITOR_LANSIA_ID = 5;

export async function seedVisitors(prisma: PrismaClient) {
  const visitors = [
    {
      id: VISITOR_BALITA_ID,
      categoryId: 1, // Balita
      nik: "3578012345670001",
      fullName: "Izha Ramadhan",
      gender: Gender.MALE,
      birthPlace: "Surabaya",
      birthDate: new Date("2025-06-15"),
      phone: "081234567890",
      address: "Jl. Aster No. 1, Surabaya",
      qrCode: "QR-BALITA-001",
      photo: "https://images.unsplash.com/photo-1519689680058-324335c77eba",
      isActive: true,
    },
    {
      id: VISITOR_BUMIL_ID,
      categoryId: 2, // Ibu Hamil
      nik: "3578012345670002",
      fullName: "Ibu Siti Aminah",
      gender: Gender.FEMALE,
      birthPlace: "Sidoarjo",
      birthDate: new Date("1996-08-20"),
      phone: "081234567891",
      address: "Jl. Aster No. 12, Surabaya",
      qrCode: "QR-BUMIL-001",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
      isActive: true,
    },
    {
      id: VISITOR_REMAJA_ID,
      categoryId: 3, // Remaja
      nik: "3578012345670003",
      fullName: "Rina Lestari",
      gender: Gender.FEMALE,
      birthPlace: "Gresik",
      birthDate: new Date("2011-11-05"),
      phone: "081234567892",
      address: "Jl. Aster No. 45, Surabaya",
      qrCode: "QR-REMAJA-001",
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
      isActive: true,
    },
    {
      id: VISITOR_PRODUKTIF_ID,
      categoryId: 4, // Usia Produktif
      nik: "3578012345670004",
      fullName: "Budi Santoso",
      gender: Gender.MALE,
      birthPlace: "Malang",
      birthDate: new Date("1988-03-12"),
      phone: "081234567893",
      address: "Jl. Aster No. 8, Surabaya",
      qrCode: "QR-PRODUKTIF-001",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      isActive: true,
    },
    {
      id: VISITOR_LANSIA_ID,
      categoryId: 5, // Lanjut Usia
      nik: "3578012345670005",
      fullName: "Mbah Joko Widodo",
      gender: Gender.MALE,
      birthPlace: "Surabaya",
      birthDate: new Date("1955-07-01"),
      phone: "081234567894",
      address: "Jl. Aster No. 100, Surabaya",
      qrCode: "QR-LANSIA-001",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      isActive: true,
    },
  ];

  for (const visitor of visitors) {
    await prisma.visitor.upsert({
      where: { id: visitor.id },
      update: {},
      create: visitor,
    });
  }

  console.log("✅ Visitors Seeded");
}