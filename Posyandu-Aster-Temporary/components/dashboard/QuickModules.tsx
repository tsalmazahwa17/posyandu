import Link from "next/link";
import {
  Users,
  QrCode,
  HeartPulse,
  Newspaper,
  Package,
  FileText,
} from "lucide-react";

const modules = [
  {
    title: "Data Sasaran",
    description: "Kelola data warga terdaftar",
    icon: Users,
    href: "/sasaran",
    color: "text-blue-600 bg-blue-100",
  },
  {
    title: "Absensi QR",
    description: "Pindai kehadiran kunjungan",
    icon: QrCode,
    href: "/absensi",
    color: "text-emerald-600 bg-emerald-100",
  },
  {
    title: "Monitoring Kesehatan",
    description: "Balita, bumil, remaja, lansia",
    icon: HeartPulse,
    href: "/monitoring/balita",
    color: "text-rose-600 bg-rose-100",
  },
  {
    title: "Berita",
    description: "Kelola informasi & artikel",
    icon: Newspaper,
    href: "/konten/berita",
    color: "text-violet-600 bg-violet-100",
  },
  {
    title: "Produk PMT",
    description: "Katalog makanan tambahan",
    icon: Package,
    href: "/konten/produk",
    color: "text-amber-600 bg-amber-100",
  },
  {
    title: "Arsip Digital",
    description: "Dokumen & laporan posyandu",
    icon: FileText,
    href: "/konten/arsip",
    color: "text-slate-600 bg-slate-100",
  },
];

export default function QuickModules() {
  return (
    <div>
      <h2 className="text-sm font-bold text-gray-800 mb-1">
        Modul Layanan Terintegrasi
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        Akses cepat ke fitur utama sistem
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.title}
              href={m.href}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${m.color}`}
              >
                <Icon size={18} />
              </div>
              <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {m.title}
              </p>
              <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                {m.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
