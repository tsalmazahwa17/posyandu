import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { AbsensiService } from "@/services/absensi.service";
import { z } from "zod";
import { ApiResponse } from "@/types";

const recordAttendanceSchema = z.object({
  visitorId: z.number(),
  attendanceDate: z.string().optional(),
  method: z.enum(["QR", "MANUAL"]).optional(),
  status: z.enum(["HADIR", "TIDAK_HADIR"]).optional(),
  notes: z.string().optional().nullable(),
});

// GET /api/absensi — Daftar presensi kehadiran
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const date = searchParams.get("date") || undefined;
    const categoryId = searchParams.get("categoryId")
      ? parseInt(searchParams.get("categoryId")!)
      : undefined;
    const visitorIdParam = searchParams.get("visitorId")
      ? parseInt(searchParams.get("visitorId")!)
      : undefined;

    let targetVisitorId: number | undefined = visitorIdParam;

    if (session.role === "MASYARAKAT") {
      if (!session.visitorId) {
        return NextResponse.json<ApiResponse>({
          success: true,
          data: { items: [], total: 0, page: 1, limit, totalPages: 1 },
        });
      }
      targetVisitorId = session.visitorId;
    }

    const result = await AbsensiService.getAll({
      page,
      limit,
      search,
      date,
      categoryId,
      visitorId: targetVisitorId,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error("Get absensi error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: (error as Error)?.message || "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}

// POST /api/absensi — Catat presensi manual
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
    const validation = recordAttendanceSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Input tidak valid.";
      return NextResponse.json<ApiResponse>(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const attendance = await AbsensiService.record(
      validation.data,
      session.userId
    );

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: attendance,
        message: "Presensi berhasil dicatat.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Record absensi error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: (error as Error)?.message || "Terjadi kesalahan pada server.",
      },
      { status: 400 }
    );
  }
}
