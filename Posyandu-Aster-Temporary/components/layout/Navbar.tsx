"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, LogOut, User, ChevronDown, Menu } from "lucide-react";
import type { SessionPayload } from "@/lib/session";
import RealtimeStatusBadge from "@/components/realtime/RealtimeStatusBadge";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface NavbarProps {
  user: SessionPayload;
  onMenuToggle: () => void;
}

export default function Navbar({ user, onMenuToggle }: NavbarProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200/80 flex items-center gap-3 px-4 sm:px-6 sticky top-0 z-20">
      {/* Hamburger — only on < lg */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
        aria-label="Buka menu navigasi"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search Bar — hidden on xs, visible sm+ */}
      <div className="relative hidden sm:block flex-1 max-w-[380px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          placeholder="Cari nama sasaran, arsip, atau layanan..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
        />
      </div>

      <div className="ml-auto"><RealtimeStatusBadge /></div>

      {/* User Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen((v) => !v)}
          className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 rounded-xl pl-2 pr-2 sm:pr-3 py-1.5 transition-colors"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-none">
              {user.fullName}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {user.role === "ADMIN" ? "Administrator" : user.role === "MASYARAKAT" ? "Masyarakat" : "Kader"}
            </p>
          </div>

          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
            {getInitials(user.fullName)}
          </div>

          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform hidden sm:block ${
              isMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200/80 shadow-lg py-2 z-30">
            <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
              <p className="text-sm font-semibold text-gray-800">
                {user.fullName}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {user.role === "ADMIN" ? "Administrator" : user.role === "MASYARAKAT" ? "Masyarakat" : "Kader"}
              </p>
            </div>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                router.push("/change-password");
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4" />
              Ganti Kata Sandi
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? "Keluar..." : "Keluar"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
