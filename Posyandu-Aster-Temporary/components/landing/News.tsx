import Link from "next/link";
import { ArrowRight, Calendar, Newspaper } from "lucide-react";
import { prisma } from "@/lib/prisma";

function getNewsThumbnail(url?: string | null): string {
  return url?.trim() || "";
}

export default async function News() {
  let dbNews: any[] = [];
  try {
    dbNews = await prisma.news.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: {
        category: { select: { id: true, name: true } },
      },
    });
  } catch (error) {
    console.error("[News] Database fetch error:", error);
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
    summary: n.excerpt || `${n.content.slice(0, 120)}${n.content.length > 120 ? "..." : ""}`,
    thumbnail: getNewsThumbnail(n.thumbnail),
  }));

  return (
    <section id="berita" className="py-20 bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Kabar Aster Terkini
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Artikel kesehatan, pengumuman, dan kabar kegiatan Posyandu Aster.
            </p>
          </div>

          <Link
            href="/berita"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-2xs hover:shadow-xs transition-all"
          >
            <span>Lihat Semua Berita</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* News Grid */}
        {articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Newspaper className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600">Belum ada berita yang diterbitkan.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="h-40 bg-slate-100 relative overflow-hidden border-b border-gray-100">
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
                  <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-blue-800 shadow-xs border border-blue-100">
                    {article.category?.name || "Kabar"}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{article.date}</span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2">
                    {article.title}
                  </h3>

                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {article.summary}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 flex justify-end">
                <Link
                  href={`/berita/${article.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Lihat Detail</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
