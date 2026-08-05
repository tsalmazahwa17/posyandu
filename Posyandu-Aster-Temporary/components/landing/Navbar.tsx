"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Tentang", href: "#tentang" },
    { name: "Layanan", href: "#layanan" },
    { name: "Jadwal", href: "#jadwal" },
    { name: "Berita", href: "/berita" },
    { name: "Produk PMT", href: "/produk" },
    { name: "Dokumentasi", href: "/dokumentasi" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm py-3 border-b border-gray-200/80"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Brand Logo with Aster & Pertamina Patra Niaga */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/images/logo-aster.jpg"
              alt="Logo Posyandu 6 SPM Aster"
              className="w-10 h-10 rounded-full object-cover border border-amber-200 shadow-xs flex-shrink-0"
            />
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-lg leading-tight">
                Posyandu Aster
              </span>
              <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
                SISTEM INFORMASI DIGITAL
              </span>
            </div>

            {/* Co-Branding Pertamina Patra Niaga */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-200">
              <span className="text-[10px] text-gray-400 font-medium">Binaan</span>
              <img
                src="/images/logo-pertamina.png"
                alt="Pertamina Patra Niaga"
                className="h-6 object-contain"
              />
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-white border border-gray-200/80 rounded-full px-4 py-1.5 shadow-2xs">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs font-semibold text-gray-600 hover:text-blue-600 px-3.5 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Action */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all hover:shadow-md"
            >
              <span>Masuk Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg shadow-xs"
            >
              Masuk
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-6 py-4 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 mt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-xs"
              >
                <span>Masuk Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
