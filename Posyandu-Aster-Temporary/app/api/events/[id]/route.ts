import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types";

// PATCH /api/events/[id]
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
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, location, startDate, endDate, isPublished } = body;

    if (title !== undefined && !title.trim()) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Judul jadwal tidak boleh kosong." },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (location !== undefined) updateData.location = location?.trim() || null;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updated,
      message: "Jadwal berhasil diperbarui.",
    });
  } catch (error: unknown) {
    console.error("PATCH /api/events/[id] error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]
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
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID tidak valid." },
        { status: 400 }
      );
    }

    await prisma.event.delete({ where: { id: eventId } });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Jadwal berhasil dihapus.",
    });
  } catch (error: unknown) {
    console.error("DELETE /api/events/[id] error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
