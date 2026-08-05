import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { DokumentasiService } from "@/services/dokumentasi.service";
import { z } from "zod";
import { ApiResponse } from "@/types";

const updateDocSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  mediaType: z.enum(["PHOTO", "VIDEO"]).optional(),
  fileUrl: z.string().optional(),
  activityDate: z.string().optional(),
});

// GET /api/dokumentasi/[id]
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
    const docId = parseInt(id);
    if (isNaN(docId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID tidak valid." },
        { status: 400 }
      );
    }

    const doc = await DokumentasiService.getById(docId);
    if (!doc) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Dokumentasi tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({ success: true, data: doc });
  } catch (error: unknown) {
    console.error("Get dokumentasi error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// PATCH /api/dokumentasi/[id]
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
    const docId = parseInt(id);
    if (isNaN(docId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = updateDocSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error.issues[0]?.message || "Input tidak valid." },
        { status: 400 }
      );
    }

    const exists = await DokumentasiService.exists(docId);
    if (!exists) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Dokumentasi tidak ditemukan." },
        { status: 404 }
      );
    }

    const updated = await DokumentasiService.update(docId, validation.data);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updated,
      message: "Dokumentasi berhasil diperbarui.",
    });
  } catch (error: unknown) {
    console.error("Update dokumentasi error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// DELETE /api/dokumentasi/[id]
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
    const docId = parseInt(id);
    if (isNaN(docId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID tidak valid." },
        { status: 400 }
      );
    }

    const exists = await DokumentasiService.exists(docId);
    if (!exists) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Dokumentasi tidak ditemukan." },
        { status: 404 }
      );
    }

    await DokumentasiService.delete(docId);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Dokumentasi berhasil dihapus.",
    });
  } catch (error: unknown) {
    console.error("Delete dokumentasi error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
