"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  MessageCircle,
  Mail,
  KeyRound,
  Loader2,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { useContactInfo } from "@/hooks/useContactInfo";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "options" | "self-reset" | "success";

export default function ForgotPasswordModal({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) {
  const { contact, loading } = useContactInfo();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("options");
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setStep("options");
      setResetEmail("");
      setResetError(null);
    }
  }

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const waMessage =
    "Halo Admin Posyandu Aster, saya lupa kata sandi akun saya dan membutuhkan bantuan reset password.\n\nEmail akun saya: ";

  const waLink = `https://wa.me/6285646519926?text=${encodeURIComponent(
    waMessage
  )}`;

  const mailLink = contact?.email
    ? `mailto:${contact.email}?subject=${encodeURIComponent(
        "Permintaan Reset Kata Sandi - Posyandu Aster"
      )}&body=${encodeURIComponent(
        "Halo Admin,\n\nSaya lupa kata sandi akun saya dan membutuhkan bantuan reset password.\n\nEmail akun: \nNama lengkap: \n\nMohon bantuannya. Terima kasih."
      )}`
    : null;

  // Kirim permintaan reset password ke API
  const handleSelfReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetError("Masukkan email akun Anda.");
      return;
    }
    setResetLoading(true);
    setResetError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        setResetError(data.message || "Gagal mengirim permintaan. Coba lagi.");
        return;
      }

      setStep("success");
    } catch {
      setResetError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Lupa Kata Sandi?</h2>
          <p className="text-amber-100 text-sm mt-1 leading-relaxed">
            {step === "options" && "Pilih cara untuk mendapatkan kembali akses akun Anda."}
            {step === "self-reset" && "Masukkan email akun Anda untuk melanjutkan."}
            {step === "success" && "Permintaan Anda telah dikirim ke administrator."}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* ── STEP: OPTIONS ── */}
          {step === "options" && (
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span className="text-sm">Memuat opsi...</span>
                </div>
              ) : (
                <>
                  {/* Opsi 1: Request via form (notifikasi ke admin) */}
                  <button
                    onClick={() => setStep("self-reset")}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-amber-100 bg-amber-50 hover:bg-amber-100 hover:border-amber-200 transition-all group text-left"
                  >
                    <div className="w-11 h-11 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-200 group-hover:scale-110 transition-transform">
                      <KeyRound className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">
                        Kirim Permintaan Reset
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        Masukkan email Anda, admin akan dinotifikasi untuk mereset kata sandi
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Opsi 2: WhatsApp ke admin */}
                  {waLink ? (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-200 transition-all group"
                    >
                      <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-200 group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">
                          Chat WhatsApp Admin
                        </p>
                        <p className="text-xs text-emerald-600 font-medium truncate">
                          {contact?.phone}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Pesan sudah disiapkan otomatis — respons paling cepat
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 opacity-40">
                      <div className="w-11 h-11 bg-gray-300 rounded-xl flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-sm text-gray-400">WhatsApp tidak tersedia</p>
                    </div>
                  )}

                  {/* Opsi 3: Email ke admin */}
                  {mailLink ? (
                    <a
                      href={mailLink}
                      className="flex items-center gap-4 p-4 rounded-2xl border-2 border-blue-100 bg-blue-50 hover:bg-blue-100 hover:border-blue-200 transition-all group"
                    >
                      <div className="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200 group-hover:scale-110 transition-transform">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">
                          Kirim Email ke Admin
                        </p>
                        <p className="text-xs text-blue-600 font-medium truncate">
                          {contact?.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Template email sudah disiapkan otomatis
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 opacity-40">
                      <div className="w-11 h-11 bg-gray-300 rounded-xl flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-sm text-gray-400">Email tidak tersedia</p>
                    </div>
                  )}

                  <p className="text-center text-xs text-gray-400 pt-1">
                    Admin akan membantu reset kata sandi Anda
                  </p>
                </>
              )}
            </div>
          )}

          {/* ── STEP: SELF RESET FORM ── */}
          {step === "self-reset" && (
            <form onSubmit={handleSelfReset} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 leading-relaxed">
                📋 Masukkan email akun Anda. Sistem akan mengirimkan notifikasi
                ke Administrator untuk segera mereset kata sandi Anda.
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Email Akun Anda
                </label>
                <input
                  type="email"
                  placeholder="email@posyanduaster.id"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setResetError(null);
                  }}
                  className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                />
                {resetError && (
                  <p className="text-xs text-red-500 mt-1.5">{resetError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] transition-all shadow-lg shadow-amber-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim permintaan...</span>
                  </>
                ) : (
                  "Kirim Permintaan Reset"
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("options")}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Kembali ke pilihan lain
              </button>
            </form>
          )}

          {/* ── STEP: SUCCESS ── */}
          {step === "success" && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Permintaan Terkirim!
                </h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-xs mx-auto">
                  Notifikasi telah dikirim ke Administrator. Silakan tunggu
                  konfirmasi melalui WhatsApp atau email yang terdaftar.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-600 leading-relaxed">
                💡 Sambil menunggu, Anda juga bisa langsung chat WhatsApp admin
                untuk respons lebih cepat.
              </div>
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-emerald-200"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat WhatsApp Sekarang
                </a>
              )}
              <button
                onClick={onClose}
                className="block w-full text-sm text-gray-400 hover:text-gray-600 transition-colors mt-2"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
