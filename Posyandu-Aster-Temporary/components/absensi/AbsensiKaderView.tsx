"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  QrCode,
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
  PlayCircle,
  StopCircle,
  RefreshCw,
  ClipboardList,
  Search,
  CalendarDays,
  Clock,
  UserCheck,
  Download,
} from "lucide-react";

import type { SessionPayload } from "@/lib/session";
import type { AbsensiSession, AttendanceDTO } from "@/types";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";

interface Props {
  user: SessionPayload;
}

type Tab = "sesi" | "manual" | "riwayat";

function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(value: Date | string): string {
  return new Date(value).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Menghasilkan tanggal lokal dalam format YYYY-MM-DD.
 * Tidak memakai toISOString() karena dapat bergeser tanggal akibat UTC.
 */
function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getAttendanceItems(json: {
  data?: {
    items?: AttendanceDTO[];
    data?: AttendanceDTO[];
  };
}): AttendanceDTO[] {
  return json.data?.items ?? json.data?.data ?? [];
}

// QR Code renderer melalui qr-server public API.
function QRCodeDisplay({
  value,
  size = 240,
}: {
  value: string;
  size?: number;
}) {
  const url =
    `https://api.qrserver.com/v1/create-qr-code/` +
    `?size=${size}x${size}` +
    `&data=${encodeURIComponent(value)}` +
    `&ecc=M&margin=10`;

  return (
    <img
      src={url}
      alt="QR Code Sesi Posyandu"
      width={size}
      height={size}
      className="rounded-xl border border-gray-200 shadow"
    />
  );
}

export default function AbsensiKaderView({
  user: _user,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("sesi");

  // ── Sesi ────────────────────────────────────────────────────────────────
  const [session, setSession] =
    useState<AbsensiSession | null>(null);

  const [sessionLoading, setSessionLoading] =
    useState(true);

  const [sessionError, setSessionError] =
    useState<string | null>(null);

  const [openingSession, setOpeningSession] =
    useState(false);

  const [closingSession, setClosingSession] =
    useState(false);

  const [sessionNotes, setSessionNotes] =
    useState("");

  // ── Absensi hari ini ────────────────────────────────────────────────────
  const [todayAttendances, setTodayAttendances] =
    useState<AttendanceDTO[]>([]);

  const [
    todayAttendancesLoading,
    setTodayAttendancesLoading,
  ] = useState(false);

  // ── Absensi manual ──────────────────────────────────────────────────────
  const [manualVisitorId, setManualVisitorId] =
    useState("");

  const [manualStatus, setManualStatus] =
    useState<"HADIR" | "TIDAK_HADIR">("HADIR");

  const [manualNotes, setManualNotes] =
    useState("");

  const [manualLoading, setManualLoading] =
    useState(false);

  const [manualMessage, setManualMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  // ── Riwayat ─────────────────────────────────────────────────────────────
  const [history, setHistory] =
    useState<AttendanceDTO[]>([]);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [historySearch, setHistorySearch] =
    useState("");

  const [historyDate, setHistoryDate] =
    useState("");

  // ── Ekspor CSV ──────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!history.length) {
      alert(
        "Belum ada data riwayat presensi untuk diekspor."
      );
      return;
    }

    const headers = [
      "No",
      "Nama Warga",
      "NIK",
      "Kategori",
      "Tanggal Presensi",
      "Jam Presensi",
      "Metode",
      "Status",
      "Catatan",
    ];

    const rows = history.map((attendance, index) => [
      index + 1,

      `"${(
        attendance.visitor?.fullName ||
        `Visitor #${attendance.visitorId}`
      ).replace(/"/g, '""')}"`,

      `"${attendance.visitor?.nik || "-"}"`,

      `"${attendance.visitor?.category?.name || "-"}"`,

      `"${new Date(
        attendance.attendanceDate
      ).toLocaleDateString("id-ID")}"`,

      `"${new Date(
        attendance.attendanceTime
      ).toLocaleTimeString("id-ID")}"`,

      attendance.method === "QR"
        ? "Scan QR"
        : "Manual",

      attendance.status === "HADIR"
        ? "Hadir"
        : "Tidak Hadir",

      `"${(attendance.notes || "-").replace(
        /"/g,
        '""'
      )}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Presensi_Posyandu_Aster_${getLocalDateString()}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Fetch sesi aktif ────────────────────────────────────────────────────
  const fetchSession = useCallback(async () => {
    setSessionLoading(true);
    setSessionError(null);

    try {
      const response = await fetch(
        "/api/absensi/session",
        {
          cache: "no-store",
        }
      );

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(
          json.error || "Gagal memuat data sesi."
        );
      }

      setSession(json.data ?? null);
    } catch (error) {
      console.error("Gagal memuat sesi:", error);

      setSessionError(
        error instanceof Error
          ? error.message
          : "Gagal memuat data sesi."
      );

      setSession(null);
    } finally {
      setSessionLoading(false);
    }
  }, []);

  // ── Fetch absensi hari ini ──────────────────────────────────────────────
  const fetchTodayAttendances =
    useCallback(async () => {
      setTodayAttendancesLoading(true);

      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "100",
          date: getLocalDateString(),
        });

        const response = await fetch(
          `/api/absensi?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(
            json.error ||
              "Gagal memuat absensi hari ini."
          );
        }

        const items = getAttendanceItems(json);

        setTodayAttendances(items);

        console.log("[ABSENSI HARI INI]", {
          tanggal: getLocalDateString(),
          total: json.data?.total,
          jumlah: items.length,
        });
      } catch (error) {
        console.error(
          "Gagal memuat absensi hari ini:",
          error
        );

        setTodayAttendances([]);
      } finally {
        setTodayAttendancesLoading(false);
      }
    }, []);

  // ── Fetch seluruh riwayat / riwayat terfilter ───────────────────────────
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);

    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "100",
      });

      if (historySearch.trim()) {
        params.set(
          "search",
          historySearch.trim()
        );
      }

      if (historyDate) {
        params.set("date", historyDate);
      }

      const response = await fetch(
        `/api/absensi?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(
          json.error ||
            "Gagal memuat riwayat absensi."
        );
      }

      const items = getAttendanceItems(json);

      setHistory(items);

      console.log("[RIWAYAT ABSENSI]", {
        pencarian: historySearch,
        tanggal: historyDate || "semua tanggal",
        total: json.data?.total,
        jumlah: items.length,
      });
    } catch (error) {
      console.error(
        "Gagal memuat riwayat absensi:",
        error
      );

      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [historySearch, historyDate]);

  // ── Initial fetch ────────────────────────────────────────────────────────
  useEffect(() => {
    void fetchSession();
    void fetchTodayAttendances();
  }, [fetchSession, fetchTodayAttendances]);

  // Riwayat diperbarui saat pencarian/tanggal berubah.
  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  // ── Realtime refresh ────────────────────────────────────────────────────
  const refreshRealtimeData =
    useCallback(async () => {
      await Promise.all([
        fetchSession(),
        fetchTodayAttendances(),
        fetchHistory(),
      ]);
    }, [
      fetchSession,
      fetchTodayAttendances,
      fetchHistory,
    ]);

  useRealtimeRefresh(refreshRealtimeData, [
    "attendances",
    "posyandu_sessions",
    "visitors",
  ]);

  // ── Buka sesi ───────────────────────────────────────────────────────────
  const openSession = async () => {
    setOpeningSession(true);
    setSessionError(null);

    try {
      const response = await fetch(
        "/api/absensi/session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notes: sessionNotes || null,
          }),
        }
      );

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(
          json.error || "Gagal membuka sesi."
        );
      }

      setSession(json.data);
      setSessionNotes("");

      await Promise.all([
        fetchSession(),
        fetchTodayAttendances(),
      ]);
    } catch (error) {
      setSessionError(
        error instanceof Error
          ? error.message
          : "Gagal membuka sesi."
      );
    } finally {
      setOpeningSession(false);
    }
  };

  // ── Tutup sesi ──────────────────────────────────────────────────────────
  const closeSession = async () => {
    if (!session) {
      return;
    }

    const confirmed = window.confirm(
      "Yakin ingin menutup sesi Posyandu hari ini? " +
        "Warga tidak bisa lagi melakukan presensi mandiri setelah sesi ditutup."
    );

    if (!confirmed) {
      return;
    }

    setClosingSession(true);
    setSessionError(null);

    try {
      const response = await fetch(
        "/api/absensi/session",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: session.id,
          }),
        }
      );

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(
          json.error || "Gagal menutup sesi."
        );
      }

      setSession(null);

      await Promise.all([
        fetchSession(),
        fetchTodayAttendances(),
      ]);
    } catch (error) {
      setSessionError(
        error instanceof Error
          ? error.message
          : "Gagal menutup sesi."
      );
    } finally {
      setClosingSession(false);
    }
  };

  // ── Absensi manual ──────────────────────────────────────────────────────
  const submitManual = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const visitorId = Number.parseInt(
      manualVisitorId,
      10
    );

    if (!Number.isInteger(visitorId) || visitorId < 1) {
      setManualMessage({
        type: "err",
        text: "ID sasaran tidak valid.",
      });
      return;
    }

    setManualLoading(true);
    setManualMessage(null);

    try {
      const response = await fetch(
        "/api/absensi",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            visitorId,
            status: manualStatus,
            method: "MANUAL",
            notes: manualNotes || null,
            sessionId: session?.id ?? null,
          }),
        }
      );

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(
          json.error ||
            "Gagal mencatat absensi."
        );
      }

      setManualMessage({
        type: "ok",
        text: "Kehadiran berhasil dicatat secara manual.",
      });

      setManualVisitorId("");
      setManualNotes("");

      await Promise.all([
        fetchSession(),
        fetchTodayAttendances(),
        fetchHistory(),
      ]);
    } catch (error) {
      setManualMessage({
        type: "err",
        text:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan.",
      });
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Manajemen Absensi Posyandu
          </h1>

          <p className="mt-1 text-xs text-gray-400">
            Kelola sesi kehadiran, pantau daftar warga
            yang sudah absen secara real-time, dan catat
            absensi manual.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50"
        >
          <Download className="h-3.5 w-3.5 text-gray-500" />
          Ekspor Presensi (Excel/CSV)
        </button>
      </div>

      {/* Tab navigation */}
      <div className="flex w-fit gap-1 rounded-xl bg-gray-100 p-1">
        {(
          [
            {
              key: "sesi",
              label: "Sesi & QR Code",
              icon: QrCode,
            },
            {
              key: "manual",
              label: "Absensi Manual",
              icon: UserCheck,
            },
            {
              key: "riwayat",
              label: "Riwayat",
              icon: ClipboardList,
            },
          ] as {
            key: Tab;
            label: string;
            icon: typeof QrCode;
          }[]
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === key
                ? "bg-slate-900 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-200/70"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB: Sesi & QR ──────────────────────────────────────────────── */}
      {activeTab === "sesi" && (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Kontrol sesi */}
            <div className="space-y-4 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <PlayCircle className="h-5 w-5 text-blue-600" />
                Sesi Posyandu Hari Ini
              </h2>

              {sessionLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat sesi…
                </div>
              ) : session ? (
                <div className="space-y-3">
                  <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4" />
                      Sesi Sedang Aktif
                    </p>

                    <div className="space-y-1 text-xs text-emerald-700">
                      <p>
                        Tanggal:{" "}
                        {formatDate(session.sessionDate)}
                      </p>

                      <p>
                        Dibuka:{" "}
                        {formatTime(session.openedAt)}
                      </p>

                      {session.expiresAt && (
                        <p>
                          Kedaluwarsa:{" "}
                          {formatTime(
                            session.expiresAt
                          )}
                        </p>
                      )}

                      {session.totalHadir !==
                        undefined && (
                        <p className="font-semibold">
                          Total hadir:{" "}
                          {session.totalHadir} warga
                        </p>
                      )}

                      {session.notes && (
                        <p>
                          Catatan: {session.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void Promise.all([
                          fetchSession(),
                          fetchTodayAttendances(),
                        ])
                      }
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Refresh
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void closeSession()
                      }
                      disabled={closingSession}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                    >
                      {closingSession ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <StopCircle className="h-3.5 w-3.5" />
                      )}

                      Tutup Sesi
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                    Belum ada sesi aktif. Buka sesi
                    untuk warga mulai melakukan
                    presensi mandiri melalui QR.
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Catatan Sesi (opsional)
                    </label>

                    <input
                      type="text"
                      value={sessionNotes}
                      onChange={(event) =>
                        setSessionNotes(
                          event.target.value
                        )
                      }
                      placeholder="Mis: Posyandu Aster – Bulan Agustus 2026"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => void openSession()}
                    disabled={openingSession}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {openingSession ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <PlayCircle className="h-4 w-4" />
                    )}

                    Buka Sesi Posyandu Hari Ini
                  </button>
                </div>
              )}

              {sessionError && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <XCircle className="h-3.5 w-3.5" />
                  {sessionError}
                </p>
              )}
            </div>

            {/* QR Display */}
            <div className="flex flex-col items-center gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 self-start font-semibold text-slate-800">
                <QrCode className="h-5 w-5 text-purple-600" />
                QR Code Sesi
              </h2>

              {session ? (
                <>
                  <QRCodeDisplay
                    value={session.token}
                    size={220}
                  />

                  <div className="space-y-1 text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      Tunjukkan QR ini kepada warga
                    </p>

                    <p className="text-xs text-gray-400">
                      Berlaku hingga{" "}
                      {session.expiresAt
                        ? formatTime(
                            session.expiresAt
                          )
                        : "sesi ditutup"}
                    </p>

                    <p className="break-all px-2 font-mono text-[10px] text-gray-300">
                      {session.token}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2">
                    <Users className="h-3.5 w-3.5 text-emerald-600" />

                    <span className="text-xs font-semibold text-emerald-700">
                      {session.totalHadir ?? 0} warga
                      sudah hadir
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100">
                    <QrCode className="h-10 w-10 text-gray-300" />
                  </div>

                  <p className="text-sm text-gray-400">
                    QR Code akan muncul di sini
                    setelah sesi dibuka.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Daftar absensi hari ini */}
          <div className="space-y-4 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  Daftar Warga Sudah Absen Hari Ini (
                  {todayAttendances.length})
                </h2>

                <p className="mt-0.5 text-xs text-gray-400">
                  Hanya menampilkan presensi tanggal{" "}
                  {new Date().toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  void Promise.all([
                    fetchSession(),
                    fetchTodayAttendances(),
                  ])
                }
                disabled={todayAttendancesLoading}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3 w-3 ${
                    todayAttendancesLoading
                      ? "animate-spin"
                      : ""
                  }`}
                />
                Refresh Live
              </button>
            </div>

            {todayAttendancesLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 text-xs text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat absensi hari ini…
              </div>
            ) : todayAttendances.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center text-xs text-gray-400">
                Belum ada warga yang tercatat absen
                hari ini.
              </div>
            ) : (
              <div className="max-h-[350px] divide-y divide-gray-100 overflow-y-auto pr-1">
                {todayAttendances
                  .slice(0, 100)
                  .map((attendance) => (
                    <div
                      key={attendance.id}
                      className="flex items-center justify-between py-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600">
                          {attendance.visitor?.fullName
                            ?.slice(0, 2)
                            .toUpperCase() ?? "WS"}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800">
                            {attendance.visitor
                              ?.fullName ??
                              `Visitor #${attendance.visitorId}`}
                          </p>

                          <p className="text-[10px] text-gray-400">
                            {attendance.visitor
                              ?.category?.name ||
                              "Umum"}{" "}
                            ·{" "}
                            {formatTime(
                              attendance.attendanceTime
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            attendance.status ===
                            "HADIR"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {attendance.status ===
                          "HADIR"
                            ? "Hadir"
                            : "Tidak Hadir"}
                        </span>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            attendance.method ===
                            "QR"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-purple-50 text-purple-600"
                          }`}
                        >
                          {attendance.method === "QR"
                            ? "Scan QR"
                            : "Manual"}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── TAB: Absensi Manual ─────────────────────────────────────────── */}
      {activeTab === "manual" && (
        <div className="max-w-lg">
          <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                <UserCheck className="h-5 w-5 text-blue-600" />
                Input Absensi Manual
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Untuk warga lansia atau warga yang
                tidak membawa HP — catat kehadiran
                secara manual.
              </p>
            </div>

            {!session && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Tidak ada sesi aktif. Absensi akan
                dicatat tanpa ID sesi. Disarankan buka
                sesi terlebih dahulu.
              </div>
            )}

            <form
              onSubmit={submitManual}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  ID Sasaran (Visitor ID){" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="number"
                  min={1}
                  required
                  value={manualVisitorId}
                  onChange={(event) =>
                    setManualVisitorId(
                      event.target.value
                    )
                  }
                  placeholder="Masukkan nomor ID sasaran…"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Status Kehadiran
                </label>

                <div className="flex gap-2">
                  {(
                    [
                      "HADIR",
                      "TIDAK_HADIR",
                    ] as const
                  ).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        setManualStatus(status)
                      }
                      className={`flex-1 rounded-xl border py-2 text-sm font-medium transition ${
                        manualStatus === status
                          ? status === "HADIR"
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-red-500 bg-red-500 text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {status === "HADIR"
                        ? "Hadir"
                        : "Tidak Hadir"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Catatan (opsional)
                </label>

                <input
                  type="text"
                  value={manualNotes}
                  onChange={(event) =>
                    setManualNotes(
                      event.target.value
                    )
                  }
                  placeholder="Mis: sakit, diwakilkan, dll."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {manualMessage && (
                <div
                  className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm ${
                    manualMessage.type === "ok"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-600"
                  }`}
                >
                  {manualMessage.type === "ok" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  )}

                  {manualMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  manualLoading ||
                  !manualVisitorId
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {manualLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}

                Simpan Kehadiran
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB: Riwayat ───────────────────────────────────────────────── */}
      {activeTab === "riwayat" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 pb-4 pt-5">
            <div className="flex min-w-[180px] flex-1 items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />

              <input
                type="text"
                value={historySearch}
                onChange={(event) =>
                  setHistorySearch(
                    event.target.value
                  )
                }
                placeholder="Cari nama warga…"
                className="flex-1 border-none text-sm outline-none"
              />
            </div>

            <input
              type="date"
              value={historyDate}
              onChange={(event) =>
                setHistoryDate(event.target.value)
              }
              className="rounded-lg border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {historyDate && (
              <button
                type="button"
                onClick={() =>
                  setHistoryDate("")
                }
                className="text-xs text-gray-400 transition hover:text-red-500"
              >
                Hapus tanggal
              </button>
            )}

            <button
              type="button"
              onClick={() => void fetchHistory()}
              disabled={historyLoading}
              className="flex items-center gap-1 text-xs text-gray-500 transition hover:text-blue-600 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  historyLoading
                    ? "animate-spin"
                    : ""
                }`}
              />
              Muat ulang
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {historyLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat data…
              </div>
            ) : history.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">
                Tidak ada data absensi.
              </div>
            ) : (
              history.map((attendance) => (
                <div
                  key={attendance.id}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {attendance.visitor
                        ?.fullName ??
                        `Sasaran #${attendance.visitorId}`}
                    </p>

                    <p className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                      <CalendarDays className="h-3 w-3" />

                      {formatDate(
                        attendance.attendanceDate
                      )}

                      <Clock className="ml-1 h-3 w-3" />

                      {formatTime(
                        attendance.attendanceTime
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        attendance.status ===
                        "HADIR"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {attendance.status ===
                      "HADIR"
                        ? "Hadir"
                        : "Tidak Hadir"}
                    </span>

                    <span className="text-[10px] text-gray-400">
                      {attendance.method === "QR"
                        ? "Scan QR"
                        : "Manual"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}