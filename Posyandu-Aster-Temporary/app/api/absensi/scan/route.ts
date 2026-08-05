import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { AbsensiService } from "@/services/absensi.service";
import { z } from "zod";
import { ApiResponse } from "@/types";

const scanQRSchema = z.object({
  qrCode: z.string().min(1),
});

// POST /api/absensi/scan — Catat presensi via Scan QR Code
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
    const validation = scanQRSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Input tidak valid.";
      return NextResponse.json<ApiResponse>(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const attendance = await AbsensiService.recordByQRCode(
      validation.data.qrCode,
      session.userId
    );

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: attendance,
        message: "Presensi via Scan QR Code berhasil.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Scan QR absensi error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: (error as Error)?.message || "Gagal melakukan presensi QR Code.",
      },
      { status: 400 }
    );
  }
}
