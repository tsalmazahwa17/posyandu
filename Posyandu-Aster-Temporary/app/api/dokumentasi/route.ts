import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { DokumentasiService } from "@/services/dokumentasi.service";
import { z } from "zod";
import { ApiResponse } from "@/types";

const createDocumentationSchema = z.object({
  title: z.string().min(2, "Judul dokumentasi minimal 2 karakter."),
  description: z.string().optional().nullable(),
  mediaType: z.enum(["PHOTO", "VIDEO"]).default("PHOTO"),
  fileUrl: z.string().min(1, "URL foto atau video wajib diisi."),
  activityDate: z.string().optional(),
});

// GET /api/dokumentasi — Galeri foto / video kegiatan Posyandu
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
    const mediaType = searchParams.get("mediaType") as "PHOTO" | "VIDEO" | null;

    const documentations = await DokumentasiService.getAll({
      search,
      mediaType: mediaType === "PHOTO" || mediaType === "VIDEO" ? mediaType : undefined,
    });

    return NextResponse.json<ApiResponse>({ success: true, data: documentations });
  } catch (error: unknown) {
    console.error("Get dokumentasi error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// POST /api/dokumentasi — Unggah dokumentasi baru (ADMIN & KADER)
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
    const validation = createDocumentationSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Input tidak valid.";
      return NextResponse.json<ApiResponse>(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const doc = await DokumentasiService.create({
      title: validation.data.title,
      description: validation.data.description ?? null,
      mediaType: validation.data.mediaType,
      fileUrl: validation.data.fileUrl,
      activityDate: validation.data.activityDate,
      uploadedBy: session.userId,
    });

    return NextResponse.json<ApiResponse>(
      { success: true, data: doc, message: "Dokumentasi berhasil diunggah." },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create dokumentasi error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
