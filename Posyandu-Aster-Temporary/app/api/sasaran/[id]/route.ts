import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { SasaranService } from "@/services/sasaran.service";
import { z } from "zod";
import { ApiResponse } from "@/types";

const updateVisitorSchema = z.object({
  categoryId: z.number().optional(),
  nik: z.string().optional().nullable(),
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter.").optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  birthPlace: z.string().optional().nullable(),
  birthDate: z.string().optional(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  photo: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

// GET /api/sasaran/[id] — Detail sasaran
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
    const visitorId = parseInt(id);
    if (isNaN(visitorId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID tidak valid." },
        { status: 400 }
      );
    }

    const visitor = await SasaranService.getById(visitorId);
    if (!visitor) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Data sasaran tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: visitor,
    });
  } catch (error: unknown) {
    console.error("Get sasaran detail error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: (error as Error)?.message || "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/sasaran/[id] — Edit data sasaran
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
    const visitorId = parseInt(id);
    if (isNaN(visitorId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = updateVisitorSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Input tidak valid.";
      return NextResponse.json<ApiResponse>(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const updated = await SasaranService.update(visitorId, validation.data);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updated,
      message: "Data sasaran berhasil diperbarui.",
    });
  } catch (error: unknown) {
    console.error("Update sasaran error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: (error as Error)?.message || "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/sasaran/[id] — Soft delete sasaran
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
    const visitorId = parseInt(id);
    if (isNaN(visitorId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID tidak valid." },
        { status: 400 }
      );
    }

    await SasaranService.delete(visitorId);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Data sasaran berhasil dihapus.",
    });
  } catch (error: unknown) {
    console.error("Delete sasaran error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: (error as Error)?.message || "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}
