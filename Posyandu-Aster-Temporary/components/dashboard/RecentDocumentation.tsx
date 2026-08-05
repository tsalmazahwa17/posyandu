import Link from "next/link";
import { ArrowUpRight, Image as ImageIcon, PlayCircle } from "lucide-react";

interface DocItem {
  id: number;
  title: string;
  fileUrl: string;
  mediaType: string;
  activityDate: Date;
}

export default function RecentDocumentation({ items }: { items: DocItem[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-gray-800">
            Dokumentasi Terbaru
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Galeri kegiatan posyandu terkini
          </p>
        </div>
        <Link
          href="/konten/dokumentasi"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Lihat Semua
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">
          Belum ada dokumentasi kegiatan.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative rounded-xl overflow-hidden h-28 group bg-gray-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.fileUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                {item.mediaType === "VIDEO" ? (
                  <PlayCircle className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                )}
              </div>
              <p className="absolute bottom-2 left-2.5 right-2.5 text-white text-xs font-semibold leading-snug line-clamp-2">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
