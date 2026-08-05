import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { ArsipService } from "@/services/arsip.service";
import { z } from "zod";
import { ApiResponse } from "@/types";
import { logAudit } from "@/lib/audit";
import { createSignedStorageUrl, removeSupabaseStorageFile } from "@/lib/supabase/admin";

const updateArchiveSchema = z.object({
  categoryId: z.number().optional(),
  title: z.string().min(2, "Judul dokumen minimal 2 karakter.").optional(),
  description: z.string().optional().nullable(),
  fileUrl: z.string().optional(),
});

// GET /api/arsip/[id]
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
    const archiveId = parseInt(id);
    if (isNaN(archiveId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID dokumen tidak valid." },
        { status: 400 }
      );
    }

    const archive = await ArsipService.getById(archiveId);
    if (!archive) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Dokumen tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { ...archive, fileUrl: await createSignedStorageUrl(archive.fileUrl) },
    });
  } catch (error: unknown) {
    console.error("Get arsip detail error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// PATCH /api/arsip/[id]
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
    const archiveId = parseInt(id);
    if (isNaN(archiveId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID dokumen tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = updateArchiveSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error.issues[0]?.message || "Input tidak valid." },
        { status: 400 }
      );
    }

    const current = await ArsipService.getById(archiveId);
    if (!current) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Dokumen tidak ditemukan." },
        { status: 404 }
      );
    }

    const updated = await ArsipService.update(archiveId, validation.data);

    if (validation.data.fileUrl && validation.data.fileUrl !== current.fileUrl) {
      try {
        await removeSupabaseStorageFile(current.fileUrl);
      } catch (storageError) {
        console.warn("File arsip lama tidak dapat dihapus dari Supabase Storage:", storageError);
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { ...updated, fileUrl: await createSignedStorageUrl(updated.fileUrl) },
      message: "Data dokumen berhasil diperbarui.",
    });
  } catch (error: unknown) {
    console.error("Update arsip error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// DELETE /api/arsip/[id]
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
    const archiveId = parseInt(id);
    if (isNaN(archiveId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID dokumen tidak valid." },
        { status: 400 }
      );
    }

    const archive = await ArsipService.getById(archiveId);
    if (!archive) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Dokumen tidak ditemukan." },
        { status: 404 }
      );
    }

    await ArsipService.delete(archiveId);

    try {
      await removeSupabaseStorageFile(archive.fileUrl);
    } catch (storageError) {
      console.warn("File arsip tidak dapat dihapus dari Supabase Storage:", storageError);
    }

    await logAudit({
      action: "DELETE_ARCHIVE",
      userId: session.userId,
      details: { archiveId },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Dokumen berhasil dihapus.",
    });
  } catch (error: unknown) {
    console.error("Delete arsip error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
