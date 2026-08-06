"use client";

import { useEffect, useRef } from "react";
import {
  X,
  MessageCircle,
  Mail,
  MapPin,
  UserPlus,
  Loader2,
  PhoneCall,
} from "lucide-react";
import { useContactInfo } from "@/hooks/useContactInfo";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { contact, loading } = useContactInfo();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const rawPhone = contact?.phone || "+62 856-4651-9926";
  const waDigits = rawPhone.replace(/\D/g, "");
  const waFormatted = waDigits.startsWith("0") ? "62" + waDigits.slice(1) : waDigits.startsWith("62") ? waDigits : "62" + waDigits;
  const waLink = `https://wa.me/${waFormatted}?text=${encodeURIComponent(
    "Halo Admin Posyandu Aster, saya ingin meminta pembuatan akun untuk sistem informasi digital."
  )}`;

  const mailLink = contact?.email
    ? `mailto:${contact.email}?subject=${encodeURIComponent(
        "Permohonan Pembuatan Akun - Posyandu Aster"
      )}&body=${encodeURIComponent(
        "Halo Admin,\n\nSaya ingin meminta pembuatan akun untuk mengakses sistem informasi digital Posyandu Aster.\n\nNama Lengkap: \nJabatan / Peran: \n\nTerima kasih."
      )}`
    : null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Daftar Akun Baru</h2>
          <p className="text-blue-100 text-sm mt-1 leading-relaxed">
            Akun hanya dibuat oleh Administrator. Hubungi kami melalui salah
            satu cara di bawah ini.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Memuat kontak...</span>
            </div>
          ) : (
            <>
              {/* WhatsApp */}
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
                      Chat via WhatsApp
                    </p>
                    <p className="text-xs text-emerald-600 font-medium truncate">
                      {contact?.phone || "Tidak tersedia"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Respons tercepat — Pesan sudah disiapkan otomatis
                    </p>
                  </div>
                  <div className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </div>
                </a>
              ) : (
                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 opacity-50">
                  <div className="w-11 h-11 bg-gray-300 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-500">
                      WhatsApp tidak tersedia
                    </p>
                    <p className="text-xs text-gray-400">
                      Nomor belum dikonfigurasi
                    </p>
                  </div>
                </div>
              )}

              {/* Email */}
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
                      Kirim Email
                    </p>
                    <p className="text-xs text-blue-600 font-medium truncate">
                      {contact?.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Template email sudah disiapkan otomatis
                    </p>
                  </div>
                  <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </div>
                </a>
              ) : (
                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 opacity-50">
                  <div className="w-11 h-11 bg-gray-300 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-500">
                      Email tidak tersedia
                    </p>
                    <p className="text-xs text-gray-400">
                      Email belum dikonfigurasi
                    </p>
                  </div>
                </div>
              )}

              {/* Datang Langsung */}
              <div className="flex items-start gap-4 p-4 rounded-2xl border-2 border-orange-100 bg-orange-50">
                <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-200">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">
                    Datang Langsung
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                    {contact?.address || "Alamat belum tersedia"}
                  </p>
                  <p className="text-xs text-orange-600 font-medium mt-1">
                    Saat jam operasional posyandu
                  </p>
                </div>
              </div>

              {/* Telepon langsung */}
              {contact?.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-4 p-4 rounded-2xl border-2 border-violet-100 bg-violet-50 hover:bg-violet-100 hover:border-violet-200 transition-all group"
                >
                  <div className="w-11 h-11 bg-violet-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-200 group-hover:scale-110 transition-transform">
                    <PhoneCall className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">
                      Telepon Langsung
                    </p>
                    <p className="text-xs text-violet-600 font-medium">
                      {contact.phone}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Hubungi pada jam kerja
                    </p>
                  </div>
                  <div className="text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </div>
                </a>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full h-10 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
