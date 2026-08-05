import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { ArsipService } from "@/services/arsip.service";
import { z } from "zod";
import { ApiResponse } from "@/types";
import { createSignedStorageUrl } from "@/lib/supabase/admin";

const createArchiveSchema = z.object({
  categoryId: z.number(),
  title: z.string().min(2, "Judul dokumen minimal 2 karakter."),
  description: z.string().optional().nullable(),
  fileUrl: z.string().min(1, "URL file wajib diisi."),
});

// GET /api/arsip — Daftar arsip digital / dokumen SOP
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

    const archives = await ArsipService.getAll({ search, categoryId });
    const accessibleArchives = await Promise.all(
      archives.map(async (archive) => ({
        ...archive,
        fileUrl: await createSignedStorageUrl(archive.fileUrl),
      }))
    );

    return NextResponse.json<ApiResponse>({ success: true, data: accessibleArchives });
  } catch (error: unknown) {
    console.error("Get arsip error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// POST /api/arsip — Upload / tambah arsip dokumen baru (ADMIN & KADER)
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
    const validation = createArchiveSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Input tidak valid.";
      return NextResponse.json<ApiResponse>(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const archive = await ArsipService.create({
      categoryId: validation.data.categoryId,
      title: validation.data.title,
      description: validation.data.description ?? null,
      fileUrl: validation.data.fileUrl,
      uploadedBy: session.userId,
    });

    const accessibleArchive = {
      ...archive,
      fileUrl: await createSignedStorageUrl(archive.fileUrl),
    };

    return NextResponse.json<ApiResponse>(
      { success: true, data: accessibleArchive, message: "Arsip dokumen berhasil diunggah." },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create arsip error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
