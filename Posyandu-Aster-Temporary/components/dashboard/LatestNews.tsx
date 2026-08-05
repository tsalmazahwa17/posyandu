import Link from "next/link";
import { ArrowUpRight, Newspaper } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string | null;
  publishedAt: Date | null;
}

export default function LatestNews({ items }: { items: NewsItem[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-gray-800">
            Kabar Terkini
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Berita dan informasi terbaru posyandu
          </p>
        </div>
        <Link
          href="/konten/berita"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Kelola
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8 text-center text-sm text-gray-400">
          Belum ada berita yang dipublikasikan.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-28 bg-gradient-to-br from-blue-50 to-indigo-100/60 relative">
                {item.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Newspaper className="w-6 h-6 text-blue-300" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">
                  {item.title}
                </p>
                <p className="text-[11px] text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                  {item.excerpt}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
