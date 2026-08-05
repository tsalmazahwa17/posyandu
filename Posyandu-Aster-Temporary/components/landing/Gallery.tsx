import Link from "next/link";
import { ArrowRight, Image as ImageIcon, Video } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function Gallery() {
  let dbDocs: any[] = [];
  try {
    dbDocs = await prisma.documentation.findMany({
      orderBy: { activityDate: "desc" },
      take: 4,
    });
  } catch (error) {
    console.error("[Gallery] Database fetch error:", error);
  }

  const gradients = [
    "from-blue-600 via-blue-700 to-indigo-900",
    "from-amber-600 via-orange-700 to-red-900",
    "from-teal-600 via-emerald-700 to-cyan-900",
    "from-purple-600 via-indigo-700 to-slate-900",
  ];

  const galleryItems = dbDocs.map((d, index) => ({
    id: d.id,
    title: d.title,
    date: new Date(d.activityDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    mediaType: d.mediaType,
    gradient: gradients[index % gradients.length],
    fileUrl: d.fileUrl,
  }));

  return (
    <section id="dokumentasi" className="py-20 bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Dokumentasi Terbaru
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Galeri foto & video dokumentasi pelayanan serta kegiatan Posyandu Aster.
            </p>
          </div>

          <Link
            href="/dokumentasi"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-2xs hover:shadow-xs transition-all"
          >
            <span>Lihat Galeri Lengkap</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Gallery Grid */}
        {galleryItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <ImageIcon className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600">Belum ada dokumentasi yang diunggah.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className={`h-52 rounded-2xl ${
                item.fileUrl
                  ? "bg-slate-900"
                  : `bg-gradient-to-br ${item.gradient}`
              } p-5 text-white flex flex-col justify-between shadow-xs hover:shadow-lg transition-all group overflow-hidden relative`}
            >
              {item.fileUrl && (
                <img
                  src={item.fileUrl}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-75 transition duration-300"
                />
              )}
              <div className="flex items-center justify-between z-10">
                <span className="text-xs font-bold bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/20 flex items-center gap-1">
                  {item.mediaType === "VIDEO" ? <Video size={12} /> : <ImageIcon size={12} />}
                  {item.mediaType === "VIDEO" ? "Video" : "Foto"}
                </span>
              </div>

              <div className="z-10 bg-slate-900/60 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                <p className="text-[10px] text-white/80 font-medium mb-0.5">{item.date}</p>
                <h3 className="text-xs font-bold leading-tight group-hover:text-blue-200 transition-colors line-clamp-2">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
