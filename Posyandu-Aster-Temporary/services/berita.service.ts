import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ApiResponse } from "@/types";

// ─── Type Definitions ───────────────────────────────────────────────────────

export interface NewsFilterParams {
  search?: string;
  categoryId?: number;
  isPublished?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateNewsInput {
  title: string;
  categoryId?: number;
  authorId: number;
  excerpt?: string | null;
  content: string;
  thumbnail?: string | null;
  isPublished?: boolean;
}

export interface UpdateNewsInput {
  title?: string;
  categoryId?: number;
  excerpt?: string | null;
  content?: string;
  thumbnail?: string | null;
  isPublished?: boolean;
}

export interface NewsDTO {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnail: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category?: { id: number; name: string } | null;
  author?: { id: number; fullName: string } | null;
}

// ─── Slug Helper ─────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── BeritaService ────────────────────────────────────────────────────────────

export class BeritaService {
  /**
   * Ambil daftar berita dengan filter opsional.
   */
  static async getAll(params: NewsFilterParams = {}): Promise<NewsDTO[]> {
    const where: Prisma.NewsWhereInput = {};

    if (typeof params.isPublished === "boolean") {
      where.isPublished = params.isPublished;
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
      ];
    }

    return prisma.news.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        author: { select: { id: true, fullName: true } },
      },
    });
  }

  /**
   * Ambil daftar berita dengan pagination.
   */
  static async getAllPaginated(params: NewsFilterParams = {}) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.NewsWhereInput = {};

    if (typeof params.isPublished === "boolean") {
      where.isPublished = params.isPublished;
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.news.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          author: { select: { id: true, fullName: true } },
        },
      }),
      prisma.news.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Ambil detail satu berita berdasarkan ID.
   */
  static async getById(id: number): Promise<NewsDTO | null> {
    return prisma.news.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        author: { select: { id: true, fullName: true } },
      },
    });
  }

  /**
   * Buat berita baru.
   */
  static async create(input: CreateNewsInput): Promise<NewsDTO> {
    const title = input.title.trim();
    const baseSlug = slugify(title);
    const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

    const excerpt =
      input.excerpt?.trim() ||
      input.content.slice(0, 150) + "...";

    return prisma.news.create({
      data: {
        title,
        slug,
        categoryId: input.categoryId ?? 1,
        authorId: input.authorId,
        excerpt,
        content: input.content.trim(),
        thumbnail: input.thumbnail ?? null,
        isPublished: input.isPublished ?? true,
        publishedAt: (input.isPublished ?? true) ? new Date() : null,
      },
      include: {
        category: { select: { id: true, name: true } },
        author: { select: { id: true, fullName: true } },
      },
    });
  }

  /**
   * Update berita yang sudah ada.
   */
  static async update(id: number, input: UpdateNewsInput): Promise<NewsDTO> {
    const data: Prisma.NewsUpdateInput = {};

    if (input.title !== undefined) {
      data.title = input.title.trim();
    }
    if (input.categoryId !== undefined) {
      data.category = { connect: { id: input.categoryId } };
    }
    if (input.excerpt !== undefined) {
      data.excerpt = input.excerpt?.trim() ?? undefined;
    }
    if (input.content !== undefined) {
      data.content = input.content.trim();
    }
    if (input.thumbnail !== undefined) {
      data.thumbnail = input.thumbnail ?? null;
    }
    if (input.isPublished !== undefined) {
      data.isPublished = input.isPublished;
      if (input.isPublished) {
        data.publishedAt = new Date();
      }
    }

    return prisma.news.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true } },
        author: { select: { id: true, fullName: true } },
      },
    });
  }

  /**
   * Hapus berita berdasarkan ID.
   */
  static async delete(id: number): Promise<{ id: number }> {
    return prisma.news.delete({ where: { id } });
  }

  /**
   * Cek apakah berita dengan ID tertentu ada.
   */
  static async exists(id: number): Promise<boolean> {
    const count = await prisma.news.count({ where: { id } });
    return count > 0;
  }
}
