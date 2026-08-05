import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { BeritaService } from "@/services/berita.service";
import { z } from "zod";
import { ApiResponse } from "@/types";
import { logAudit } from "@/lib/audit";

const updateNewsSchema = z.object({
  title: z.string().min(3, "Judul berita minimal 3 karakter.").optional(),
  categoryId: z.number().optional(),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(5, "Isi berita minimal 5 karakter.").optional(),
  thumbnail: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
});

// GET /api/berita/[id] — Detail berita
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Tidak terautentikasi." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const newsId = parseInt(id);
    if (isNaN(newsId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID berita tidak valid." },
        { status: 400 }
      );
    }

    const news = await BeritaService.getById(newsId);
    if (!news) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Berita tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({ success: true, data: news });
  } catch (error: unknown) {
    console.error("Get berita detail error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// PATCH /api/berita/[id] — Edit berita (ADMIN & KADER)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const newsId = parseInt(id);
    if (isNaN(newsId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID berita tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = updateNewsSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Input tidak valid.";
      return NextResponse.json<ApiResponse>(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const exists = await BeritaService.exists(newsId);
    if (!exists) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Berita tidak ditemukan." },
        { status: 404 }
      );
    }

    const updated = await BeritaService.update(newsId, validation.data);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updated,
      message: "Berita berhasil diperbarui.",
    });
  } catch (error: unknown) {
    console.error("Update berita error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// DELETE /api/berita/[id] — Hapus berita (ADMIN & KADER)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const newsId = parseInt(id);
    if (isNaN(newsId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID berita tidak valid." },
        { status: 400 }
      );
    }

    const exists = await BeritaService.exists(newsId);
    if (!exists) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Berita tidak ditemukan." },
        { status: 404 }
      );
    }

    await BeritaService.delete(newsId);

    await logAudit({
      action: "DELETE_NEWS",
      userId: session.userId,
      details: { newsId },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Berita berhasil dihapus.",
    });
  } catch (error: unknown) {
    console.error("Delete berita error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
