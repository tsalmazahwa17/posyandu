import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ─── Type Definitions ────────────────────────────────────────────────────────

export interface ProdukFilterParams {
  search?: string;
  isActive?: boolean;
}

export interface CreateProdukInput {
  name: string;
  description?: string | null;
  price: number;
  stock?: number;
  image?: string | null;
  isActive?: boolean;
}

export interface UpdateProdukInput {
  name?: string;
  description?: string | null;
  price?: number;
  stock?: number;
  image?: string | null;
  isActive?: boolean;
}

export interface ProdukDTO {
  id: number;
  name: string;
  description: string | null;
  price: number; // already converted from Decimal
  stock: number;
  image: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── ProdukService ────────────────────────────────────────────────────────────

export class ProdukService {
  /**
   * Ambil semua produk dengan filter opsional.
   */
  static async getAll(params: ProdukFilterParams = {}): Promise<ProdukDTO[]> {
    const where: Prisma.ProductWhereInput = {};

    if (typeof params.isActive === "boolean") {
      where.isActive = params.isActive;
    }

    if (params.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Konversi Decimal ke number untuk serialisasi JSON
    return products.map((p) => ({
      ...p,
      price: Number(p.price),
    }));
  }

  /**
   * Ambil detail satu produk berdasarkan ID.
   */
  static async getById(id: number): Promise<ProdukDTO | null> {
    const p = await prisma.product.findUnique({ where: { id } });
    if (!p) return null;
    return { ...p, price: Number(p.price) };
  }

  /**
   * Buat produk baru.
   */
  static async create(input: CreateProdukInput): Promise<ProdukDTO> {
    const p = await prisma.product.create({
      data: {
        name: input.name.trim(),
        description: input.description?.trim() ?? null,
        price: input.price,
        stock: input.stock ?? 0,
        image: input.image ?? null,
        isActive: input.isActive ?? true,
      },
    });
    return { ...p, price: Number(p.price) };
  }

  /**
   * Update produk yang sudah ada.
   */
  static async update(id: number, input: UpdateProdukInput): Promise<ProdukDTO> {
    const data: Prisma.ProductUpdateInput = {};

    if (input.name !== undefined) data.name = input.name.trim();
    if (input.description !== undefined) data.description = input.description?.trim() ?? null;
    if (input.price !== undefined) data.price = input.price;
    if (input.stock !== undefined) data.stock = input.stock;
    if (input.image !== undefined) data.image = input.image ?? null;
    if (input.isActive !== undefined) data.isActive = input.isActive;

    const p = await prisma.product.update({ where: { id }, data });
    return { ...p, price: Number(p.price) };
  }

  /**
   * Hapus produk berdasarkan ID.
   */
  static async delete(id: number): Promise<{ id: number }> {
    return prisma.product.delete({ where: { id } });
  }

  /**
   * Update stok produk saja.
   */
  static async updateStock(id: number, stock: number): Promise<ProdukDTO> {
    const p = await prisma.product.update({
      where: { id },
      data: { stock },
    });
    return { ...p, price: Number(p.price) };
  }

  /**
   * Toggle status aktif/nonaktif produk.
   */
  static async toggleActive(id: number, isActive: boolean): Promise<ProdukDTO> {
    const p = await prisma.product.update({
      where: { id },
      data: { isActive },
    });
    return { ...p, price: Number(p.price) };
  }

  /**
   * Cek apakah produk dengan ID tertentu ada.
   */
  static async exists(id: number): Promise<boolean> {
    const count = await prisma.product.count({ where: { id } });
    return count > 0;
  }
}
