// ─── ENUM (mirror prisma) ───────────────────────────────────────────────────

export type AttendanceMethod = "QR" | "MANUAL";
export type AttendanceStatus = "HADIR" | "TIDAK_HADIR";
export type SessionStatus = "OPEN" | "CLOSED";

// ─── ATTENDANCE ──────────────────────────────────────────────────────────────

export interface AttendanceDTO {
  id: number;
  visitorId: number;
  recordedBy: number | null;
  sessionId?: number | null;
  attendanceDate: Date | string;
  attendanceTime: Date | string;
  method: AttendanceMethod;
  status: AttendanceStatus;
  notes?: string | null;
  visitor?: {
    id: number;
    fullName: string;
    nik?: string | null;
    qrCode?: string | null;
    category?: { id: number; name: string } | null;
  } | null;
  recorder?: { id: number; fullName: string } | null;
  session?: AbsensiSession | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Input untuk pencatatan absensi manual oleh Kader/Admin
export interface CreateAttendanceInput {
  visitorId: number;
  attendanceDate?: string;
  method?: AttendanceMethod;
  status?: AttendanceStatus;
  notes?: string | null;
  sessionId?: number | null;
}

export interface AttendanceFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  date?: string;
  categoryId?: number;
  sessionId?: number;
  visitorId?: number;
}

// ─── QR SESSION (dibuka Kader, dipindai Warga/MASYARAKAT) ──────────────────

// Payload yang dikirim Warga saat memindai QR sesi dari dasbornya
export interface ScanQrPayload {
  token: string;
}

// Representasi sesi Posyandu untuk keperluan API/response
export interface AbsensiSession {
  id: number;
  sessionDate: Date | string;
  token: string;
  status: SessionStatus;
  openedBy: number;
  opener?: { id: number; fullName: string } | null;
  openedAt: Date | string;
  closedAt?: Date | string | null;
  expiresAt?: Date | string | null;
  notes?: string | null;
  totalHadir?: number;
}

// Input untuk Kader/Admin membuka sesi Posyandu (menghasilkan QR)
export interface CreateSessionInput {
  sessionDate?: string;
  notes?: string | null;
  /** Durasi berlaku token dalam menit, default ditentukan oleh service */
  durationMinutes?: number;
}
