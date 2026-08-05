import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return NextResponse.json({ message: "Sesi tidak valid." }, { status: 401 });
    if (session.role !== "ADMIN") return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });

    const requests = await prisma.passwordResetRequest.findMany({
      orderBy: [{ status: "asc" }, { requestedAt: "desc" }],
      take: 100,
      select: {
        id: true, email: true, status: true, requestedAt: true,
        user: { select: { fullName: true } },
      },
    });
    return NextResponse.json(requests.map((item) => ({
      id: item.id,
      email: item.email,
      status: item.status,
      requestedAt: item.requestedAt.toISOString(),
      userName: item.user?.fullName ?? null,
    })));
  } catch (error) {
    console.error("List password reset requests error:", error);
    return NextResponse.json({ message: "Data permintaan reset belum dapat dimuat." }, { status: 500 });
  }
}
