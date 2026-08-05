"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  UserPlus,
  HelpCircle,
} from "lucide-react";
import ContactModal from "@/components/landing/ContactModal";
import ForgotPasswordModal from "@/components/forms/ForgotPasswordModal";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Alamat email wajib diisi.");
      return;
    }
    if (!password) {
      setError("Kata sandi wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember: rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login gagal. Coba lagi.");
        return;
      }

      // Login sukses → cek apakah wajib ganti password dulu
      if (data.mustChangePassword) {
        router.push("/change-password");
      } else {
        router.push(callbackUrl);
      }
      router.refresh();
    } catch {
      setError(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm animate-shake">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2"
          >
            Alamat Email
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nama@posyanduaster.id"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              disabled={isLoading}
              className="w-full h-11 border border-gray-200 rounded-xl pl-10 pr-4 text-sm outline-none
                focus:ring-2 focus:ring-blue-400 focus:border-transparent
                hover:border-gray-300 transition-all bg-gray-50 focus:bg-white
                disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-gray-500 tracking-wider uppercase"
            >
              Kata Sandi
            </label>
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-xs text-blue-500 hover:text-blue-700 font-semibold transition-colors flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" />
              Lupa Sandi?
            </button>
          </div>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
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
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-60"
              aria-label={
                showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
              }
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <label className="flex items-center gap-2.5 cursor-pointer group select-none">
          <div className="relative">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="sr-only peer"
            />
            <div
              className="w-4 h-4 border-2 border-gray-300 rounded peer-checked:bg-blue-500
                peer-checked:border-blue-500 transition-all flex items-center justify-center"
            >
              {rememberMe && (
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
            Ingat akun saya di perangkat ini
          </span>
        </label>

        {/* Submit Button */}
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
              <span>Memverifikasi...</span>
            </>
          ) : (
            <>
              <span>Masuk ke Dashboard</span>
              <span>→</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400">
            <span className="bg-white px-3">Belum punya akun?</span>
          </div>
        </div>

        {/* Daftar Akun Button */}
        <button
          type="button"
          onClick={() => setIsContactModalOpen(true)}
          className="w-full h-11 border-2 border-dashed border-gray-200 rounded-xl
            text-sm font-semibold text-gray-500 hover:border-blue-300 hover:text-blue-600
            hover:bg-blue-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Hubungi Admin untuk Daftar Akun
        </button>
      </form>

      {/* Modals */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </>
  );
}