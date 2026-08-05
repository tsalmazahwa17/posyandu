import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { ApiResponse } from "@/types";

// GET /api/monitoring — Informasi modul monitoring
export async function GET() {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Tidak terautentikasi." },
        { status: 401 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Modul API Monitoring Kesehatan Posyandu Aster Aktif.",
      data: {
        categories: [
          { key: "balita", name: "Balita (Bulan 1-12)" },
          { key: "bumil", name: "Ibu Hamil (Bumil)" },
          { key: "remaja", name: "Remaja & Sekolah" },
          { key: "produktif", name: "Usia Produktif" },
          { key: "lansia", name: "Lanjut Usia (Lansia)" },
        ],
      },
    });
  } catch (error: unknown) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: (error as Error)?.message || "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}
