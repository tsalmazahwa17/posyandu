import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import { clearRateLimit, consumeRateLimit } from "@/lib/rate-limit";
import { isPasswordWithinBcryptLimit } from "@/utils/password";

interface LoginBody {
  email?: unknown;
  password?: unknown;
  remember?: unknown;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const remember = body.remember === true;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    if (!isPasswordWithinBcryptLimit(password)) {
      return NextResponse.json(
        { message: "Email atau kata sandi tidak valid." },
        { status: 401 }
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { message: "Format alamat email tidak valid." },
        { status: 400 }
      );
    }

    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const clientId = forwardedFor || request.headers.get("x-real-ip") || "unknown";
    const rateLimitKey = `login:${clientId}:${email}`;
    const rateLimit = await consumeRateLimit(rateLimitKey, 6, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "Terlalu banyak percobaan login. Coba lagi beberapa saat." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { message: "Email atau kata sandi tidak valid." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { message: "Akun Anda dinonaktifkan. Silakan hubungi Administrator." },
        { status: 403 }
      );
    }

    await clearRateLimit(rateLimitKey);

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      remember,
      visitorId: user.visitorId,
    });

    return NextResponse.json({
      message: "Login berhasil.",
      mustChangePassword: user.mustChangePassword,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        visitorId: user.visitorId,
      },
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "Format permintaan tidak valid." },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server. Coba lagi nanti." },
      { status: 500 }
    );
  }
}
