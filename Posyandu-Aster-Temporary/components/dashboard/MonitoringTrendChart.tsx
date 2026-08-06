"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Users,
  HeartPulse,
} from "lucide-react";
import { MONITORING_CATEGORIES } from "@/lib/dashboard-data";

interface CategoryTrendData {
  month: string;
  count: number;
  [key: string]: string | number | null;
}

interface Props {
  data: {
    balita: CategoryTrendData[];
    bumil: CategoryTrendData[];
    remaja: CategoryTrendData[];
    produktif: CategoryTrendData[];
    lansia: CategoryTrendData[];
  };
  categories: typeof MONITORING_CATEGORIES;
}

// Konfigurasi indikator per kategori (sesuai UI UX halaman monitoring)
const METRIC_CONFIGS: Record<
  string,
  {
    key: string;
    label: string;
    unit: string;
    color: string;
    strokeColor: string;
    gradientId: string;
    normalStatus: string;
  }[]
> = {
  lansia: [
    {
      key: "systolicBP",
      label: "Tekanan Darah",
      unit: "mmHg",
      color: "#4f46e5",
      strokeColor: "#4338ca",
      gradientId: "colorBP",
      normalStatus: "Sistolik Rata-Rata Normal (< 140)",
    },
    {
      key: "bloodSugar",
      label: "Gula Darah",
      unit: "mg/dL",
      color: "#059669",
      strokeColor: "#047857",
      gradientId: "colorSugar",
      normalStatus: "Sewaktu Rata-Rata Terkontrol (< 200)",
    },
    {
      key: "cholesterol",
      label: "Kolesterol",
      unit: "mg/dL",
      color: "#d97706",
      strokeColor: "#b45309",
      gradientId: "colorChol",
      normalStatus: "Rata-Rata Batas Normal (< 200)",
    },
    {
      key: "uricAcid",
      label: "Asam Urat",
      unit: "mg/dL",
      color: "#dc2626",
      strokeColor: "#b91c1c",
      gradientId: "colorUric",
      normalStatus: "Rata-Rata Normal (3.4 - 7.0)",
    },
    {
      key: "weight",
      label: "Berat Badan",
      unit: "kg",
      color: "#2563eb",
      strokeColor: "#1d4ed8",
      gradientId: "colorWeight",
      normalStatus: "Stabil dalam Rentang Ideal",
    },
  ],
  bumil: [
    {
      key: "weight",
      label: "Berat Badan",
      unit: "kg",
      color: "#2563eb",
      strokeColor: "#1d4ed8",
      gradientId: "colorBumilWeight",
      normalStatus: "Pertambahan BB Sesuai Usia Kehamilan",
    },
    {
      key: "systolicBP",
      label: "Tekanan Darah",
      unit: "mmHg",
      color: "#4f46e5",
      strokeColor: "#4338ca",
      gradientId: "colorBumilBP",
      normalStatus: "Bebas dari Risiko Hipertensi / Preeklamsia",
    },
    {
      key: "hb",
      label: "Hemoglobin",
      unit: "g/dL",
      color: "#e11d48",
      strokeColor: "#be123c",
      gradientId: "colorHb",
      normalStatus: "Kadar Hemoglobin Normal (≥ 11 g/dL)",
    },
    {
      key: "lila",
      label: "LILA",
      unit: "cm",
      color: "#059669",
      strokeColor: "#047857",
      gradientId: "colorLila",
      normalStatus: "Bebas Risiko KEK (LILA ≥ 23.5 cm)",
    },
  ],
  balita: [
    {
      key: "weight",
      label: "Berat Badan",
      unit: "kg",
      color: "#ec4899",
      strokeColor: "#db2777",
      gradientId: "colorBalitaWeight",
      normalStatus: "Garis Pertumbuhan BB Naik Sesuai KMS",
    },
    {
      key: "height",
      label: "Tinggi Badan",
      unit: "cm",
      color: "#8b5cf6",
      strokeColor: "#7c3aed",
      gradientId: "colorHeight",
      normalStatus: "Tinggi Badan Bebas dari Stunting",
    },
    {
      key: "headCircumference",
      label: "Lingkar Kepala",
      unit: "cm",
      color: "#06b6d4",
      strokeColor: "#0891b2",
      gradientId: "colorHead",
      normalStatus: "Perkembangan Otak & Kepala Normal",
    },
  ],
  remaja: [
    {
      key: "weight",
      label: "Berat Badan",
      unit: "kg",
      color: "#8b5cf6",
      strokeColor: "#7c3aed",
      gradientId: "colorRemajaWeight",
      normalStatus: "Berat Badan Terjaga Baik",
    },
    {
      key: "height",
      label: "Tinggi Badan",
      unit: "cm",
      color: "#2563eb",
      strokeColor: "#1d4ed8",
      gradientId: "colorRemajaHeight",
      normalStatus: "Pertumbuhan Tinggi Optimal",
    },
    {
      key: "hb",
      label: "Hemoglobin",
      unit: "g/dL",
      color: "#e11d48",
      strokeColor: "#be123c",
      gradientId: "colorRemajaHb",
      normalStatus: "Bebas Anemia Remaja",
    },
    {
      key: "armCircumference",
      label: "LLA",
      unit: "cm",
      color: "#059669",
      strokeColor: "#047857",
      gradientId: "colorRemajaLla",
      normalStatus: "Status Gizi Terpenuhi",
    },
  ],
  produktif: [
    {
      key: "bmi",
      label: "Indeks Massa Tubuh (IMT)",
      unit: "",
      color: "#2563eb",
      strokeColor: "#1d4ed8",
      gradientId: "colorBmi",
      normalStatus: "IMT Rata-Rata Normal (18.5 - 25.0)",
    },
    {
      key: "systolicBP",
      label: "Tekanan Darah",
      unit: "mmHg",
      color: "#4f46e5",
      strokeColor: "#4338ca",
      gradientId: "colorProdBP",
      normalStatus: "Tekanan Darah Bebas Hipertensi",
    },
    {
      key: "bloodSugar",
      label: "Gula Darah",
      unit: "mg/dL",
      color: "#059669",
      strokeColor: "#047857",
      gradientId: "colorProdSugar",
      normalStatus: "Skrining Gula Darah Normal",
    },
    {
      key: "cholesterol",
      label: "Kolesterol",
      unit: "mg/dL",
      color: "#d97706",
      strokeColor: "#b45309",
      gradientId: "colorProdChol",
      normalStatus: "Profil Lipid Normal",
    },
  ],
};

