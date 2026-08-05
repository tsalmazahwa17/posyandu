import { prisma } from "@/lib/prisma";

export interface LogAuditParams {
  action: string;
  userId?: number | null;
  ipAddress?: string | null;
  details?: string | Record<string, unknown> | null;
}

/**
 * Mencatat log audit aktivitas sensitif (hapus data, reset password, dll.) ke database.
 */
export async function logAudit({ action, userId, ipAddress, details }: LogAuditParams): Promise<void> {
  try {
    const detailString =
      typeof details === "object" && details !== null
        ? JSON.stringify(details)
        : details || null;

    await prisma.auditLog.create({
      data: {
        action,
        userId: userId ?? null,
        ipAddress: ipAddress ?? null,
        details: detailString,
      },
    });
  } catch (err) {
    // Audit log tidak boleh menggagalkan flow utama jika ada kendala
    console.error("Gagal mencatat audit log:", err);
  }
}
