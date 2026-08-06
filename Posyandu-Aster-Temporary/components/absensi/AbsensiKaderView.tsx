"use client";

import { useState, useEffect, useCallback } from "react";
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

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(d: Date | string): string {
  return new Date(d).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── QR Code renderer via qr-server public API (no extra dep) ─────────────────
function QRCodeDisplay({ value, size = 240 }: { value: string; size?: number }) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&ecc=M&margin=10`;
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

export default function AbsensiKaderView({ user }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("sesi");

  // ── Sesi ──────────────────────────────────────────────────────────────────
  const [session, setSession] = useState<AbsensiSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [openingSession, setOpeningSession] = useState(false);
  const [closingSession, setClosingSession] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");

  // ── Absensi Manual ────────────────────────────────────────────────────────
  const [manualVisitorId, setManualVisitorId] = useState("");
  const [manualStatus, setManualStatus] = useState<"HADIR" | "TIDAK_HADIR">("HADIR");
  const [manualNotes, setManualNotes] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualMessage, setManualMessage] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  // ── Riwayat ───────────────────────────────────────────────────────────────
  const [history, setHistory] = useState<AttendanceDTO[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [historyDate, setHistoryDate] = useState("");

  // ── Ekspor CSV Presensi ──────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!history.length) {
      alert("Belum ada data presensi untuk diekspor.");
      return;
    }
    const headers = ["No", "Nama Warga", "NIK", "Kategori", "Tanggal Presensi", "Jam Presensi", "Metode", "Status", "Catatan"];
    const rows = history.map((att, index) => [
      index + 1,
      `"${(att.visitor?.fullName || `Visitor #${att.visitorId}`).replace(/"/g, '""')}"`,
      `"${att.visitor?.nik || "-"}"`,
      `"${att.visitor?.category?.name || "-"}"`,
      `"${new Date(att.attendanceDate).toLocaleDateString("id-ID")}"`,
      `"${new Date(att.attendanceTime).toLocaleTimeString("id-ID")}"`,
      att.method === "QR" ? "Scan QR" : "Manual",
      att.status === "HADIR" ? "Hadir" : "Tidak Hadir",
      `"${(att.notes || "-").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Presensi_Posyandu_Aster_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Fetch sesi aktif ──────────────────────────────────────────────────────
  const fetchSession = useCallback(async () => {
    setSessionLoading(true);
    setSessionError(null);
    try {
      const res = await fetch("/api/absensi/session");
      const json = await res.json();
      setSession(json.data ?? null);
    } catch {
      setSessionError("Gagal memuat data sesi.");
    } finally {
      setSessionLoading(false);
    }
  }, []);

  // ── Fetch riwayat kehadiran ────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams({ limit: "30" });
      if (historySearch) params.set("search", historySearch);
      if (historyDate) params.set("date", historyDate);
      const res = await fetch(`/api/absensi?${params.toString()}`);
      const json = await res.json();
      setHistory(json.data?.data ?? []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [historySearch, historyDate]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (activeTab === "riwayat") fetchHistory();
  }, [activeTab, fetchHistory]);
  const refreshRealtimeData = useCallback(async () => {
    await Promise.all([fetchSession(), fetchHistory()]);
  }, [fetchSession, fetchHistory]);
  useRealtimeRefresh(refreshRealtimeData, ["attendances", "posyandu_sessions", "visitors"]);

  // ── Buka Sesi ─────────────────────────────────────────────────────────────
  const openSession = async () => {
    setOpeningSession(true);
    setSessionError(null);
    try {
      const res = await fetch("/api/absensi/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: sessionNotes || null }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Gagal membuka sesi.");
      setSession(json.data);
    } catch (err: unknown) {
      setSessionError(err instanceof Error ? err.message : "Gagal membuka sesi.");
    } finally {
      setOpeningSession(false);
    }
  };

  // ── Tutup Sesi ────────────────────────────────────────────────────────────
  const closeSession = async () => {
    if (!session) return;
    const ok = window.confirm(
      "Yakin ingin menutup sesi Posyandu hari ini? Warga tidak bisa lagi melakukan presensi mandiri setelah sesi ditutup."
    );
    if (!ok) return;
    setClosingSession(true);
    try {
      const res = await fetch("/api/absensi/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Gagal menutup sesi.");
      setSession(null);
    } catch (err: unknown) {
      setSessionError(err instanceof Error ? err.message : "Gagal menutup sesi.");
    } finally {
      setClosingSession(false);
    }
  };

  // ── Absensi Manual ────────────────────────────────────────────────────────
  const submitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualLoading(true);
    setManualMessage(null);
    try {
      const res = await fetch("/api/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: parseInt(manualVisitorId),
          status: manualStatus,
          method: "MANUAL",
          notes: manualNotes || null,
          sessionId: session?.id ?? null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Gagal mencatat absensi.");
      setManualMessage({ type: "ok", text: "Kehadiran berhasil dicatat secara manual." });
      setManualVisitorId("");
      setManualNotes("");
    } catch (err: unknown) {
      setManualMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Terjadi kesalahan.",
      });
    } finally {
      setManualLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Manajemen Absensi Posyandu</h1>
          <p className="text-xs text-gray-400 mt-1">
            Kelola sesi kehadiran, pantau daftar warga yang sudah absen secara real-time, dan catat absensi manual.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-xs transition"
        >
          <Download className="w-3.5 h-3.5 text-gray-500" />
          Ekspor Presensi (Excel/CSV)
        </button>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(
          [
            { key: "sesi", label: "Sesi & QR Code", icon: QrCode },
            { key: "manual", label: "Absensi Manual", icon: UserCheck },
            { key: "riwayat", label: "Riwayat", icon: ClipboardList },
          ] as { key: Tab; label: string; icon: typeof QrCode }[]
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === key
                ? "bg-slate-900 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-200/70"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB: Sesi & QR ───────────────────────────────────────────────── */}
      {activeTab === "sesi" && (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kontrol sesi */}
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-blue-600" />
              Sesi Posyandu Hari Ini
            </h2>

            {sessionLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-6 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                Memuat sesi…
              </div>
            ) : session ? (
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Sesi Sedang Aktif
                  </p>
                  <div className="text-xs text-emerald-700 space-y-1">
                    <p>Tanggal: {formatDate(session.sessionDate)}</p>
                    <p>Dibuka: {formatTime(session.openedAt)}</p>
                    {session.expiresAt && (
                      <p>Kedaluwarsa: {formatTime(session.expiresAt)}</p>
                    )}
                    {session.totalHadir !== undefined && (
                      <p className="font-semibold">
                        Total hadir: {session.totalHadir} warga
                      </p>
                    )}
                    {session.notes && <p>Catatan: {session.notes}</p>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={fetchSession}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-sm text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                  </button>
                  <button
                    onClick={closeSession}
                    disabled={closingSession}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-3 py-2 rounded-xl disabled:opacity-50 transition"
                  >
                    {closingSession ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <StopCircle className="w-3.5 h-3.5" />
                    )}
                    Tutup Sesi
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                  Belum ada sesi aktif. Buka sesi untuk warga mulai melakukan presensi mandiri via
                  QR.
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Catatan Sesi (opsional)
                  </label>
                  <input
                    type="text"
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Mis: Posyandu Aster – Bulan Juli 2026"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={openSession}
                  disabled={openingSession}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50 transition"
                >
                  {openingSession ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <PlayCircle className="w-4 h-4" />
                  )}
                  Buka Sesi Posyandu Hari Ini
                </button>
              </div>
            )}

            {sessionError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                {sessionError}
              </p>
            )}
          </div>

          {/* QR Display */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col items-center gap-5">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 self-start">
              <QrCode className="w-5 h-5 text-purple-600" />
              QR Code Sesi
            </h2>
            {session ? (
              <>
                <QRCodeDisplay value={session.token} size={220} />
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-slate-700">
                    Tunjukkan QR ini kepada warga
                  </p>
                  <p className="text-xs text-gray-400">
                    Berlaku hingga{" "}
                    {session.expiresAt ? formatTime(session.expiresAt) : "sesi ditutup"}
                  </p>
                  <p className="text-[10px] font-mono text-gray-300 break-all px-2">
                    {session.token}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-full">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">
                    {session.totalHadir ?? 0} warga sudah hadir
                  </span>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">
                  QR Code akan muncul di sini setelah sesi dibuka.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Live Attendees List Card (Siapa Saja yang Sudah Absen Hari Ini) ── */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Daftar Warga Sudah Absen Hari Ini ({history.length})
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Pembaruan otomatis saat warga melakukan presensi mandiri atau manual.
              </p>
            </div>
            <button
              onClick={refreshRealtimeData}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" /> Refresh Live
            </button>
          </div>

          {history.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              Belum ada warga yang tercatat absen hari ini.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto pr-1">
              {history.slice(0, 15).map((att) => (
                <div key={att.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-[10px]">
                      {att.visitor?.fullName?.slice(0, 2).toUpperCase() ?? "WS"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{att.visitor?.fullName ?? `Visitor #${att.visitorId}`}</p>
                      <p className="text-[10px] text-gray-400">
                        {att.visitor?.category?.name || "Umum"} · {formatTime(att.attendanceTime)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${att.method === "QR" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                    {att.method === "QR" ? "Scan QR" : "Manual"}
                  </span>
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
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                Input Absensi Manual
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Untuk warga lansia atau warga yang tidak membawa HP — catat kehadiran secara manual.
              </p>
            </div>

            {!session && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
                Tidak ada sesi aktif. Absensi akan dicatat tanpa ID sesi. Disarankan buka sesi
                terlebih dahulu.
              </div>
            )}

            <form onSubmit={submitManual} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  ID Sasaran (Visitor ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={manualVisitorId}
                  onChange={(e) => setManualVisitorId(e.target.value)}
                  placeholder="Masukkan nomor ID sasaran…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status Kehadiran
                </label>
                <div className="flex gap-2">
                  {(["HADIR", "TIDAK_HADIR"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setManualStatus(s)}
                      className={`flex-1 py-2 text-sm font-medium rounded-xl border transition ${
                        manualStatus === s
                          ? s === "HADIR"
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "bg-red-500 border-red-500 text-white"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {s === "HADIR" ? "Hadir" : "Tidak Hadir"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Catatan (opsional)
                </label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Mis: sakit, diwakilkan, dll."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {manualMessage && (
                <div
                  className={`flex items-start gap-2 text-sm rounded-xl px-3 py-2.5 ${
                    manualMessage.type === "ok"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  {manualMessage.type === "ok" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  {manualMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={manualLoading || !manualVisitorId}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50 transition"
              >
                {manualLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Simpan Kehadiran
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB: Riwayat ─────────────────────────────────────────────────── */}
      {activeTab === "riwayat" && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[180px]">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Cari nama warga…"
                className="flex-1 text-sm border-none outline-none"
              />
            </div>
            <input
              type="date"
              value={historyDate}
              onChange={(e) => setHistoryDate(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={fetchHistory}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Muat ulang
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {historyLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Memuat data…
              </div>
            ) : history.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">Tidak ada data absensi.</div>
            ) : (
              history.map((att) => (
                <div key={att.id} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {att.visitor?.fullName ?? `Sasaran #${att.visitorId}`}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                      <CalendarDays className="w-3 h-3" />
                      {formatDate(att.attendanceDate)}
                      <Clock className="w-3 h-3 ml-1" />
                      {formatTime(att.attendanceTime)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        att.status === "HADIR"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {att.status === "HADIR" ? "Hadir" : "Tidak Hadir"}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {att.method === "QR" ? "Scan QR" : "Manual"}
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
