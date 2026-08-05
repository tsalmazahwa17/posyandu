import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { UserService } from "@/services/user.service";

// GET /api/users/[id] — Detail user by ID (ADMIN only)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
    }

    const user = await UserService.getById(userId);
    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

// PATCH /api/users/[id] — Update user (ADMIN only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
    }

    const body = await request.json();
    const { fullName, email, role, isActive, visitorId } = body;

    // Cek user ada
    const exists = await UserService.exists(userId);
    if (!exists) {
      return NextResponse.json({ message: "User tidak ditemukan." }, { status: 404 });
    }

    // Admin tidak bisa ubah role dirinya sendiri
    if (userId === session.userId && role && role !== session.role) {
      return NextResponse.json(
        { message: "Anda tidak dapat mengubah role akun Anda sendiri." },
        { status: 400 }
      );
    }

    const updatedUser = await UserService.update(userId, {
      fullName,
      email,
      role,
      isActive,
      visitorId: visitorId !== undefined ? (typeof visitorId === "number" ? visitorId : null) : undefined,
    });

    return NextResponse.json(
      { message: "Data user berhasil diperbarui.", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update user error:", error);
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan pada server.";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

// DELETE /api/users/[id] — Hapus user (ADMIN only)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
    }

    // Admin tidak bisa hapus dirinya sendiri
    if (userId === session.userId) {
      return NextResponse.json(
        { message: "Anda tidak dapat menghapus akun Anda sendiri." },
        { status: 400 }
      );
    }

    const exists = await UserService.exists(userId);
    if (!exists) {
      return NextResponse.json({ message: "User tidak ditemukan." }, { status: 404 });
    }

    await UserService.delete(userId);

    return NextResponse.json({ message: "Akun berhasil dihapus." }, { status: 200 });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