export default function MonitoringTrendChart({ data, categories }: Props) {
  const [selectedCatId, setSelectedCatId] = useState<string>("lansia");
  const [selectedMetricIndex, setSelectedMetricIndex] = useState<number>(0);

  // Build list of available months from all category data
  const allMonths = useMemo(() => {
    const months = new Set<string>();
    Object.values(data).forEach((catData) =>
      catData.forEach((d) => { if (d.month) months.add(d.month); })
    );
    return [...months]; // already sorted by server (sixMonthsAgo → today)
  }, [data]);

  const [fromMonth, setFromMonth] = useState<string>("");
  const [toMonth, setToMonth] = useState<string>("");

  const activeCategory =
    categories.find((c) => c.id === selectedCatId) || categories[4];
  const metrics = METRIC_CONFIGS[selectedCatId] || METRIC_CONFIGS["lansia"];

  const safeMetricIndex =
    selectedMetricIndex >= metrics.length ? 0 : selectedMetricIndex;
  const activeMetric = metrics[safeMetricIndex];

  const categoryData: CategoryTrendData[] =
    data[selectedCatId as keyof typeof data] || data.lansia;

  // Filter by selected month range
  const filteredData = useMemo(() => {
    if (!fromMonth && !toMonth) return categoryData;
    return categoryData.filter((item) => {
      if (fromMonth && allMonths.indexOf(item.month) < allMonths.indexOf(fromMonth)) return false;
      if (toMonth && allMonths.indexOf(item.month) > allMonths.indexOf(toMonth)) return false;
      return true;
    });
  }, [categoryData, fromMonth, toMonth, allMonths]);

  // Pastikan data bernilai angka valid — null if no data (so no false 0-lines)
  const chartData = filteredData.map((item) => {
    const rawVal = item[activeMetric.key];
    const num = rawVal !== null && rawVal !== undefined ? Number(rawVal) : null;
    return {
      month: item.month,
      value: (num !== null && num > 0) ? num : null,
      count: item.count,
    };
  });

  // Nilai rata-rata terkini (bulan terakhir yang ada data)
  const validDataPoints = chartData.filter((d) => d.value !== null && d.value > 0);
  const latestPoint = validDataPoints[validDataPoints.length - 1];
  const latestValue = latestPoint?.value ?? null;

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 lg:p-7 space-y-6">
      {/* ── TOP HEADER & CATEGORY TABS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <HeartPulse className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-gray-900">
              Grafik Perkembangan Kesehatan — Seluruh Sasaran Posyandu
            </h2>
          </div>
          <p className="text-xs text-gray-500">
            Rekap indikator kesehatan rata-rata seluruh individu dalam satu kategori
            di Posyandu Aster.
          </p>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = cat.id === selectedCatId;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCatId(cat.id);
                  setSelectedMetricIndex(0);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? `bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-[1.02]`
                    : `bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900`
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── METRIC SELECTION PILLS + DATE RANGE FILTER ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            {metrics.map((m, idx) => {
              const isSelected = idx === safeMetricIndex;
              return (
                <button
                  key={m.key}
                  onClick={() => setSelectedMetricIndex(idx)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-white text-blue-600 shadow-sm border border-blue-200/80 ring-2 ring-blue-500/20"
                      : "text-gray-500 hover:text-gray-800 hover:bg-white/60"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span>Kategori: <strong className="text-gray-700">{activeCategory.label}</strong></span>
          </div>
        </div>

        {/* Date range filter */}
        <div className="flex flex-wrap items-center gap-3 bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
          <span className="text-xs font-semibold text-gray-600">Filter Rentang Bulan:</span>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={fromMonth}
              onChange={(e) => setFromMonth(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
            >
              <option value="">Dari Bulan</option>
              {allMonths.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <span className="text-xs text-gray-400">s/d</span>
            <select
              value={toMonth}
              onChange={(e) => setToMonth(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
            >
              <option value="">Sampai Bulan</option>
              {allMonths.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            {(fromMonth || toMonth) && (
              <button
                onClick={() => { setFromMonth(""); setToMonth(""); }}
                className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CHART & SUMMARY CARD (2 COLUMN GRID) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Chart Area (Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-xs relative flex flex-col justify-between">
          {/* Header Inside Chart Card */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                Perkembangan {activeMetric.label.toLowerCase()}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Tren rata-rata seluruh individu terdaftar (6 bulan terakhir)
              </p>
            </div>

            {/* Current Average Stat Display */}
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {latestValue !== null && latestValue > 0 ? latestValue.toLocaleString("id-ID") : "—"}{" "}
                <span className="text-xs font-semibold text-gray-500">
                  {activeMetric.unit}
                </span>
              </p>
              <p className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                Rata-rata Seluruh Warga
              </p>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 25, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id={activeMetric.gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={activeMetric.color}
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor={activeMetric.color}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const val = payload[0].value;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-semibold text-slate-300">{label}</p>
                          <p className="text-sm font-bold text-white">
                            Rata-rata: {val} {activeMetric.unit}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Pemeriksaan aktif di bulan ini
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={activeMetric.strokeColor}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill={`url(#${activeMetric.gradientId})`}
                  connectNulls={false}
                  dot={{
                    r: 4.5,
                    fill: activeMetric.strokeColor,
                    stroke: "#ffffff",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 7,
                    fill: activeMetric.strokeColor,
                    stroke: "#ffffff",
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-50 pt-2.5">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              Grafik diperbarui otomatis dari hasil pemeriksaan terkini
            </span>
            <span>Data 6 Bulan Terakhir</span>
          </div>
        </div>

        {/* Right Column: Ringkasan Kondisi Posyandu (Span 1) */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border border-blue-100/80 p-5 flex flex-col justify-between space-y-5">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase bg-blue-100/70 px-2.5 py-1 rounded-md">
              RINGKASAN KONDISI
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-2">
              Status Kesehatan Posyandu
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Ringkasan pemantauan seluruh individu terdaftar pada kategori{" "}
              <strong>{activeCategory.name}</strong>.
            </p>
          </div>

          {/* Donut Score Indicator */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray="86, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-black text-sm text-slate-800">
                86%
              </span>
            </div>
            <div>
              <p className="font-bold text-xs text-slate-800">
                Kondisi Terpantau Baik
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Mayoritas sasaran berada dalam rentang pemantauan yang aman.
              </p>
            </div>
          </div>

          {/* Status Checklist items */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between bg-white/80 px-3.5 py-2.5 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-slate-700">
                  {activeMetric.label}
                </span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">
                Normal
              </span>
            </div>

            <div className="flex items-center justify-between bg-white/80 px-3.5 py-2.5 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-slate-700">
                  Partisipasi Pemeriksaan
                </span>
              </div>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                Aktif
              </span>
            </div>

            <div className="flex items-center justify-between bg-white/80 px-3.5 py-2.5 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-slate-700">
                  Perlunya Intervensi
                </span>
              </div>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">
                Rendah
              </span>
            </div>
          </div>

          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-400 italic">
              *Rincian pemeriksaan per-individu tersedia di menu Monitoring khusus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
