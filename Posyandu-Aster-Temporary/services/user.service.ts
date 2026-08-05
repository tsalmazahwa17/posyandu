import { prisma } from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { validateNewPassword } from "@/utils/password";

// ─── Type Definitions ────────────────────────────────────────────────────────

export type AppRole = "ADMIN" | "KADER" | "MASYARAKAT";

export interface UserFilterParams {
  search?: string;
  role?: AppRole;
  isActive?: boolean;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  role?: AppRole;
  visitorId?: number | null;
  mustChangePassword?: boolean;
}

export interface UpdateUserInput {
  fullName?: string;
  email?: string;
  role?: AppRole;
  isActive?: boolean;
  visitorId?: number | null;
  mustChangePassword?: boolean;
}

export interface UserDTO {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  passwordChangedAt: Date | null;
  visitorId: number | null;
  visitor?: { id: number; fullName: string; nik: string | null } | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── UserSelect shape (reusable) ─────────────────────────────────────────────

const USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  isActive: true,
  mustChangePassword: true,
  passwordChangedAt: true,
  visitorId: true,
  visitor: {
    select: { id: true, fullName: true, nik: true },
  },
  createdAt: true,
  updatedAt: true,
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function toValidRole(r: unknown): AppRole {
  const VALID: AppRole[] = ["ADMIN", "KADER", "MASYARAKAT"];
  if (typeof r === "string" && (VALID as string[]).includes(r)) return r as AppRole;
  return "KADER";
}

// ─── UserService ──────────────────────────────────────────────────────────────

export class UserService {
  /**
   * Ambil semua user dengan filter opsional.
   */
  static async getAll(params: UserFilterParams = {}): Promise<UserDTO[]> {
    const where: Prisma.UserWhereInput = {};

    if (params.role) {
      where.role = params.role as Role;
    }

    if (typeof params.isActive === "boolean") {
      where.isActive = params.isActive;
    }

    if (params.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }

    return prisma.user.findMany({
      where,
      select: USER_SELECT,
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Ambil detail satu user berdasarkan ID.
   */
  static async getById(id: number): Promise<UserDTO | null> {
    return prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
  }

  /**
   * Ambil user berdasarkan email (untuk auth).
   */
  static async getByEmail(email: string): Promise<(UserDTO & { password: string }) | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { ...USER_SELECT, password: true },
    });
  }

  /**
   * Buat user baru dengan hashed password.
   */
  static async create(input: CreateUserInput): Promise<UserDTO> {
    const email = input.email.toLowerCase().trim();

    // Cek duplikasi email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error("Email sudah terdaftar. Gunakan email lain.");
    }

    const passwordError = validateNewPassword(input.password);
    if (passwordError) throw new Error(passwordError);
    const hashedPassword = await bcrypt.hash(input.password, 12);

    return prisma.user.create({
      data: {
        fullName: input.fullName.trim(),
        email,
        password: hashedPassword,
        role: toValidRole(input.role) as Role,
        visitorId: input.visitorId ?? null,
        isActive: true,
        mustChangePassword: input.mustChangePassword ?? true,
      },
      select: USER_SELECT,
    });
  }

  /**
   * Update data user.
   */
  static async update(id: number, input: UpdateUserInput): Promise<UserDTO> {
    const data: Prisma.UserUpdateInput = {};

    if (input.fullName !== undefined) data.fullName = input.fullName.trim();
    if (input.email !== undefined) data.email = input.email.toLowerCase().trim();
    if (input.role !== undefined) data.role = toValidRole(input.role) as Role;
    if (typeof input.isActive === "boolean") data.isActive = input.isActive;
    if (input.mustChangePassword !== undefined) data.mustChangePassword = input.mustChangePassword;

    // Handle visitorId nullable relation
    if (input.visitorId !== undefined) {
      if (input.visitorId === null) {
        data.visitor = { disconnect: true };
      } else {
        data.visitor = { connect: { id: input.visitorId } };
      }
    }

    return prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });
  }

  /**
   * Ganti password user (misalnya setelah reset atau ganti pertama kali).
   */
  static async changePassword(id: number, newPassword: string): Promise<void> {
    const passwordError = validateNewPassword(newPassword);
    if (passwordError) throw new Error(passwordError);
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id },
      data: {
        password: hashed,
        mustChangePassword: false,
        passwordChangedAt: new Date(),
      },
    });
  }

  /**
   * Toggle status aktif / nonaktif user.
   */
  static async toggleActive(id: number, isActive: boolean): Promise<UserDTO> {
    return prisma.user.update({
      where: { id },
      data: { isActive },
      select: USER_SELECT,
    });
  }

  /**
   * Hapus user berdasarkan ID (hanya admin).
   */
  static async delete(id: number): Promise<{ id: number }> {
    return prisma.user.delete({ where: { id } });
  }

  /**
   * Cek apakah user dengan ID tertentu ada.
   */
  static async exists(id: number): Promise<boolean> {
    const count = await prisma.user.count({ where: { id } });
    return count > 0;
  }

  /**
   * Hitung total user per role untuk statistik dashboard.
   */
  static async countByRole(): Promise<Record<AppRole, number>> {
    const [admin, kader, masyarakat] = await Promise.all([
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "KADER" } }),
      prisma.user.count({ where: { role: "MASYARAKAT" } }),
    ]);

    return { ADMIN: admin, KADER: kader, MASYARAKAT: masyarakat };
  }
}
