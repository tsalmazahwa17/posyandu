// prisma/seeds/products.ts
import { PrismaClient } from "@prisma/client";

export async function seedProducts(prisma: PrismaClient) {
  const records = [
    {
      id: 1,
      name: "Biskuit Sehat Balita",
      description: "Biskuit bergizi tinggi untuk menambah tumbuh kembang anak.",
      price: 15000,
      stock: 50,
      image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e",
      isActive: true,
    },
    {
      id: 2,
      name: "Susu Formula Ibu Hamil",
      description: "Susu dengan kalsium dan zat besi tinggi.",
      price: 45000,
      stock: 20,
      image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7",
      isActive: true,
    },
  ];

  for (const record of records) {
    await prisma.product.upsert({
      where: { id: record.id },
      update: {},
      create: record,
    });
  }

  console.log("✅ Products Seeded");
}