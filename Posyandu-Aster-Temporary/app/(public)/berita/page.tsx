import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Calendar, ArrowRight, ArrowLeft, Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Berita & Informasi | Posyandu Aster",
  description: "Artikel tepercaya seputar gizi, pola hidup sehat, dan pengumuman kegiatan Posyandu Aster.",
};

function getNewsThumbnail(url?: string | null): string {
  return url?.trim() || "";
}

export default async function PublicBeritaPage() {
  // Query db news
  let dbNews: any[] = [];
  try {
    dbNews = await prisma.news.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        author: { select: { id: true, fullName: true } },
      },
    });
  } catch (error) {
    console.error("[PublicBeritaPage] Database fetch error:", error);
  }

  const articles = dbNews.map((n) => ({
    id: n.id,
    title: n.title,
    category: n.category,
    date: new Date(n.publishedAt || n.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    summary: n.excerpt || `${n.content.slice(0, 140)}${n.content.length > 140 ? "..." : ""}`,
    thumbnail: getNewsThumbnail(n.thumbnail),
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

          {/* Banner matching Dashboard Hero */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-sm mb-10">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block mb-1">
              INFORMASI & EDUKASI
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Berita & Informasi Posyandu Aster
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-blue-100 leading-relaxed max-w-xl">
              Artikel tepercaya seputar gizi, pola hidup sehat, dan kabar kegiatan Posyandu Aster.
            </p>
          </div>

          {articles.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-xs">
              <Newspaper className="w-12 h-12 mx-auto text-slate-300" />
              <h2 className="mt-4 text-base font-bold text-slate-700">Belum ada berita yang diterbitkan</h2>
              <p className="mt-1 text-sm text-slate-500">Konten akan tampil otomatis setelah dipublikasikan dari dashboard.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/berita/${article.id}`}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="h-44 bg-slate-100 relative overflow-hidden border-b border-gray-100">
                    {article.thumbnail ? (
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 bg-gradient-to-br from-blue-50 to-indigo-50">
                        <Newspaper size={44} />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-xs text-blue-800 shadow-xs border border-blue-100">
                      {article.category?.name || "Edukasi"}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{article.date}</span>
                    </div>

                    <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2">
                      {article.title}
                    </h2>

                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                      {article.summary}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex justify-end">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                    <span>Baca Selengkapnya</span>
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
