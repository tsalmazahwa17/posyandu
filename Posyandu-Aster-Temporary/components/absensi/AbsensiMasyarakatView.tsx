"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  QrCode,
  CheckCircle2,
  XCircle,
  Loader2,
  CalendarDays,
  Clock,
  RefreshCw,
  Camera,
  CameraOff,
} from "lucide-react";
import type { SessionPayload } from "@/lib/session";
import type { AttendanceDTO, AbsensiSession } from "@/types";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";

interface Props {
  user: SessionPayload;
}

type ScanStatus = "idle" | "scanning" | "success" | "error";

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

export default function AbsensiMasyarakatView({ user }: Props) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [activeSession, setActiveSession] = useState<AbsensiSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [scanMessage, setScanMessage] = useState<string>("");
  const [scanResult, setScanResult] = useState<AttendanceDTO | null>(null);

  const [history, setHistory] = useState<AttendanceDTO[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [cameraActive, setCameraActive] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [showManual, setShowManual] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch sesi aktif ──────────────────────────────────────────────────────
  const fetchActiveSession = useCallback(async () => {
    setSessionLoading(true);
    try {
      const res = await fetch("/api/absensi/session");
      const json = await res.json();
      setActiveSession(json.data ?? null);
    } catch {
      setActiveSession(null);
    } finally {
      setSessionLoading(false);
    }
  }, []);

  // ── Fetch riwayat kehadiran warga ini ─────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/absensi?limit=20`);
      const json = await res.json();
      const all: AttendanceDTO[] = json.data?.data ?? [];
      // Filter hanya milik visitor yang terhubung ke user ini
      const mine = user.visitorId
        ? all.filter((a) => a.visitorId === user.visitorId)
        : all;
      setHistory(mine);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [user.visitorId]);

  useEffect(() => {
    fetchActiveSession();
    fetchHistory();
  }, [fetchActiveSession, fetchHistory]);
  const refreshRealtimeData = useCallback(async () => {
    await Promise.all([fetchActiveSession(), fetchHistory()]);
  }, [fetchActiveSession, fetchHistory]);
  useRealtimeRefresh(refreshRealtimeData, ["attendances", "posyandu_sessions", "visitors"]);

  // ── Kirim token ke API scan-session ──────────────────────────────────────
  const submitToken = useCallback(
    async (token: string) => {
      if (scanStatus === "scanning") return;
      setScanStatus("scanning");
      setScanMessage("Memverifikasi kehadiran…");
      try {
        const res = await fetch("/api/absensi/scan-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Gagal melakukan presensi.");
        }
        setScanStatus("success");
        setScanMessage(json.message || "Kehadiran berhasil dicatat!");
        setScanResult(json.data);
        fetchHistory();
      } catch (err: unknown) {
        setScanStatus("error");
        setScanMessage(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        stopCamera();
      }
    },
    [scanStatus, fetchHistory]
  );

  // ── Kamera (QR Scanner via BarcodeDetector / manual fallback) ─────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setScanStatus("idle");
    setScanMessage("");
    setScanResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);

      // Coba pakai BarcodeDetector API (Chrome 83+, Edge)
      if ("BarcodeDetector" in window) {
        const detector = new (window as unknown as { BarcodeDetector: new (opts: object) => { detect: (img: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector({
          formats: ["qr_code"],
        });

        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const raw = barcodes[0].rawValue;
              if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
                scanIntervalRef.current = null;
              }
              await submitToken(raw);
            }
          } catch {
            // detector bisa throw jika frame tidak siap, abaikan
          }
        }, 500);
      } else {
        // Fallback: tampilkan instruksi input manual
        setShowManual(true);
      }
    } catch {
      setScanStatus("error");
      setScanMessage(
        "Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan, atau gunakan input manual."
      );
      setShowManual(true);
    }
  }, [submitToken]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── Handle manual token submit ─────────────────────────────────────────────
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualToken.trim()) {
      submitToken(manualToken.trim());
      setManualToken("");
    }
  };

  const resetScan = () => {
    setScanStatus("idle");
    setScanMessage("");
    setScanResult(null);
    setShowManual(false);
    stopCamera();
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Absensi Posyandu</h1>
        <p className="text-sm text-gray-500 mt-1">
          Halo, <span className="font-semibold text-slate-700">{user.fullName}</span>! Pindai QR
          Posyandu hari ini untuk mencatat kehadiran Anda.
        </p>
      </div>

      {/* Status Sesi Aktif */}
      {sessionLoading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Memeriksa sesi Posyandu hari ini…
        </div>
      ) : activeSession ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Sesi Posyandu Sedang Buka</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Dibuka oleh {activeSession.opener?.fullName ?? "Kader"} •{" "}
              {activeSession.expiresAt
                ? `Berakhir pukul ${formatTime(activeSession.expiresAt)}`
                : "Tidak ada batas waktu"}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Tidak Ada Sesi Aktif</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Belum ada sesi Posyandu yang dibuka hari ini. Hubungi Kader untuk membuka sesi.
            </p>
          </div>
        </div>
      )}

      {/* Panel Scan QR */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-slate-800">Scan QR Sesi</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Arahkan kamera ke QR Code yang ditampilkan Kader, atau masukkan kode secara manual.
          </p>
        </div>

        <div className="p-5 space-y-4">
          {/* Hasil scan */}
          {scanStatus === "success" && scanResult && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
              </div>
              <p className="text-base font-semibold text-emerald-700">{scanMessage}</p>
              <p className="text-xs text-gray-500">
                {formatDate(scanResult.attendanceDate)} pukul{" "}
                {formatTime(scanResult.attendanceTime)}
              </p>
              <button
                onClick={resetScan}
                className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Pindai Ulang
              </button>
            </div>
          )}

          {scanStatus === "error" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-9 h-9 text-red-500" />
              </div>
              <p className="text-sm font-semibold text-red-600 text-center">{scanMessage}</p>
              <button
                onClick={resetScan}
                className="mt-1 text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Coba Lagi
              </button>
            </div>
          )}

          {scanStatus === "scanning" && !scanResult && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-500">{scanMessage}</p>
            </div>
          )}

          {/* Kamera */}
          {scanStatus === "idle" && (
            <>
              {cameraActive ? (
                <div className="relative rounded-xl overflow-hidden bg-black aspect-square">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  {/* Viewfinder overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-white/70 rounded-xl" />
                  </div>
                  <button
                    onClick={stopCamera}
                    className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-black/80 transition"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    Tutup
                  </button>
                </div>
              ) : (
                <button
                  onClick={startCamera}
                  disabled={!activeSession}
                  className="w-full flex flex-col items-center gap-3 py-10 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition">
                    <Camera className="w-7 h-7 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-700">
                    {activeSession ? "Tap untuk Membuka Kamera" : "Sesi Belum Dibuka"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {activeSession
                      ? "Arahkan ke QR Code Posyandu"
                      : "Hubungi Kader untuk membuka sesi"}
                  </span>
                </button>
              )}

              {/* Toggle input manual */}
              <div className="text-center">
                <button
                  onClick={() => setShowManual((v) => !v)}
                  className="text-xs text-gray-400 hover:text-blue-600 underline underline-offset-2 transition"
                >
                  {showManual ? "Sembunyikan input manual" : "Tidak bisa scan? Masukkan token manual"}
                </button>
              </div>

              {showManual && (
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Tempel token QR sesi di sini…"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!manualToken.trim() || !activeSession}
                    className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Kirim
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Riwayat Kehadiran */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold text-slate-800">Riwayat Kehadiran Saya</h2>
          </div>
          <button
            onClick={fetchHistory}
            className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" />
            Muat ulang
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {historyLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Memuat riwayat…
            </div>
          ) : history.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              Belum ada riwayat kehadiran.
            </div>
          ) : (
            history.map((att) => (
              <div key={att.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {formatDate(att.attendanceDate)}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatTime(att.attendanceTime)} •{" "}
                    <span className="capitalize">{att.method === "QR" ? "Scan QR" : "Manual"}</span>
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    att.status === "HADIR"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {att.status === "HADIR" ? "Hadir" : "Tidak Hadir"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
