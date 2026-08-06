import { Users, Baby, Heart, UserCheck, Activity } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function Statistics() {
  let totalCount = 0;
  let balitaCount = 0;
  let bumilCount = 0;
  let remajaCount = 0;
  let lansiaCount = 0;

  try {
    const counts = await prisma.visitor.groupBy({
      by: ["categoryId"],
      where: { isActive: true },
      _count: { _all: true },
    });

    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c.name.toLowerCase()]));

    counts.forEach((item) => {
      const name = categoryMap.get(item.categoryId) || "";
      const cnt = item._count._all;
      totalCount += cnt;

      if (name.includes("balita")) balitaCount += cnt;
      else if (name.includes("ibu hamil") || name.includes("bumil")) bumilCount += cnt;
      else if (name.includes("remaja")) remajaCount += cnt;
      else if (name.includes("lansia") || name.includes("lanjut usia")) lansiaCount += cnt;
    });
  } catch (error) {
    console.error("[Statistics] Error loading visitor counts:", error);
  }

  const stats = [
    {
      value: totalCount > 0 ? String(totalCount) : "0",
      label: "Total Sasaran",
      subtext: "Semua Kategori",
      icon: Users,
      badgeColor: "bg-blue-50 text-blue-600",
    },
    {
      value: balitaCount > 0 ? String(balitaCount) : "0",
      label: "Balita",
      subtext: "KMS & Gizi",
      icon: Baby,
      badgeColor: "bg-amber-50 text-amber-600",
    },
    {
      value: bumilCount > 0 ? String(bumilCount) : "0",
      label: "Bumil",
      subtext: "Pemeriksaan ANC",
      icon: Heart,
      badgeColor: "bg-rose-50 text-rose-600",
    },
    {
      value: remajaCount > 0 ? String(remajaCount) : "0",
      label: "Remaja",
      subtext: "Skrining Anemia",
      icon: UserCheck,
      badgeColor: "bg-emerald-50 text-emerald-600",
    },
    {
      value: lansiaCount > 0 ? String(lansiaCount) : "0",
      label: "Lansia",
      subtext: "Pemeriksaan PTM",
      icon: Activity,
      badgeColor: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <section className="py-16 bg-white border-y border-gray-200/60">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Ringkasan Sasaran
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Jumlah sasaran aktif penerima pelayanan kesehatan Posyandu Aster.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat, idx) => {
            const IconComp = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg ${stat.badgeColor} flex items-center justify-center`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400">Aktif</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 leading-tight">
                  {stat.value}
                </p>
                <p className="text-xs font-semibold text-gray-700 mt-1">
                  {stat.label}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {stat.subtext}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
