import { prisma } from "@/lib/prisma";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}

function monthKey(date: Date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function avg(nums: (number | null | undefined)[]): number | null {
  const valid = nums.filter((n): n is number => n !== null && n !== undefined && !isNaN(n) && isFinite(n));
  if (valid.length === 0) return null;
  const sum = valid.reduce((a, b) => a + b, 0);
  return Math.round((sum / valid.length) * 10) / 10;
}

// Kategori sasaran yang dipantau + warna tema
export const MONITORING_CATEGORIES = [
  { id: "balita", name: "Balita", label: "Balita (Bulan 1-12)", color: "#ec4899", gradient: "from-pink-500 to-rose-500" },
  { id: "bumil", name: "Ibu Hamil", label: "Ibu Hamil (Bumil)", color: "#f43f5e", gradient: "from-rose-500 to-red-500" },
  { id: "remaja", name: "Remaja", label: "Remaja & Sekolah", color: "#8b5cf6", gradient: "from-violet-500 to-purple-500" },
  { id: "produktif", name: "Usia Produktif", label: "Usia Produktif", color: "#2563eb", gradient: "from-blue-600 to-indigo-600" },
  { id: "lansia", name: "Lanjut Usia", label: "Lanjut Usia (Lansia)", color: "#f59e0b", gradient: "from-amber-500 to-orange-500" },
] as const;

export async function getDashboardData() {
  const today = startOfDay(new Date());
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const thisMonthStart = startOfMonth(today);
  const lastMonthStart = new Date(thisMonthStart);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

  const [
    profile,
    totalActiveVisitors,
    todayHadirCount,
    categoryCounts,
    visitorRegistrations,
    recentAttendanceRaw,
    monthlyAttendanceRaw,
    balitaExams,
    bumilExams,
    remajaExams,
    produktifExams,
    lansiaExams,
    upcomingEvents,
    latestNews,
    latestProducts,
    latestDocumentation,
  ] = await Promise.all([
    prisma.profile.findFirst({
      select: { organizationName: true, tagline: true },
    }),
    prisma.visitor.count({ where: { isActive: true } }),
    prisma.attendance.count({
      where: { attendanceDate: today, status: "HADIR" },
    }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { visitors: { where: { isActive: true } } } },
      },
      orderBy: { id: "asc" },
    }),
    prisma.visitor.findMany({
      where: { createdAt: { gte: lastMonthStart } },
      select: { categoryId: true, createdAt: true },
    }),
    prisma.attendance.findMany({
      take: 6,
      orderBy: [{ attendanceDate: "desc" }, { attendanceTime: "desc" }],
      include: {
        visitor: { select: { fullName: true, category: { select: { name: true } } } },
      },
    }),
    prisma.attendance.findMany({
      where: { status: "HADIR", attendanceDate: { gte: sixMonthsAgo } },
      select: {
        attendanceDate: true,
        visitor: { select: { category: { select: { name: true } } } },
      },
    }),
    prisma.monitoringBalita.findMany({
      where: { examinationDate: { gte: sixMonthsAgo } },
      select: { examinationDate: true, weight: true, height: true, headCircumference: true },
    }),
    prisma.monitoringIbuHamil.findMany({
      where: { examinationDate: { gte: sixMonthsAgo } },
      select: { examinationDate: true, weight: true, systolicBP: true, hb: true, lila: true },
    }),
    prisma.monitoringRemaja.findMany({
      where: { examinationDate: { gte: sixMonthsAgo } },
      select: { examinationDate: true, weight: true, height: true, hb: true, armCircumference: true },
    }),
    prisma.monitoringUsiaProduktif.findMany({
      where: { examinationDate: { gte: sixMonthsAgo } },
      select: { examinationDate: true, bmi: true, systolicBP: true, bloodSugar: true, cholesterol: true, weight: true },
    }),
    prisma.monitoringLansia.findMany({
      where: { examinationDate: { gte: sixMonthsAgo } },
      select: { examinationDate: true, systolicBP: true, bloodSugar: true, cholesterol: true, uricAcid: true, weight: true },
    }),
    prisma.event.findMany({
      where: { isPublished: true, startDate: { gte: today } },
      take: 3,
      orderBy: { startDate: "asc" },
      select: {
        id: true,
        title: true,
        location: true,
        startDate: true,
      },
    }),
    prisma.news.findMany({
      where: { isPublished: true },
      take: 3,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnail: true,
        publishedAt: true,
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      take: 3,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, price: true, image: true, stock: true },
    }),
    prisma.documentation.findMany({
      take: 3,
      orderBy: { activityDate: "desc" },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        mediaType: true,
        activityDate: true,
      },
    }),
  ]);

  // Susun 6 bulan terakhir untuk kunjungan per kategori
  const monthBuckets: { key: string; label: string }[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(sixMonthsAgo);
    d.setMonth(d.getMonth() + i);
    monthBuckets.push({ key: monthKey(d), label: monthLabel(d) });
  }

  const monthlyAttendanceTrend = monthBuckets.map((b) => {
    const rows = monthlyAttendanceRaw.filter(
      (r) => monthKey(r.attendanceDate) === b.key
    );
    return {
      month: b.label,
      total: rows.length,
      balita: rows.filter((r) =>
        r.visitor.category.name.toLowerCase().includes("balita")
      ).length,
      bumil: rows.filter(
        (r) =>
          r.visitor.category.name.toLowerCase().includes("hamil") ||
          r.visitor.category.name.toLowerCase().includes("bumil")
      ).length,
      remaja: rows.filter((r) =>
        r.visitor.category.name.toLowerCase().includes("remaja")
      ).length,
      produktif: rows.filter((r) =>
        r.visitor.category.name.toLowerCase().includes("produktif")
      ).length,
      lansia: rows.filter((r) =>
        r.visitor.category.name.toLowerCase().includes("lansia")
      ).length,
    };
  });

  // Agregasi rata-rata per bulan untuk seluruh individu di setiap kategori
  const categoryAggregateTrends = {
    balita: monthBuckets.map((b) => {
      const records = balitaExams.filter((r) => monthKey(r.examinationDate) === b.key);
      return {
        month: b.label,
        count: records.length,
        weight: avg(records.map((r) => Number(r.weight))),
        height: avg(records.map((r) => Number(r.height))),
        headCircumference: avg(records.map((r) => Number(r.headCircumference))),
      };
    }),
    bumil: monthBuckets.map((b) => {
      const records = bumilExams.filter((r) => monthKey(r.examinationDate) === b.key);
      return {
        month: b.label,
        count: records.length,
        weight: avg(records.map((r) => Number(r.weight))),
        systolicBP: avg(records.map((r) => r.systolicBP)),
        hb: avg(records.map((r) => Number(r.hb))),
        lila: avg(records.map((r) => Number(r.lila))),
      };
    }),
    remaja: monthBuckets.map((b) => {
      const records = remajaExams.filter((r) => monthKey(r.examinationDate) === b.key);
      return {
        month: b.label,
        count: records.length,
        weight: avg(records.map((r) => Number(r.weight))),
        height: avg(records.map((r) => Number(r.height))),
        hb: avg(records.map((r) => Number(r.hb))),
        armCircumference: avg(records.map((r) => Number(r.armCircumference))),
      };
    }),
    produktif: monthBuckets.map((b) => {
      const records = produktifExams.filter((r) => monthKey(r.examinationDate) === b.key);
      return {
        month: b.label,
        count: records.length,
        bmi: avg(records.map((r) => Number(r.bmi))),
        systolicBP: avg(records.map((r) => r.systolicBP)),
        bloodSugar: avg(records.map((r) => Number(r.bloodSugar))),
        cholesterol: avg(records.map((r) => Number(r.cholesterol))),
        weight: avg(records.map((r) => Number(r.weight))),
      };
    }),
    lansia: monthBuckets.map((b) => {
      const records = lansiaExams.filter((r) => monthKey(r.examinationDate) === b.key);
      return {
        month: b.label,
        count: records.length,
        systolicBP: avg(records.map((r) => r.systolicBP)),
        bloodSugar: avg(records.map((r) => Number(r.bloodSugar))),
        cholesterol: avg(records.map((r) => Number(r.cholesterol))),
        uricAcid: avg(records.map((r) => Number(r.uricAcid))),
        weight: avg(records.map((r) => Number(r.weight))),
      };
    }),
  };

  const totalCategoryCount = categoryCounts.reduce(
    (sum, c) => sum + c._count.visitors,
    0
  );

  const growthByCategory = new Map<number, { thisMonth: number; lastMonth: number }>();
  for (const v of visitorRegistrations) {
    const entry = growthByCategory.get(v.categoryId) ?? { thisMonth: 0, lastMonth: 0 };
    if (v.createdAt >= thisMonthStart) entry.thisMonth += 1;
    else entry.lastMonth += 1;
    growthByCategory.set(v.categoryId, entry);
  }

  return {
    organizationName: profile?.organizationName ?? "Posyandu Aster",
    tagline:
      profile?.tagline ??
      "Pelayanan sehat, data rapi, keputusan lebih cepat.",
    totalActiveVisitors,
    todayHadirCount,
    categorySummary: categoryCounts.map((c) => {
      const growth = growthByCategory.get(c.id);
      let growthPercentage: number | null = null;
      if (growth) {
        if (growth.lastMonth > 0) {
          growthPercentage =
            Math.round(
              ((growth.thisMonth - growth.lastMonth) / growth.lastMonth) * 1000
            ) / 10;
        } else if (growth.thisMonth > 0) {
          growthPercentage = 100;
        } else {
          growthPercentage = 0;
        }
      }
      return {
        id: c.id,
        name: c.name,
        count: c._count.visitors,
        percentage:
          totalCategoryCount > 0
            ? Math.round((c._count.visitors / totalCategoryCount) * 100)
            : 0,
        growthPercentage,
      };
    }),
    monthlyTrend: monthlyAttendanceTrend,
    categoryAggregateTrends,
    monitoringCategories: MONITORING_CATEGORIES,
    upcomingEvents,
    recentAttendance: recentAttendanceRaw.map((a) => ({
      id: a.id,
      fullName: a.visitor.fullName,
      category: a.visitor.category.name,
      time: a.attendanceTime.toISOString().slice(11, 16),
      method: a.method,
      status: a.status,
    })),
    latestNews,
    latestProducts: latestProducts.map((p) => ({
      ...p,
      price: Number(p.price),
    })),
    latestDocumentation,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

