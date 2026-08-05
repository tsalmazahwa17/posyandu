import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import { getAuthenticatedSession } from "@/lib/auth";
import { isPasswordWithinBcryptLimit, validateNewPassword } from "@/utils/password";

interface ChangePasswordBody {
  currentPassword?: unknown;
  newPassword?: unknown;
  confirmPassword?: unknown;
}

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedSession();

    if (!session) {
      return NextResponse.json(
        { message: "Sesi tidak ditemukan. Silakan login kembali." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as ChangePasswordBody;
    const currentPassword =
      typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword =
      typeof body.newPassword === "string" ? body.newPassword : "";
    const confirmPassword =
      typeof body.confirmPassword === "string" ? body.confirmPassword : "";

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: "Semua kolom wajib diisi." },
        { status: 400 }
      );
    }

    if (!isPasswordWithinBcryptLimit(currentPassword)) {
      return NextResponse.json(
        { message: "Kata sandi lama tidak sesuai." },
        { status: 401 }
      );
    }

    const passwordValidationError = validateNewPassword(newPassword);
    if (passwordValidationError) {
      return NextResponse.json(
        { message: passwordValidationError },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "Konfirmasi kata sandi tidak cocok." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { message: "Akun tidak ditemukan atau sudah dinonaktifkan." },
        { status: 404 }
      );
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      return NextResponse.json(
        { message: "Kata sandi lama tidak sesuai." },
        { status: 401 }
      );
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return NextResponse.json(
        { message: "Kata sandi baru tidak boleh sama dengan kata sandi lama." },
        { status: 400 }
      );
    }

    const passwordChangedAt = new Date();
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: passwordHash,
          mustChangePassword: false,
          passwordChangedAt,
        },
      }),
      prisma.passwordResetRequest.updateMany({
        where: { userId: user.id, status: "PENDING" },
        data: {
          status: "RESOLVED",
          handledAt: passwordChangedAt,
          notes: "Diselesaikan setelah pengguna mengganti kata sandi.",
        },
      }),
    ]);

    await setSessionCookie({
      userId: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      mustChangePassword: false,
      remember: session.remember,
      visitorId: updatedUser.visitorId,
    });

    return NextResponse.json({ message: "Kata sandi berhasil diperbarui." });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "Format permintaan tidak valid." },
        { status: 400 }
      );
    }

    console.error("Change password error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server. Coba lagi nanti." },
      { status: 500 }
    );
  }
}
