"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
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

interface DetectedBarcode {
  rawValue: string;
}

interface BarcodeDetectorInstance {
  detect(source: HTMLVideoElement): Promise<DetectedBarcode[]>;
}

type BarcodeDetectorConstructor = new (options: {
  formats: string[];
}) => BarcodeDetectorInstance;

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

function getBarcodeDetectorClass(): BarcodeDetectorConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  const extendedWindow = window as typeof window & {
    BarcodeDetector?: BarcodeDetectorConstructor;
  };

  return extendedWindow.BarcodeDetector ?? null;
}

export default function AbsensiMasyarakatView({ user }: Props) {
  const [activeSession, setActiveSession] =
    useState<AbsensiSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const [scanStatus, setScanStatus] =
    useState<ScanStatus>("idle");
  const [scanMessage, setScanMessage] = useState("");
  const [scanResult, setScanResult] =
    useState<AttendanceDTO | null>(null);

  const [history, setHistory] = useState<AttendanceDTO[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  const [manualToken, setManualToken] = useState("");
  const [showManual, setShowManual] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const scanIntervalRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const detectingRef = useRef(false);
  const submittingRef = useRef(false);
  const openingCameraRef = useRef(false);

  // ── Ambil sesi aktif ──────────────────────────────────────────────────────
  const fetchActiveSession = useCallback(async () => {
    setSessionLoading(true);

    try {
      const response = await fetch("/api/absensi/session", {
        cache: "no-store",
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(
          json.error || "Gagal memuat sesi Posyandu."
        );
      }

      setActiveSession(json.data ?? null);
    } catch (error) {
      console.error("Gagal memuat sesi aktif:", error);
      setActiveSession(null);
    } finally {
      setSessionLoading(false);
    }
  }, []);

  // ── Ambil riwayat kehadiran ───────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);

    try {
      const response = await fetch("/api/absensi?limit=50", {
        cache: "no-store",
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(
          json.error || "Gagal memuat riwayat kehadiran."
        );
      }

      const responseData = json.data;

      const items: AttendanceDTO[] = Array.isArray(responseData)
        ? responseData
        : responseData?.items ?? responseData?.data ?? [];

      setHistory(items);
    } catch (error) {
      console.error("Gagal memuat riwayat:", error);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchActiveSession();
    void fetchHistory();
  }, [fetchActiveSession, fetchHistory]);

  const refreshRealtimeData = useCallback(async () => {
    await Promise.all([
      fetchActiveSession(),
      fetchHistory(),
    ]);
  }, [fetchActiveSession, fetchHistory]);

  useRealtimeRefresh(refreshRealtimeData, [
    "attendances",
    "posyandu_sessions",
    "visitors",
  ]);

  // ── Hentikan kamera ───────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    detectingRef.current = false;

    const video = videoRef.current;

    if (video) {
      video.pause();
      video.srcObject = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    setCameraActive(false);
    setCameraLoading(false);
  }, []);

  // ── Kirim token ke API ────────────────────────────────────────────────────
  const submitToken = useCallback(
    async (token: string) => {
      const cleanToken = token.trim();

      if (!cleanToken || submittingRef.current) {
        return;
      }

      submittingRef.current = true;
      stopCamera();

      setScanStatus("scanning");
      setScanMessage("Memverifikasi kehadiran…");
      setScanResult(null);

      try {
        const response = await fetch(
          "/api/absensi/scan-session",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: cleanToken,
            }),
          }
        );

        const json = await response.json().catch(() => ({}));

        if (!response.ok || !json.success) {
          throw new Error(
            json.error ||
              json.message ||
              "Gagal melakukan presensi."
          );
        }

        setScanStatus("success");
        setScanMessage(
          json.message || "Kehadiran berhasil dicatat!"
        );
        setScanResult(json.data ?? null);

        await fetchHistory();
      } catch (error) {
        console.error("Gagal melakukan presensi:", error);

        setScanStatus("error");
        setScanMessage(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat melakukan presensi."
        );
      } finally {
        submittingRef.current = false;
      }
    },
    [fetchHistory, stopCamera]
  );

  // ── Jalankan scanner QR ───────────────────────────────────────────────────
  const startQrScanner = useCallback(
    (video: HTMLVideoElement) => {
      const BarcodeDetectorClass =
        getBarcodeDetectorClass();

      if (!BarcodeDetectorClass) {
        setShowManual(true);
        setScanMessage(
          "Kamera aktif, tetapi browser tidak mendukung pemindaian QR otomatis. Gunakan token manual."
        );
        return;
      }

      let detector: BarcodeDetectorInstance;

      try {
        detector = new BarcodeDetectorClass({
          formats: ["qr_code"],
        });
      } catch (error) {
        console.error("BarcodeDetector gagal dibuat:", error);

        setShowManual(true);
        setScanMessage(
          "Pemindai QR otomatis tidak tersedia. Gunakan token manual."
        );
        return;
      }

      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }

      scanIntervalRef.current = setInterval(async () => {
        if (
          detectingRef.current ||
          submittingRef.current ||
          video.readyState <
            HTMLMediaElement.HAVE_CURRENT_DATA ||
          video.videoWidth === 0 ||
          video.videoHeight === 0
        ) {
          return;
        }

        detectingRef.current = true;

        try {
          const results = await detector.detect(video);
          const token = results[0]?.rawValue?.trim();

          if (!token) {
            return;
          }

          if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
          }

          await submitToken(token);
        } catch {
          // QR belum ditemukan pada frame ini.
        } finally {
          detectingRef.current = false;
        }
      }, 500);
    },
    [submitToken]
  );

  // ── Buka kamera ───────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    if (
      !activeSession ||
      openingCameraRef.current
    ) {
      return;
    }

    openingCameraRef.current = true;

    setScanStatus("idle");
    setScanMessage("");
    setScanResult(null);
    setShowManual(false);
    setCameraLoading(true);

    submittingRef.current = false;
    detectingRef.current = false;

    stopCamera();
    setCameraLoading(true);

    try {
      if (
        !window.isSecureContext &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
      ) {
        throw new Error(
          "Kamera hanya dapat digunakan melalui HTTPS atau localhost."
        );
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Browser ini tidak mendukung akses kamera."
        );
      }

      /*
       * Elemen video selalu tersedia di DOM.
       * Tidak menunggu cameraActive untuk membuat elemen video.
       */
      const video = videoRef.current;

      if (!video) {
        throw new Error("Elemen video tidak ditemukan.");
      }

      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
          audio: false,
        });
      } catch (firstError) {
        console.warn(
          "Kamera environment gagal, mencoba kamera default:",
          firstError
        );

        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      const track = stream.getVideoTracks()[0];

      if (!track) {
        stream.getTracks().forEach((item) => item.stop());

        throw new Error(
          "Stream kamera tidak memiliki video track."
        );
      }

      streamRef.current = stream;

      /*
       * Perbaikan utama:
       * pasang stream langsung ke elemen video yang sudah ada.
       */
      video.pause();
      video.srcObject = null;

      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      video.srcObject = stream;

      setCameraActive(true);

      await video.play();

      console.log("[KAMERA] Stream berhasil dipasang:", {
        videoDitemukan: Boolean(video),
        streamTerpasang: video.srcObject === stream,
        namaKamera: track.label,
        statusKamera: track.readyState,
        kameraMuted: track.muted,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyStateVideo: video.readyState,
        videoPaused: video.paused,
        settings: track.getSettings(),
      });

      startQrScanner(video);
    } catch (error) {
      console.error(
        "[KAMERA] Gagal membuka kamera:",
        error
      );

      stopCamera();

      setScanStatus("error");
      setScanMessage(
        error instanceof Error
          ? error.message
          : "Kamera tidak dapat ditampilkan."
      );
      setShowManual(true);
    } finally {
      openingCameraRef.current = false;
      setCameraLoading(false);
    }
  }, [
    activeSession,
    startQrScanner,
    stopCamera,
  ]);

  // Hentikan kamera saat sesi ditutup
  useEffect(() => {
    if (
      !sessionLoading &&
      !activeSession &&
      cameraActive
    ) {
      stopCamera();
    }
  }, [
    activeSession,
    cameraActive,
    sessionLoading,
    stopCamera,
  ]);

  // Hentikan kamera saat meninggalkan halaman
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }

      const stream = streamRef.current;

      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });

        streamRef.current = null;
      }
    };
  }, []);

  const handleManualSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const cleanToken = manualToken.trim();

    if (!cleanToken || !activeSession) {
      return;
    }

    setManualToken("");
    void submitToken(cleanToken);
  };

  const resetScan = () => {
    submittingRef.current = false;
    detectingRef.current = false;

    stopCamera();

    setScanStatus("idle");
    setScanMessage("");
    setScanResult(null);
    setShowManual(false);
    setManualToken("");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Absensi Posyandu
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Halo,{" "}
          <span className="font-semibold text-slate-700">
            {user.fullName}
          </span>
          ! Pindai QR Posyandu hari ini untuk mencatat
          kehadiran Anda.
        </p>
      </div>

      {/* Status sesi */}
      {sessionLoading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memeriksa sesi Posyandu hari ini…
        </div>
      ) : activeSession ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />

          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Sesi Posyandu Sedang Buka
            </p>

            <p className="mt-0.5 text-xs text-emerald-600">
              Dibuka oleh{" "}
              {activeSession.opener?.fullName ?? "Kader"} •{" "}
              {activeSession.expiresAt
                ? `Berakhir pukul ${formatTime(
                    activeSession.expiresAt
                  )}`
                : "Tidak ada batas waktu"}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />

          <div>
            <p className="text-sm font-semibold text-amber-800">
              Tidak Ada Sesi Aktif
            </p>

            <p className="mt-0.5 text-xs text-amber-600">
              Belum ada sesi Posyandu yang dibuka hari
              ini. Hubungi Kader untuk membuka sesi.
            </p>
          </div>
        </div>
      )}

      {/* Panel QR */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 pb-4 pt-5">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" />

            <h2 className="font-semibold text-slate-800">
              Scan QR Sesi
            </h2>
          </div>

          <p className="mt-1 text-xs text-gray-500">
            Arahkan kamera ke QR Code yang ditampilkan
            Kader, atau masukkan token secara manual.
          </p>
        </div>

        <div className="space-y-4 p-5">
          {scanStatus === "success" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-9 w-9 text-emerald-500" />
              </div>

              <p className="text-center text-base font-semibold text-emerald-700">
                {scanMessage}
              </p>

              {scanResult && (
                <p className="text-xs text-gray-500">
                  {formatDate(scanResult.attendanceDate)}{" "}
                  pukul{" "}
                  {formatTime(scanResult.attendanceTime)}
                </p>
              )}

              <button
                type="button"
                onClick={resetScan}
                className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Pindai Ulang
              </button>
            </div>
          )}

          {scanStatus === "error" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-9 w-9 text-red-500" />
              </div>

              <p className="text-center text-sm font-semibold text-red-600">
                {scanMessage}
              </p>

              <button
                type="button"
                onClick={resetScan}
                className="mt-1 flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Coba Lagi
              </button>
            </div>
          )}

          {scanStatus === "scanning" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />

              <p className="text-sm text-gray-500">
                {scanMessage}
              </p>
            </div>
          )}

          {scanStatus === "idle" && (
            <>
              {/*
                Elemen video SELALU ada di DOM.
                Tombol kamera hanya menjadi overlay.
              */}
              <div className="relative aspect-square overflow-hidden rounded-xl bg-black">
                <video
                  ref={videoRef}
                  data-camera-version="direct-stream-v3"
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  disablePictureInPicture
                  aria-label="Tayangan kamera pemindai QR"
                />

                {!cameraActive && !cameraLoading && (
                  <button
                    type="button"
                    onClick={() => void startCamera()}
                    disabled={!activeSession}
                    className="absolute inset-0 z-20 flex w-full flex-col items-center justify-center gap-3 bg-white transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                      <Camera className="h-7 w-7 text-blue-600" />
                    </div>

                    <span className="text-sm font-medium text-blue-700">
                      {activeSession
                        ? "Tap untuk Membuka Kamera"
                        : "Sesi Belum Dibuka"}
                    </span>

                    <span className="text-xs text-gray-400">
                      {activeSession
                        ? "Arahkan ke QR Code Posyandu"
                        : "Hubungi Kader untuk membuka sesi"}
                    </span>
                  </button>
                )}

                {cameraLoading && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-white">
                    <Loader2 className="h-9 w-9 animate-spin text-blue-600" />

                    <p className="text-sm font-medium text-blue-700">
                      Membuka kamera…
                    </p>
                  </div>
                )}

                {cameraActive && (
                  <>
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                      <div className="relative h-52 w-52 rounded-2xl border-2 border-white/80">
                        <span className="absolute -left-0.5 -top-0.5 h-8 w-8 rounded-tl-2xl border-l-4 border-t-4 border-blue-400" />
                        <span className="absolute -right-0.5 -top-0.5 h-8 w-8 rounded-tr-2xl border-r-4 border-t-4 border-blue-400" />
                        <span className="absolute -bottom-0.5 -left-0.5 h-8 w-8 rounded-bl-2xl border-b-4 border-l-4 border-blue-400" />
                        <span className="absolute -bottom-0.5 -right-0.5 h-8 w-8 rounded-br-2xl border-b-4 border-r-4 border-blue-400" />
                      </div>
                    </div>

                    <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-3 py-1.5 text-xs text-white">
                      Arahkan QR ke dalam kotak
                    </div>

                    <button
                      type="button"
                      onClick={stopCamera}
                      className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs text-white transition hover:bg-black/80"
                    >
                      <CameraOff className="h-3.5 w-3.5" />
                      Tutup
                    </button>
                  </>
                )}
              </div>

              {scanMessage && cameraActive && (
                <p className="text-center text-xs text-amber-600">
                  {scanMessage}
                </p>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() =>
                    setShowManual((current) => !current)
                  }
                  className="text-xs text-gray-400 underline underline-offset-2 transition hover:text-blue-600"
                >
                  {showManual
                    ? "Sembunyikan input manual"
                    : "Tidak bisa scan? Masukkan token manual"}
                </button>
              </div>

              {showManual && (
                <form
                  onSubmit={handleManualSubmit}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={manualToken}
                    onChange={(event) =>
                      setManualToken(event.target.value)
                    }
                    placeholder="Tempel token QR sesi di sini…"
                    autoComplete="off"
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    type="submit"
                    disabled={
                      !manualToken.trim() || !activeSession
                    }
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Kirim
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Riwayat kehadiran */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 pb-3 pt-5">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-purple-600" />

            <h2 className="font-semibold text-slate-800">
              Riwayat Kehadiran Saya
            </h2>
          </div>

          <button
            type="button"
            onClick={() => void fetchHistory()}
            disabled={historyLoading}
            className="flex items-center gap-1 text-xs text-gray-400 transition hover:text-blue-600 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3 w-3 ${
                historyLoading ? "animate-spin" : ""
              }`}
            />
            Muat ulang
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {historyLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat riwayat…
            </div>
          ) : history.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              Belum ada riwayat kehadiran.
            </div>
          ) : (
            history.map((attendance) => (
              <div
                key={attendance.id}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {formatDate(attendance.attendanceDate)}
                  </p>

                  <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {formatTime(attendance.attendanceTime)} •{" "}

                    <span className="capitalize">
                      {attendance.method === "QR"
                        ? "Scan QR"
                        : "Manual"}
                    </span>
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    attendance.status === "HADIR"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {attendance.status === "HADIR"
                    ? "Hadir"
                    : "Tidak Hadir"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}