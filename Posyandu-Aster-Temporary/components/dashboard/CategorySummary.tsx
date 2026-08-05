import { Baby, HeartPulse, GraduationCap, BriefcaseMedical, Accessibility, TrendingUp, TrendingDown } from "lucide-react";

const ICONS: Record<string, { icon: typeof Baby; bg: string; text: string }> = {
  Balita: { icon: Baby, bg: "bg-pink-100", text: "text-pink-600" },
  "Ibu Hamil": { icon: HeartPulse, bg: "bg-rose-100", text: "text-rose-600" },
  Remaja: { icon: GraduationCap, bg: "bg-violet-100", text: "text-violet-600" },
  "Usia Produktif": {
    icon: BriefcaseMedical,
    bg: "bg-blue-100",
    text: "text-blue-600",
  },
  "Lanjut Usia": {
    icon: Accessibility,
    bg: "bg-amber-100",
    text: "text-amber-600",
  },
};

interface CategoryItem {
  id: number;
  name: string;
  count: number;
  growthPercentage?: number | null;
}

export default function CategorySummary({ items }: { items: CategoryItem[] }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-gray-800 mb-1">
        Ringkasan Sasaran
      </h2>
      <p className="text-xs text-gray-400 mb-3">
        Jumlah sasaran aktif berdasarkan kategori pelayanan, dibanding
        pendaftaran bulan lalu
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((item) => {
          const style = ICONS[item.name] ?? {
            icon: Baby,
            bg: "bg-gray-100",
            text: "text-gray-600",
          };
          const Icon = style.icon;
          const growth = item.growthPercentage;
          const hasGrowth = growth !== null && growth !== undefined;
          const isPositive = (growth ?? 0) >= 0;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-9 h-9 rounded-xl ${style.bg} flex items-center justify-center mb-3`}
                >
                  <Icon className={style.text} size={18} />
                </div>
                {hasGrowth && (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isPositive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-2.5 h-2.5" />
                    ) : (
                      <TrendingDown className="w-2.5 h-2.5" />
                    )}
                    {isPositive ? "+" : ""}
                    {growth}%
                  </span>
                )}
              </div>
              <p className="text-xl font-bold text-gray-900 leading-none">
                {item.count}
              </p>
              <p className="text-xs text-gray-500 mt-1.5">{item.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
