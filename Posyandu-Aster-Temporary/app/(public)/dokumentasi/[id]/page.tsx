import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Calendar, Image as ImageIcon, User, Video, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const docId = parseInt(id);

  if (!isNaN(docId)) {
    const doc = await prisma.documentation.findUnique({
      where: { id: docId },
    });
    if (doc) {
      return {
        title: `${doc.title} | Galeri Dokumentasi Posyandu Aster`,
        description: doc.description || doc.title,
      };
    }
  }

  return {
    title: "Detail Dokumentasi | Posyandu Aster",
  };
}

interface DocData {
  id: number;
  title: string;
  mediaType: string;
  activityDate: Date | string;
  createdAt?: Date | string;
  description: string | null;
  fileUrl: string;
  uploader?: { fullName: string } | null;
}

export default async function PublicDokumentasiDetailPage({ params }: Props) {
  const { id } = await params;
  const docId = parseInt(id);

  let doc: DocData | null = null;
  let relatedDocs: DocData[] = [];

  if (!isNaN(docId)) {
    doc = await prisma.documentation.findUnique({
      where: { id: docId },
      include: {
        uploader: { select: { id: true, fullName: true } },
      },
    });

    if (doc) {
      relatedDocs = await prisma.documentation.findMany({
        where: { id: { not: docId } },
        orderBy: { activityDate: "desc" },
        take: 4,
      });
    }
  }


  if (!doc) {
    notFound();
  }

  const formattedDate = new Date(doc.activityDate || doc.createdAt || Date.now()).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between">
      <Navbar />

      <main className="pt-28 pb-20 flex-1">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          {/* Back Button */}
          <div>
            <Link
              href="/dokumentasi"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-white border border-gray-200/80 px-4 py-2.5 rounded-xl shadow-2xs hover:shadow-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Kembali ke Galeri Dokumentasi</span>
            </Link>
          </div>

          {/* Documentation Detail Card */}
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-10 space-y-6 overflow-hidden">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                {doc.mediaType === "VIDEO" ? <Video size={13} /> : <ImageIcon size={13} />}
                Dokumentasi {doc.mediaType === "VIDEO" ? "Video" : "Foto"}
              </span>

              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>{formattedDate}</span>
              </div>

              {doc.uploader && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium ml-auto">
                  <User size={13} className="text-gray-400" />
                  <span>Diunggah oleh: {doc.uploader.fullName}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
              {doc.title}
            </h1>

            {/* Media Player / Image Display */}
            <div className="w-full rounded-2xl overflow-hidden shadow-xs border border-gray-100 bg-slate-900 relative">
              {doc.mediaType === "VIDEO" ? (
                <video
                  src={doc.fileUrl}
                  controls
                  className="w-full max-h-[500px] object-contain mx-auto"
                />
              ) : (
                <img
                  src={doc.fileUrl}
                  alt={doc.title}
                  className="w-full h-auto max-h-[550px] object-cover"
                />
              )}
            </div>

            {/* Description */}
            {doc.description && (
              <div className="pt-4 border-t border-gray-100 text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Keterangan Kegiatan
                </h3>
                <p className="text-sm text-slate-700">{doc.description}</p>
              </div>
            )}
          </div>

          {/* Related Gallery Items */}
          {relatedDocs.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-gray-200/80">
              <h2 className="text-xl font-bold text-slate-900">Dokumentasi Lainnya</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {relatedDocs.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/dokumentasi/${rel.id}`}
                    className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
                  >
                    <div className="h-32 bg-slate-900 relative overflow-hidden">
                      {rel.fileUrl ? (
                        <img
                          src={rel.fileUrl}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon size={28} />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-xs text-slate-800 group-hover:text-blue-600 transition line-clamp-1">
                        {rel.title}
                      </h3>
                      <div className="mt-2 text-[10px] text-blue-600 font-semibold flex items-center justify-end">
                        <span>Lihat</span>
                        <ArrowRight size={12} className="ml-0.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
