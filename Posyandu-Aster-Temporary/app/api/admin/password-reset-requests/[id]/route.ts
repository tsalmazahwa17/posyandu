import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateNewPassword } from "@/utils/password";

interface RequestBody {
  action?: unknown;
  temporaryPassword?: unknown;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ message: "Sesi tidak valid." }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
    }
    if (session.mustChangePassword) {
      return NextResponse.json(
        { message: "Ganti kata sandi akun Anda sebelum melakukan tindakan administrasi." },
        { status: 403 }
      );
    }

    const { id: rawId } = await params;
    const requestId = Number(rawId);
    if (!Number.isSafeInteger(requestId) || requestId <= 0) {
      return NextResponse.json({ message: "ID permintaan tidak valid." }, { status: 400 });
    }

    const body = (await request.json()) as RequestBody;
    const action = typeof body.action === "string" ? body.action : "";
    const temporaryPassword =
      typeof body.temporaryPassword === "string" ? body.temporaryPassword : "";

    const resetRequest = await prisma.passwordResetRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        status: true,
        userId: true,
        user: { select: { id: true, isActive: true } },
      },
    });

    if (!resetRequest) {
      return NextResponse.json({ message: "Permintaan tidak ditemukan." }, { status: 404 });
    }
    if (resetRequest.status !== "PENDING") {
      return NextResponse.json(
        { message: "Permintaan ini sudah ditindaklanjuti." },
        { status: 409 }
      );
    }

    if (action === "REJECT") {
      await prisma.passwordResetRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          handledAt: new Date(),
          notes: `Ditolak oleh ${session.fullName}.`,
        },
      });
      return NextResponse.json({ message: "Permintaan reset ditolak." });
    }

    if (action !== "RESET") {
      return NextResponse.json({ message: "Aksi tidak valid." }, { status: 400 });
    }

    const passwordValidationError = validateNewPassword(temporaryPassword);
    if (passwordValidationError) {
      return NextResponse.json(
        { message: passwordValidationError.replace("Kata sandi", "Kata sandi sementara") },
        { status: 400 }
      );
    }

    if (!resetRequest.userId || !resetRequest.user?.isActive) {
      return NextResponse.json(
        { message: "Akun terkait tidak ditemukan atau sudah nonaktif." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(temporaryPassword, 12);
    const handledAt = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRequest.user.id },
        data: {
          password: passwordHash,
          mustChangePassword: true,
          passwordChangedAt: null,
        },
      }),
      prisma.passwordResetRequest.updateMany({
        where: { userId: resetRequest.user.id, status: "PENDING" },
        data: {
          status: "RESOLVED",
          handledAt,
          notes: `Kata sandi sementara dibuat oleh ${session.fullName}.`,
        },
      }),
    ]);

    return NextResponse.json({
      message:
        "Kata sandi sementara berhasil dibuat. Sampaikan kepada pengguna melalui kanal yang aman.",
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "Format permintaan tidak valid." }, { status: 400 });
    }

    console.error("Handle password reset request error:", error);
    return NextResponse.json(
      { message: "Permintaan belum dapat ditindaklanjuti." },
      { status: 500 }
    );
  }
}
