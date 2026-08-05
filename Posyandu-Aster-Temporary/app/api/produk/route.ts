import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { ProdukService } from "@/services/produk.service";
import { z } from "zod";
import { ApiResponse } from "@/types";

const productSchema = z.object({
  name: z.string().min(2, "Nama produk minimal 2 karakter."),
  description: z.string().optional().nullable(),
  price: z.number().nonnegative("Harga tidak boleh negatif."),
  stock: z.number().int().nonnegative("Stok tidak boleh negatif.").default(0),
  image: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

// GET /api/produk — Daftar produk PMT / UMKM
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
    const isActive = searchParams.get("isActive");

    const products = await ProdukService.getAll({
      search,
      isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
    });

    return NextResponse.json<ApiResponse>({ success: true, data: products });
  } catch (error: unknown) {
    console.error("Get produk error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// POST /api/produk — Tambah produk baru (ADMIN & KADER)
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
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Input tidak valid.";
      return NextResponse.json<ApiResponse>(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const product = await ProdukService.create(validation.data);

    return NextResponse.json<ApiResponse>(
      { success: true, data: product, message: "Produk berhasil ditambahkan." },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create produk error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
