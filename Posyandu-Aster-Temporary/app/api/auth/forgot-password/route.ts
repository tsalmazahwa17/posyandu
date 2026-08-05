import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().trim().email("Format email tidak valid.") });
const GENERIC_MESSAGE = "Jika email terdaftar, permintaan reset telah dicatat dan akan ditinjau Administrator.";

export async function POST(request: Request) {
  try {
    const validation = schema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json({ message: validation.error.issues[0]?.message || "Input tidak valid." }, { status: 400 });
    }
    const email = validation.data.email.toLowerCase();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip") || "unknown";
    const limit = await consumeRateLimit(`password-reset:${ip}:${email}`, 3, 15 * 60_000);
    if (!limit.allowed) {
      return NextResponse.json({ message: "Terlalu banyak permintaan. Coba lagi beberapa saat." }, {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, isActive: true },
    });
    if (user?.isActive) {
      const existing = await prisma.passwordResetRequest.findFirst({
        where: { userId: user.id, status: "PENDING" },
        select: { id: true },
      });
      if (!existing) await prisma.passwordResetRequest.create({ data: { userId: user.id, email } });
    }
    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ message: "Format permintaan tidak valid." }, { status: 400 });
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Permintaan belum dapat diproses. Coba lagi nanti." }, { status: 500 });
  }
}
