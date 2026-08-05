import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ArrowRight, Calendar, Image as ImageIcon, Video } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Galeri Dokumentasi | Posyandu Aster",
  description: "Dokumentasi foto dan video kegiatan penimbangan balita, kelas bumil, pemeriksaan lansia, dan kebersamaan warga.",
};

export default async function PublicDokumentasiPage() {
  const dbDocs = await prisma.documentation.findMany({
    orderBy: { activityDate: "desc" },
    include: {
      uploader: { select: { fullName: true } },
    },
  });

  const gallery = dbDocs.map((d) => ({
    id: d.id,
    title: d.title,
    mediaType: d.mediaType,
    date: new Date(d.activityDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    description: d.description || "Dokumentasi kegiatan pelayanan Posyandu Aster.",
    fileUrl: d.fileUrl,
  }));

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 flex flex-col justify-between">
      <Navbar />

      <main className="pt-32 pb-20 flex-1">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-gray-200/80 px-3.5 py-2 rounded-xl shadow-2xs hover:shadow-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-sm mb-10">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block mb-1">
              DOKUMENTASI PELAYANAN
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Galeri Foto & Video Posyandu Aster
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-blue-100 leading-relaxed max-w-xl">
              Dokumentasi kegiatan penimbangan balita, kelas bumil, pemeriksaan lansia, dan kebersamaan warga.
            </p>
          </div>

          {gallery.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-xs">
              <ImageIcon className="w-12 h-12 mx-auto text-slate-300" />
              <h2 className="mt-4 text-base font-bold text-slate-700">Belum ada dokumentasi</h2>
              <p className="mt-1 text-sm text-slate-500">Foto dan video akan tampil otomatis setelah diunggah dari dashboard.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gallery.map((item) => (
              <Link
                key={item.id}
                href={`/dokumentasi/${item.id}`}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="h-44 bg-slate-900 relative overflow-hidden">
                    <SafeImage
                      src={item.fileUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                        {item.mediaType === "VIDEO" ? <Video size={11} /> : <ImageIcon size={11} />}
                        {item.mediaType === "VIDEO" ? "Video" : "Foto"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{item.date}</span>
                    </div>

                    <h2 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
                      {item.title}
                    </h2>

                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-1 flex justify-end border-t border-gray-50">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                    <span>Lihat Dokumentasi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
