import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import {
  AbsensiSession,
  AttendanceDTO,
  AttendanceFilterParams,
  CreateAttendanceInput,
  CreateSessionInput,
  PaginatedData,
} from "@/types";

// Sesi QR default berlaku selama jam operasional Posyandu berjalan (menit)
const DEFAULT_SESSION_DURATION_MINUTES = 240; // 4 jam

import { Prisma, PosyanduSession } from "@prisma/client";

export class AbsensiService {
  static async getAll(params: AttendanceFilterParams): Promise<PaginatedData<AttendanceDTO>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.AttendanceWhereInput = {};

    if (params.date) {
      const d = new Date(params.date);
      d.setHours(0, 0, 0, 0);
      where.attendanceDate = d;
    }

    const visitorWhere: Prisma.VisitorWhereInput = {};

    if (params.categoryId) {
      visitorWhere.categoryId = params.categoryId;
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      visitorWhere.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { nik: { contains: q, mode: "insensitive" } },
      ];
    }

    if (Object.keys(visitorWhere).length > 0) {
      where.visitor = visitorWhere;
    }

    const [items, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ attendanceDate: "desc" }, { attendanceTime: "desc" }],
        include: {
          visitor: {
            select: {
              id: true,
              fullName: true,
              nik: true,
              qrCode: true,
              category: { select: { id: true, name: true } },
            },
          },
          recorder: { select: { id: true, fullName: true } },
        },
      }),
      prisma.attendance.count({ where }),
    ]);

    return {
      items: items as unknown as AttendanceDTO[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async record(data: CreateAttendanceInput, recordedBy?: number): Promise<AttendanceDTO> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceDate = data.attendanceDate ? new Date(data.attendanceDate) : today;
    attendanceDate.setHours(0, 0, 0, 0);

    // Cek duplikasi absensi di tanggal yang sama
    const existing = await prisma.attendance.findUnique({
      where: {
        visitorId_attendanceDate: {
          visitorId: data.visitorId,
          attendanceDate,
        },
      },
    });

    if (existing) {
      throw new Error("Sasaran sudah melakukan absensi pada tanggal ini.");
    }

    const newAttendance = await prisma.attendance.create({
      data: {
        visitorId: data.visitorId,
        recordedBy: recordedBy || null,
        sessionId: data.sessionId || null,
        attendanceDate,
        attendanceTime: new Date(),
        method: data.method || "MANUAL",
        status: data.status || "HADIR",
        notes: data.notes || null,
      },
      include: {
        visitor: {
          select: {
            id: true,
            fullName: true,
            nik: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
    });

    return newAttendance as unknown as AttendanceDTO;
  }

  // Scan QR statis milik sasaran (kartu/ID sasaran) — dioperasikan Kader/Admin
  static async recordByQRCode(qrCode: string, recordedBy?: number): Promise<AttendanceDTO> {
    const visitor = await prisma.visitor.findUnique({
      where: { qrCode: qrCode.trim() },
    });

    if (!visitor) {
      throw new Error("Kode QR tidak valid atau tidak terdaftar.");
    }

    if (!visitor.isActive) {
      throw new Error("Data sasaran non-aktif.");
    }

    return this.record(
      {
        visitorId: visitor.id,
        method: "QR",
        status: "HADIR",
      },
      recordedBy
    );
  }

  // ─── SESI POSYANDU (QR ABSENSI MANDIRI OLEH WARGA/MASYARAKAT) ────────────

  private static generateSessionToken(): string {
    return randomBytes(24).toString("hex");
  }

  private static toAbsensiSession(session: PosyanduSession | unknown): AbsensiSession {
    return session as unknown as AbsensiSession;
  }

  /**
   * Kader/Admin membuka sesi Posyandu hari ini dan menghasilkan token QR.
   * Jika sudah ada sesi OPEN untuk tanggal yang sama, sesi tersebut
   * dikembalikan lagi (bukan membuat duplikat) supaya QR yang sudah
   * ditampilkan/dicetak tetap valid.
   */
  static async createPosyanduSession(
    openedBy: number,
    input: CreateSessionInput = {}
  ): Promise<AbsensiSession> {
    const sessionDate = input.sessionDate ? new Date(input.sessionDate) : new Date();
    sessionDate.setHours(0, 0, 0, 0);

    const existing = await prisma.posyanduSession.findFirst({
      where: { sessionDate, status: "OPEN" },
      include: { opener: { select: { id: true, fullName: true } } },
    });

    if (existing) {
      return this.toAbsensiSession(existing);
    }

    const durationMinutes = input.durationMinutes || DEFAULT_SESSION_DURATION_MINUTES;
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    const session = await prisma.posyanduSession.create({
      data: {
        sessionDate,
        token: this.generateSessionToken(),
        status: "OPEN",
        openedBy,
        expiresAt,
        notes: input.notes || null,
      },
      include: { opener: { select: { id: true, fullName: true } } },
    });

    return this.toAbsensiSession(session);
  }

  /** Ambil sesi OPEN untuk tanggal tertentu (default hari ini). */
  static async getActiveSession(date?: string): Promise<AbsensiSession | null> {
    const sessionDate = date ? new Date(date) : new Date();
    sessionDate.setHours(0, 0, 0, 0);

    const session = await prisma.posyanduSession.findFirst({
      where: { sessionDate, status: "OPEN" },
      include: {
        opener: { select: { id: true, fullName: true } },
        _count: { select: { attendances: true } },
      },
      orderBy: { openedAt: "desc" },
    });

    if (!session) return null;

    return {
      ...this.toAbsensiSession(session),
      totalHadir: (session as { _count?: { attendances?: number } })._count?.attendances ?? undefined,
    };
  }

  /** Kader/Admin menutup sesi secara manual (opsional, sebelum otomatis expired). */
  static async closePosyanduSession(sessionId: number, closedBy: number): Promise<AbsensiSession> {
    const session = await prisma.posyanduSession.findUnique({ where: { id: sessionId } });

    if (!session) {
      throw new Error("Sesi Posyandu tidak ditemukan.");
    }

    // Siapa yang boleh menutup sesi (mis. hanya pembuka atau Admin) divalidasi
    // di route, karena informasi peran (role) pemanggil tidak tersedia di sini.
    void closedBy;

    const updated = await prisma.posyanduSession.update({
      where: { id: sessionId },
      data: { status: "CLOSED", closedAt: new Date() },
      include: { opener: { select: { id: true, fullName: true } } },
    });

    return this.toAbsensiSession(updated);
  }

  /**
   * Warga (role MASYARAKAT) memindai QR sesi dari dasbornya sendiri.
   * `userId` adalah akun warga yang sedang login — token divalidasi,
   * lalu kehadiran dicatat otomatis untuk data sasaran (visitor) yang
   * terhubung dengan akun tersebut.
   */
  static async processQrAttendance(token: string, userId: number): Promise<AttendanceDTO> {
    const session = await prisma.posyanduSession.findUnique({
      where: { token: token.trim() },
    });

    if (!session) {
      throw new Error("QR sesi tidak valid atau tidak ditemukan.");
    }

    if (session.status !== "OPEN") {
      throw new Error("Sesi Posyandu ini sudah ditutup.");
    }

    if (session.expiresAt && session.expiresAt.getTime() < Date.now()) {
      throw new Error("QR sesi sudah kedaluwarsa. Minta Kader membuka sesi baru.");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.isActive) {
      throw new Error("Akun tidak ditemukan atau non-aktif.");
    }

    if (!user.visitorId) {
      throw new Error(
        "Akun Anda belum terhubung dengan data sasaran Posyandu. Hubungi Kader untuk menautkan akun."
      );
    }

    const visitor = await prisma.visitor.findUnique({ where: { id: user.visitorId } });

    if (!visitor || !visitor.isActive) {
      throw new Error("Data sasaran non-aktif atau tidak ditemukan.");
    }

    // Warga mencatat kehadirannya sendiri; recordedBy diisi dengan akunnya sendiri
    // agar tetap tercatat siapa yang men-trigger absensi (audit trail).
    return this.record(
      {
        visitorId: visitor.id,
        method: "QR",
        status: "HADIR",
        sessionId: session.id,
      },
      userId
    );
  }
}
