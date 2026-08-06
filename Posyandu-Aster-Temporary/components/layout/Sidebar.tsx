"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LayoutDashboard, Users, QrCode, Baby, HeartPulse, GraduationCap, BriefcaseMedical, Accessibility, Newspaper, Package, Image as ImageIcon, FileText, UserCog, MessageCircle, CalendarCheck, ClipboardList, CalendarDays } from "lucide-react";
import { useContactInfo } from "@/hooks/useContactInfo";
import type { SessionPayload } from "@/lib/session";

interface MenuItem {
  title: string;
  icon: typeof LayoutDashboard;
  href: string;
  adminOnly?: boolean;
  allowedRoles?: ("ADMIN" | "KADER" | "MASYARAKAT")[];
}

interface MenuSection {
  label: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    label: "Menu Utama",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      {
        title: "Data Sasaran",
        icon: Users,
        href: "/sasaran",
        allowedRoles: ["ADMIN", "KADER"],
      },
      {
        title: "Absensi Posyandu",
        icon: CalendarCheck,
        href: "/absensi",
        allowedRoles: ["ADMIN", "KADER", "MASYARAKAT"],
      },
      { title: "Jadwal Posyandu", icon: CalendarDays, href: "/jadwal", allowedRoles: ["ADMIN", "KADER", "MASYARAKAT"] },
    ],
  },
  {
    label: "Monitoring Kesehatan",
    items: [
      { title: "Balita (Bulan 1-12)", icon: Baby, href: "/monitoring/balita", allowedRoles: ["ADMIN", "KADER"] },
      { title: "Ibu Hamil (Bumil)", icon: HeartPulse, href: "/monitoring/bumil", allowedRoles: ["ADMIN", "KADER"] },
      { title: "Remaja & Sekolah", icon: GraduationCap, href: "/monitoring/remaja", allowedRoles: ["ADMIN", "KADER"] },
      { title: "Usia Produktif", icon: BriefcaseMedical, href: "/monitoring/produktif", allowedRoles: ["ADMIN", "KADER"] },
      { title: "Lanjut Usia (Lansia)", icon: Accessibility, href: "/monitoring/lansia", allowedRoles: ["ADMIN", "KADER"] },
    ],
  },
  {
    label: "Pengelolaan Konten",
    items: [
      { title: "Berita & Pencapaian", icon: Newspaper, href: "/konten/berita" },
      { title: "Katalog Produk PMT", icon: Package, href: "/konten/produk" },
      { title: "Dokumentasi Kegiatan", icon: ImageIcon, href: "/konten/dokumentasi", allowedRoles: ["ADMIN", "KADER", "MASYARAKAT"] },
      { title: "Arsip Digital & SOP", icon: FileText, href: "/konten/arsip", allowedRoles: ["ADMIN", "KADER", "MASYARAKAT"] },
      { title: "Manajemen User (Akun)", icon: UserCog, href: "/user", adminOnly: true },
    ],
  },
  {
    label: "Riwayat Saya",
    items: [
      { title: "Riwayat Kehadiran", icon: ClipboardList, href: "/absensi", allowedRoles: ["MASYARAKAT"] },
    ],
  },
];

function isItemActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarProps {
  user: SessionPayload;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { contact } = useContactInfo();

  const waNumber = contact?.phone?.replace(/\D/g, "");
  const waLink = waNumber ? `https://wa.me/62${waNumber.replace(/^0/, "")}` : null;

  return (
    <>
      {/* Sidebar Panel */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-[260px] z-40 flex flex-col
          bg-white border-r border-gray-200/80
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:z-auto lg:shrink-0
        `}
      >
        {/* Brand + Close Button Row */}
        <div className="px-5 pt-6 pb-5 border-b border-gray-100 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <img
              src="/images/logo-aster.jpg"
              alt="Posyandu Aster"
              className="w-9 h-9 rounded-full object-cover border border-amber-200 shadow-xs flex-shrink-0"
            />
            <div>
              <h1 className="font-bold text-[15px] text-slate-800 leading-none">
                Posyandu Aster
              </h1>
              <p className="text-[10px] font-semibold text-gray-400 tracking-wide uppercase mt-1">
                Sistem Informasi Digital
              </p>
            </div>
          </Link>

          {/* Close button — only visible on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {menuSections.map((section) => {
            const items = section.items.filter((item) => {
              if (item.adminOnly && user.role !== "ADMIN") return false;
              if (item.allowedRoles && !item.allowedRoles.includes(user.role)) return false;
              return true;
            });
            if (items.length === 0) return null;

            return (
              <div key={section.label}>
                <p className="px-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(pathname, item.href);
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                          active
                            ? "bg-blue-50 text-blue-600 font-semibold"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-medium"
                        }`}
                      >
                        <Icon size={17} strokeWidth={active ? 2.4 : 2} />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom help & CSR card */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs">
            <img
              src="/images/logo-pertamina.png"
              alt="Pertamina Patra Niaga"
              className="h-6 object-contain flex-shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-slate-800 leading-none">Binaan Program CSR</span>
              <span className="text-[9px] text-gray-400 font-medium truncate mt-0.5">Pertamina Patra Niaga</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mb-2.5">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs font-semibold text-slate-800">Butuh Bantuan?</p>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Hubungi tim admin untuk kendala teknis sistem.
            </p>
            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Hubungi via WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}
