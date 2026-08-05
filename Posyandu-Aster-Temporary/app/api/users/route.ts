import { NextResponse } from "next/server";
import { UserService } from "@/services/user.service";
import { getAuthenticatedSession } from "@/lib/auth";
import { z } from "zod";

const createUserSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter.").max(100),
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(8, "Kata sandi minimal 8 karakter."),
  role: z.enum(["ADMIN", "KADER", "MASYARAKAT"], {
    error: "Role tidak valid. Pilih ADMIN, KADER, atau MASYARAKAT.",
  }),
  visitorId: z.number().int().positive().optional().nullable(),
});

// GET /api/users — Daftar semua user (ADMIN only)
export async function GET(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ message: "Akses ditolak. Hanya admin." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") as "ADMIN" | "KADER" | "MASYARAKAT" | null;

    const users = await UserService.getAll({
      search,
      role: role || undefined,
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// POST /api/users — Buat user baru (ADMIN only)
export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ message: "Akses ditolak. Hanya admin." }, { status: 403 });
    }

    const body = await request.json();
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Input tidak valid.";
      return NextResponse.json({ message: errorMessage }, { status: 400 });
    }

    const { fullName, email, password, role, visitorId } = validation.data;

    const newUser = await UserService.create({
      fullName,
      email,
      password,
      role,
      visitorId: typeof visitorId === "number" ? visitorId : null,
      mustChangePassword: true,
    });

    return NextResponse.json(
      { message: "Akun berhasil dibuat.", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan pada server.";
    const isDuplicate = msg.includes("sudah terdaftar");
    const isValidation = msg.includes("Kata sandi") || msg.includes("Nama") || msg.includes("email");
    return NextResponse.json(
      { message: msg },
      { status: isDuplicate ? 409 : isValidation ? 400 : 500 }
    );
  }
}
