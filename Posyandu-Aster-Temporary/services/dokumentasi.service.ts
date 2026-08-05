import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ─── Type Definitions ────────────────────────────────────────────────────────

export type MediaType = "PHOTO" | "VIDEO";

export interface DokumentasiFilterParams {
  search?: string;
  mediaType?: MediaType;
}

export interface CreateDokumentasiInput {
  title: string;
  description?: string | null;
  mediaType?: MediaType;
  fileUrl: string;
  activityDate?: string | Date;
  uploadedBy: number;
}

export interface UpdateDokumentasiInput {
  title?: string;
  description?: string | null;
  mediaType?: MediaType;
  fileUrl?: string;
  activityDate?: string | Date;
}

export interface DokumentasiDTO {
  id: number;
  title: string;
  description: string | null;
  mediaType: string;
  fileUrl: string;
  activityDate: Date;
  createdAt: Date;
  updatedAt: Date;
  uploader?: { id: number; fullName: string } | null;
}

// ─── DokumentasiService ───────────────────────────────────────────────────────

export class DokumentasiService {
  /**
   * Ambil semua item galeri dokumentasi dengan filter opsional.
   */
  static async getAll(params: DokumentasiFilterParams = {}): Promise<DokumentasiDTO[]> {
    const where: Prisma.DocumentationWhereInput = {};

    if (params.mediaType === "PHOTO" || params.mediaType === "VIDEO") {
      where.mediaType = params.mediaType;
    }

    if (params.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    return prisma.documentation.findMany({
      where,
      orderBy: { activityDate: "desc" },
      include: {
        uploader: { select: { id: true, fullName: true } },
      },
    });
  }

  /**
   * Ambil detail satu dokumentasi berdasarkan ID.
   */
  static async getById(id: number): Promise<DokumentasiDTO | null> {
    return prisma.documentation.findUnique({
      where: { id },
      include: {
        uploader: { select: { id: true, fullName: true } },
      },
    });
  }

  /**
   * Tambah entri dokumentasi baru.
   */
  static async create(input: CreateDokumentasiInput): Promise<DokumentasiDTO> {
    return prisma.documentation.create({
      data: {
        title: input.title.trim(),
        description: input.description?.trim() ?? null,
        mediaType: input.mediaType ?? "PHOTO",
        fileUrl: input.fileUrl.trim(),
        activityDate: input.activityDate ? new Date(input.activityDate) : new Date(),
        uploadedBy: input.uploadedBy,
      },
      include: {
        uploader: { select: { id: true, fullName: true } },
      },
    });
  }

  /**
   * Update entri dokumentasi yang sudah ada.
   */
  static async update(id: number, input: UpdateDokumentasiInput): Promise<DokumentasiDTO> {
    const data: Prisma.DocumentationUpdateInput = {};

    if (input.title !== undefined) data.title = input.title.trim();
    if (input.description !== undefined) data.description = input.description?.trim() ?? null;
    if (input.mediaType !== undefined) data.mediaType = input.mediaType;
    if (input.fileUrl !== undefined) data.fileUrl = input.fileUrl.trim();
    if (input.activityDate !== undefined) data.activityDate = new Date(input.activityDate);

    return prisma.documentation.update({
      where: { id },
      data,
      include: {
        uploader: { select: { id: true, fullName: true } },
      },
    });
  }

  /**
   * Hapus entri dokumentasi berdasarkan ID.
   */
  static async delete(id: number): Promise<{ id: number }> {
    return prisma.documentation.delete({ where: { id } });
  }

  /**
   * Cek apakah entri ada.
   */
  static async exists(id: number): Promise<boolean> {
    const count = await prisma.documentation.count({ where: { id } });
    return count > 0;
  }
}
