import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { SasaranService } from "@/services/sasaran.service";
import { z } from "zod";
import { ApiResponse } from "@/types";

const createVisitorSchema = z.object({
  categoryId: z.number(),
  nik: z.string().optional().nullable(),
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter."),
  gender: z.enum(["MALE", "FEMALE"]),
  birthPlace: z.string().optional().nullable(),
  birthDate: z.string(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  photo: z.string().optional().nullable(),
});

// GET /api/sasaran — Daftar sasaran (with search, filter, pagination)
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
    const categoryId = searchParams.get("categoryId")
      ? parseInt(searchParams.get("categoryId")!)
      : undefined;
    const statusParam = searchParams.get("status");
    let isActive: boolean | undefined = true; // Default show active
    if (statusParam === "nonaktif" || statusParam === "false") {
      isActive = false;
    } else if (statusParam === "semua" || statusParam === "all") {
      isActive = undefined;
    }

    const includeStats = searchParams.get("includeStats") === "true";

    const [result, stats] = await Promise.all([
      SasaranService.getAll({
        page,
        limit,
        search,
        categoryId,
        isActive,
      }),
      includeStats ? SasaranService.getSummaryStats() : Promise.resolve(null),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: includeStats ? { ...result, stats } : result,
    });
  } catch (error: unknown) {
    console.error("Get sasaran error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: (error as Error)?.message || "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}

// POST /api/sasaran — Buat data sasaran baru
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
    const validation = createVisitorSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Input tidak valid.";
      return NextResponse.json<ApiResponse>(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const newVisitor = await SasaranService.create(validation.data);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: newVisitor,
        message: "Data sasaran berhasil ditambahkan.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create sasaran error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: (error as Error)?.message || "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}
