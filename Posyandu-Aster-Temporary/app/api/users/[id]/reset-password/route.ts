import { randomInt } from "node:crypto";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedSession } from "@/lib/auth";

function generateTemporaryPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  return Array.from({ length: 14 }, () => alphabet[randomInt(0, alphabet.length)]).join("");
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ message: "Akses ditolak. Hanya admin." }, { status: 403 });
    }

    const { id } = await params;
    const userId = Number.parseInt(id, 10);
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true },
    });
    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan." }, { status: 404 });
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    const handledAt = new Date();
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: passwordHash,
          mustChangePassword: true,
          passwordChangedAt: null,
        },
      }),
      prisma.passwordResetRequest.updateMany({
        where: { userId: user.id, status: "PENDING" },
        data: {
          status: "RESOLVED",
          handledAt,
          notes: `Kata sandi sementara dibuat oleh ${session.fullName}.`,
        },
      }),
    ]);

    return NextResponse.json({
      message: "Kata sandi berhasil direset. Bagikan kata sandi sementara secara aman.",
      tempPassword: temporaryPassword,
      userName: user.fullName,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
