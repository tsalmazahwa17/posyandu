import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ─── Type Definitions ────────────────────────────────────────────────────────

export interface ArsipFilterParams {
  search?: string;
  categoryId?: number;
}

export interface CreateArsipInput {
  categoryId: number;
  title: string;
  description?: string | null;
  fileUrl: string;
  uploadedBy: number;
}

export interface UpdateArsipInput {
  categoryId?: number;
  title?: string;
  description?: string | null;
  fileUrl?: string;
}

export interface ArsipDTO {
  id: number;
  title: string;
  description: string | null;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
  category?: { id: number; name: string } | null;
  uploader?: { id: number; fullName: string } | null;
}

// ─── ArsipService ─────────────────────────────────────────────────────────────

export class ArsipService {
  /**
   * Ambil semua arsip / dokumen digital dengan filter opsional.
   */
  static async getAll(params: ArsipFilterParams = {}): Promise<ArsipDTO[]> {
    const where: Prisma.ArchiveWhereInput = {};

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    return prisma.archive.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        uploader: { select: { id: true, fullName: true } },
      },
    });
  }

  /**
   * Ambil detail satu arsip berdasarkan ID.
   */
  static async getById(id: number): Promise<ArsipDTO | null> {
    return prisma.archive.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        uploader: { select: { id: true, fullName: true } },
      },
    });
  }

  /**
   * Upload / tambah entri arsip baru.
   */
  static async create(input: CreateArsipInput): Promise<ArsipDTO> {
    return prisma.archive.create({
      data: {
        categoryId: input.categoryId,
        title: input.title.trim(),
        description: input.description?.trim() ?? null,
        fileUrl: input.fileUrl.trim(),
        uploadedBy: input.uploadedBy,
      },
      include: {
        category: { select: { id: true, name: true } },
        uploader: { select: { id: true, fullName: true } },
      },
    });
  }

  /**
   * Update data arsip yang sudah ada.
   */
  static async update(id: number, input: UpdateArsipInput): Promise<ArsipDTO> {
    const data: Prisma.ArchiveUpdateInput = {};

    if (input.categoryId !== undefined) {
      data.category = { connect: { id: input.categoryId } };
    }
    if (input.title !== undefined) data.title = input.title.trim();
    if (input.description !== undefined) data.description = input.description?.trim() ?? null;
    if (input.fileUrl !== undefined) data.fileUrl = input.fileUrl.trim();

    return prisma.archive.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true } },
        uploader: { select: { id: true, fullName: true } },
      },
    });
  }

  /**
   * Hapus arsip berdasarkan ID.
   */
  static async delete(id: number): Promise<{ id: number }> {
    return prisma.archive.delete({ where: { id } });
  }

  /**
   * Cek apakah arsip dengan ID tertentu ada.
   */
  static async exists(id: number): Promise<boolean> {
    const count = await prisma.archive.count({ where: { id } });
    return count > 0;
  }
}
