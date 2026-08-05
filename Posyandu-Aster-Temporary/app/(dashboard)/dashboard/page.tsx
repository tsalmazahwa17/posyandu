import { getSession } from "@/lib/session";
import { getDashboardData } from "@/lib/dashboard-data";
import HeroBanner from "@/components/dashboard/HeroBanner";
import CategorySummary from "@/components/dashboard/CategorySummary";
import MonitoringTrendChart from "@/components/dashboard/MonitoringTrendChart";
import MonthlyTrendChart from "@/components/dashboard/MonthlyTrendChart";
import CategoryDistribution from "@/components/dashboard/CategoryDistribution";
import RecentActivity from "@/components/dashboard/RecentActivity";
import UpcomingSchedule from "@/components/dashboard/UpcomingSchedule";
import QuickModules from "@/components/dashboard/QuickModules";
import ProductShowcase from "@/components/dashboard/ProductShowcase";
import RecentDocumentation from "@/components/dashboard/RecentDocumentation";
import LatestNews from "@/components/dashboard/LatestNews";

export const metadata = {
  title: "Dasbor | Posyandu Aster",
};

export default async function DashboardPage() {
  const session = await getSession();
  const data = await getDashboardData();

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50/60 min-h-full">
      <HeroBanner
        fullName={session?.fullName ?? "Pengguna"}
        organizationName={data.organizationName}
        tagline={data.tagline}
        todayHadirCount={data.todayHadirCount}
        totalActiveVisitors={data.totalActiveVisitors}
      />

      <LatestNews items={data.latestNews} />

      <CategorySummary items={data.categorySummary} />

      {/* Grafik umum / gabungan seluruh kategori sasaran.
          Grafik pertumbuhan per-individu ada di masing-masing halaman Monitoring. */}
      <MonitoringTrendChart
        data={data.categoryAggregateTrends}
        categories={data.monitoringCategories}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MonthlyTrendChart data={data.monthlyTrend} />
        </div>
        <CategoryDistribution items={data.categorySummary} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentActivity items={data.recentAttendance} />
        </div>
        <UpcomingSchedule items={data.upcomingEvents} />
      </div>

      <QuickModules />

      <ProductShowcase items={data.latestProducts} />

      <RecentDocumentation items={data.latestDocumentation} />
    </div>
  );
}
