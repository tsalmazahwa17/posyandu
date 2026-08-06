import { Clock, MapPin, ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Schedule() {
  let dbEvents: any[] = [];
  try {
    dbEvents = await prisma.event.findMany({
      where: { isPublished: true },
      orderBy: { startDate: "asc" },
      take: 3,
    });
  } catch (error) {
    console.error("[Schedule] Database fetch error:", error);
  }

  const events = dbEvents.map((e) => {
    const d = new Date(e.startDate);
    return {
      id: e.id,
      date: d.toLocaleDateString("id-ID", { day: "2-digit" }),
      month: d.toLocaleDateString("id-ID", { month: "short" }),
      title: e.title,
      time: d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      location: e.location || "Balai Posyandu Aster",
      category: e.title.includes("Balita") ? "Balita" : e.title.includes("Bumil") ? "Ibu Hamil" : "Umum",
    };
  });

  return (
    <section id="jadwal" className="py-20 bg-white border-y border-gray-200/60">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Jadwal Pelayanan
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Jadwal pelaksanaan kegiatan Posyandu Aster bulan ini.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
          >
            <span>Masuk Dashboard Presensi</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Schedule Grid */}
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <Calendar className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600">Belum ada jadwal mendatang yang dipublikasikan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-600 text-white rounded-xl px-3.5 py-2 text-center shadow-2xs">
                      <span className="text-xl font-bold block leading-none">{item.date}</span>
                      <span className="text-[10px] font-semibold uppercase">{item.month}</span>
                    </div>

                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg border bg-blue-50 text-blue-700 border-blue-100">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{item.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{item.location}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <Link
                    href="/login"
                    className="w-full inline-flex items-center justify-center py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    Konfirmasi Kehadiran
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
