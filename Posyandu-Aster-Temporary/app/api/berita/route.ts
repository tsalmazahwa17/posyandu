import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { BeritaService } from "@/services/berita.service";
import { z } from "zod";
import { ApiResponse } from "@/types";

const createNewsSchema = z.object({
  title: z.string().min(3, "Judul berita minimal 3 karakter."),
  categoryId: z.number().default(1),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(5, "Isi berita minimal 5 karakter."),
  thumbnail: z.string().optional().nullable(),
  isPublished: z.boolean().default(true),
});

// GET /api/berita — Daftar berita & pengumuman
export async function GET(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Tidak terautentikasi." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId")
      ? parseInt(searchParams.get("categoryId")!)
      : undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    if (page || limit) {
      const paginated = await BeritaService.getAllPaginated({ search, categoryId, page, limit });
      return NextResponse.json<ApiResponse>({ success: true, data: paginated });
    }

    const newsList = await BeritaService.getAll({ search, categoryId });
    return NextResponse.json<ApiResponse>({ success: true, data: newsList });
  } catch (error: unknown) {
    console.error("Get berita error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// POST /api/berita — Tulis berita / pengumuman baru (ADMIN & KADER)
export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Tidak terautentikasi." },
        { status: 401 }
      );
    }

    if (session.role !== "ADMIN" && session.role !== "KADER") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Akses ditolak." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createNewsSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Input tidak valid.";
      return NextResponse.json<ApiResponse>(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const newNews = await BeritaService.create({
      title: validation.data.title,
      categoryId: validation.data.categoryId,
      authorId: session.userId,
      excerpt: validation.data.excerpt ?? null,
      content: validation.data.content,
      thumbnail: validation.data.thumbnail ?? null,
      isPublished: validation.data.isPublished,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: newNews,
        message: "Berita / pengumuman berhasil dipublikasikan.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create berita error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
