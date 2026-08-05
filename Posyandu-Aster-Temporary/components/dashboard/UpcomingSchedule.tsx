import { CalendarDays, MapPin } from "lucide-react";

interface EventItem {
  id: number;
  title: string;
  location: string | null;
  startDate: Date;
}

export default function UpcomingSchedule({ items }: { items: EventItem[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
      <h2 className="text-sm font-bold text-gray-800">Jadwal Terdekat</h2>
      <p className="text-xs text-gray-400 mt-0.5 mb-4">
        Kegiatan Posyandu yang akan datang
      </p>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">
          Belum ada jadwal kegiatan terbaru.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const day = item.startDate.toLocaleDateString("id-ID", {
              day: "2-digit",
            });
            const month = item.startDate.toLocaleDateString("id-ID", {
              month: "short",
            });
            const time = item.startDate.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <div key={item.id} className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600 leading-none">
                    {day}
                  </span>
                  <span className="text-[9px] font-semibold text-blue-400 uppercase mt-0.5">
                    {month}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-1">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                    {item.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {item.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1 flex-shrink-0">
                      <CalendarDays className="w-3 h-3" />
                      {time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
