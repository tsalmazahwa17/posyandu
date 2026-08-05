import Link from "next/link";
import { ArrowUpRight, QrCode, Pencil } from "lucide-react";

interface ActivityItem {
  id: number;
  fullName: string;
  category: string;
  time: string;
  method: string;
  status: string;
}

export default function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-gray-800">
            Aktivitas Pelayanan Terbaru
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Absensi kunjungan terakhir yang tercatat
          </p>
        </div>
        <Link
          href="/absensi"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Lihat Semua
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">
          Belum ada absensi tercatat hari ini.
        </p>
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="font-medium px-2 py-2">Nama</th>
                <th className="font-medium px-2 py-2">Kategori</th>
                <th className="font-medium px-2 py-2">Metode</th>
                <th className="font-medium px-2 py-2">Jam</th>
                <th className="font-medium px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="px-2 py-2.5 font-medium text-gray-800">
                    {item.fullName}
                  </td>
                  <td className="px-2 py-2.5 text-gray-500">
                    {item.category}
                  </td>
                  <td className="px-2 py-2.5 text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      {item.method === "QR" ? (
                        <QrCode className="w-3.5 h-3.5" />
                      ) : (
                        <Pencil className="w-3.5 h-3.5" />
                      )}
                      {item.method === "QR" ? "QR" : "Manual"}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-gray-500">{item.time}</td>
                  <td className="px-2 py-2.5">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        item.status === "HADIR"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {item.status === "HADIR" ? "Hadir" : "Tidak Hadir"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
