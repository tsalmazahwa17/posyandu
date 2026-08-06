"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Baby, HeartPulse, GraduationCap, BriefcaseMedical, Accessibility } from "lucide-react";

interface MonitoringCategoryTabsProps {
  title: string;
  description: string;
  databaseAvailable?: boolean;
}

const categories = [
  { id: "balita", label: "Balita (1-12 Bln)", href: "/monitoring/balita", icon: Baby },
  { id: "bumil", label: "Ibu Hamil (Bumil)", href: "/monitoring/bumil", icon: HeartPulse },
  { id: "remaja", label: "Remaja & Sekolah", href: "/monitoring/remaja", icon: GraduationCap },
  { id: "produktif", label: "Usia Produktif", href: "/monitoring/produktif", icon: BriefcaseMedical },
  { id: "lansia", label: "Lanjut Usia (Lansia)", href: "/monitoring/lansia", icon: Accessibility },
];

export default function MonitoringCategoryTabs({
  title,
  description,
  databaseAvailable = true,
}: MonitoringCategoryTabsProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      {/* Banner Card — matches HeroBanner blue gradient background with decorative blur circles */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 text-white p-6 shadow-lg shadow-blue-200/60">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-16 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-1.5 max-w-2xl leading-relaxed">{description}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
            <span className={`w-2 h-2 rounded-full ${databaseAvailable ? "bg-emerald-400" : "bg-amber-400"}`} />
            <span className="text-xs font-medium text-white">
              {databaseAvailable ? "Database Terhubung" : "Mode Lokal"}
            </span>
          </div>
        </div>
      </div>

      {/* Category Tab Selection Pills — Pill design matching user image selection style */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-2.5 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = pathname === cat.href || pathname.startsWith(cat.href);
            return (
              <Link
                key={cat.id}
                href={cat.href}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-white border-2 border-blue-200 text-blue-600 font-bold shadow-xs"
                    : "text-gray-500 hover:text-blue-600 hover:bg-blue-50/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                <span>{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
