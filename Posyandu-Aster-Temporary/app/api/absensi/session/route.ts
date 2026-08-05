import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { AbsensiService } from "@/services/absensi.service";
import { z } from "zod";
import { ApiResponse } from "@/types";

const createSessionSchema = z.object({
  sessionDate: z.string().optional(),
  notes: z.string().optional().nullable(),
  durationMinutes: z.number().int().positive().optional(),
});

const closeSessionSchema = z.object({
  sessionId: z.number(),
});

// GET /api/absensi/session — Ambil sesi Posyandu yang sedang OPEN (untuk menampilkan ulang QR)
export async function GET(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Tidak terautentikasi." },
        { status: 401 }
      );
    }

    // Semua role yang sudah login boleh membaca status sesi aktif.
    // MASYARAKAT butuh ini untuk menampilkan UI Scan QR dan mengecek apakah
    // sesi Posyandu hari ini sedang buka sebelum memindai.

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || undefined;

    const activeSession = await AbsensiService.getActiveSession(date);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: activeSession,
    });
  } catch (error: unknown) {
    console.error("Get sesi absensi error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// POST /api/absensi/session — Kader/Admin membuka sesi Posyandu hari ini & menghasilkan token QR
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

    const body = await request.json().catch(() => ({}));
    const validation = createSessionSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Input tidak valid.";
      return NextResponse.json<ApiResponse>(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const newSession = await AbsensiService.createPosyanduSession(
      session.userId,
      validation.data
    );

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: newSession,
        message: "Sesi Posyandu berhasil dibuka. Tampilkan QR ini untuk dipindai warga.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Buka sesi absensi error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Gagal membuka sesi Posyandu." },
      { status: 400 }
    );
  }
}

// PATCH /api/absensi/session — Kader/Admin menutup sesi Posyandu secara manual
export async function PATCH(request: Request) {
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
    const validation = closeSessionSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Input tidak valid.";
      return NextResponse.json<ApiResponse>(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const closed = await AbsensiService.closePosyanduSession(
      validation.data.sessionId,
      session.userId
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: closed,
      message: "Sesi Posyandu telah ditutup.",
    });
  } catch (error: unknown) {
    console.error("Tutup sesi absensi error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Gagal menutup sesi Posyandu." },
      { status: 400 }
    );
  }
}
