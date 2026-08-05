import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { AbsensiService } from "@/services/absensi.service";
import { z } from "zod";
import { ApiResponse, ScanQrPayload } from "@/types";

const scanSessionSchema = z.object({
  token: z.string().min(1),
});

// POST /api/absensi/scan-session — Warga (MASYARAKAT) memindai QR sesi dari dasbornya
// untuk mencatat kehadirannya sendiri secara otomatis.
// Endpoint ini terpisah dari /api/absensi/scan (yang tetap dipakai Kader untuk
// memindai QR kartu/ID sasaran secara manual di lapangan).
export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Tidak terautentikasi." },
        { status: 401 }
      );
    }

    // Warga scan QR sesi untuk dirinya sendiri. Kader/Admin tetap diizinkan
    // memanggil endpoint ini (mis. untuk membantu warga lansia yang login
    // di HP milik Kader), tapi alur utamanya adalah untuk role MASYARAKAT.
    if (session.role !== "MASYARAKAT" && session.role !== "ADMIN" && session.role !== "KADER") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Akses ditolak." },
        { status: 403 }
      );
    }

    const body: ScanQrPayload = await request.json();
    const validation = scanSessionSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Input tidak valid.";
      return NextResponse.json<ApiResponse>(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const attendance = await AbsensiService.processQrAttendance(
      validation.data.token,
      session.userId
    );

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: attendance,
        message: "Presensi berhasil dicatat. Terima kasih sudah hadir!",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Scan sesi absensi error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Gagal melakukan presensi via QR sesi." },
      { status: 400 }
    );
  }
}
