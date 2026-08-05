"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { PASSWORD_MAX_BYTES, validateNewPassword } from "@/utils/password";

export default function ChangePasswordForm() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, 900);
    return () => window.clearTimeout(timer);
  }, [router, success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Semua kolom wajib diisi.");
      return;
    }
    const passwordValidationError = validateNewPassword(newPassword);
    if (passwordValidationError) {
      setError(passwordValidationError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("Kata sandi baru tidak boleh sama dengan kata sandi lama.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(data.message || "Gagal memperbarui kata sandi.");
        return;
      }

      setSuccess(true);
    } catch {
      setError(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center text-center py-6">
        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        </div>
        <h3 className="font-bold text-slate-800 text-lg">
          Kata Sandi Diperbarui
        </h3>
        <p className="text-sm text-slate-500 mt-1.5">
          Mengalihkan ke dasbor...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Current Password */}
      <div>
        <label
          htmlFor="currentPassword"
          className="block text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2"
        >
          Kata Sandi Sementara
        </label>
        <div className="relative">
          <KeyRound
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            id="currentPassword"
            type={showCurrent ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Kata sandi dari administrator"
            maxLength={PASSWORD_MAX_BYTES}
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (error) setError(null);
            }}
            disabled={isLoading}
            className="w-full h-11 border border-gray-200 rounded-xl pl-10 pr-11 text-sm outline-none
              focus:ring-2 focus:ring-blue-400 focus:border-transparent
              hover:border-gray-300 transition-all bg-gray-50 focus:bg-white
              disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-60"
            aria-label={showCurrent ? "Sembunyikan kata sandi sementara" : "Tampilkan kata sandi sementara"}
          >
            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label
          htmlFor="newPassword"
          className="block text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2"
        >
          Kata Sandi Baru
        </label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            id="newPassword"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            maxLength={PASSWORD_MAX_BYTES}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (error) setError(null);
            }}
            disabled={isLoading}
            className="w-full h-11 border border-gray-200 rounded-xl pl-10 pr-11 text-sm outline-none
              focus:ring-2 focus:ring-blue-400 focus:border-transparent
              hover:border-gray-300 transition-all bg-gray-50 focus:bg-white
              disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-60"
            aria-label={showNew ? "Sembunyikan kata sandi baru" : "Tampilkan kata sandi baru"}
          >
            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2"
        >
          Konfirmasi Kata Sandi Baru
        </label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Ulangi kata sandi baru"
            maxLength={PASSWORD_MAX_BYTES}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError(null);
            }}
            disabled={isLoading}
            className="w-full h-11 border border-gray-200 rounded-xl pl-10 pr-11 text-sm outline-none
              focus:ring-2 focus:ring-blue-400 focus:border-transparent
              hover:border-gray-300 transition-all bg-gray-50 focus:bg-white
              disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-60"
            aria-label={showConfirm ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl
          font-semibold text-sm tracking-wide hover:from-blue-700 hover:to-blue-600
          active:scale-[0.98] transition-all shadow-lg shadow-blue-200
          disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100
          flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Menyimpan...</span>
          </>
        ) : (
          <span>Simpan Kata Sandi Baru</span>
        )}
      </button>
    </form>
  );
}
