import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { ProdukService } from "@/services/produk.service";
import { z } from "zod";
import { ApiResponse } from "@/types";

const updateProductSchema = z.object({
  name: z.string().min(2, "Nama produk minimal 2 karakter.").optional(),
  description: z.string().optional().nullable(),
  price: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  image: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

// GET /api/produk/[id]
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
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID produk tidak valid." },
        { status: 400 }
      );
    }

    const product = await ProdukService.getById(productId);
    if (!product) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({ success: true, data: product });
  } catch (error: unknown) {
    console.error("Get produk error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// PATCH /api/produk/[id]
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
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID produk tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = updateProductSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Input tidak valid.";
      return NextResponse.json<ApiResponse>(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const exists = await ProdukService.exists(productId);
    if (!exists) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    const updated = await ProdukService.update(productId, validation.data);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updated,
      message: "Data produk berhasil diperbarui.",
    });
  } catch (error: unknown) {
    console.error("Update produk error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// DELETE /api/produk/[id]
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
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID produk tidak valid." },
        { status: 400 }
      );
    }

    const exists = await ProdukService.exists(productId);
    if (!exists) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    await ProdukService.delete(productId);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Produk berhasil dihapus.",
    });
  } catch (error: unknown) {
    console.error("Delete produk error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
