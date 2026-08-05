import Link from "next/link";
import { PlusCircle, Users, CalendarCheck } from "lucide-react";

interface Props {
  fullName: string;
  organizationName: string;
  tagline: string;
  todayHadirCount: number;
  totalActiveVisitors: number;
}

export default function HeroBanner({
  fullName,
  organizationName,
  tagline,
  todayHadirCount,
  totalActiveVisitors,
}: Props) {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main banner */}
      <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 text-white p-7 shadow-lg shadow-blue-200/60">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-16 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
          Halo, {fullName.split(" ")[0]} 👋
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold mt-2 max-w-lg leading-snug">
          {tagline}
        </h1>
        <p className="text-sm text-blue-100 mt-2 max-w-md">
          Pantau aktivitas {organizationName} hari ini dan kelola layanan
          kesehatan warga dalam satu dasbor.
        </p>
        <Link
          href="/absensi"
          className="inline-flex items-center gap-2 mt-6 bg-white text-blue-600 hover:bg-blue-50 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Tambah Kunjungan
        </Link>
      </div>

      {/* Side info card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 flex flex-col justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Hari Ini
          </p>
          <p className="text-sm font-semibold text-gray-800 mt-1 capitalize">
            {today}
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 leading-none">
                {todayHadirCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">Hadir hari ini</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 leading-none">
                {totalActiveVisitors}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total sasaran aktif</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
