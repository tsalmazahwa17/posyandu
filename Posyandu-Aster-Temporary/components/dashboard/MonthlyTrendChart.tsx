"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Calendar } from "lucide-react";

interface MonthlyDataPoint {
  month: string;
  total: number;
  balita?: number;
  bumil?: number;
  remaja?: number;
  produktif?: number;
  lansia?: number;
}

interface Props {
  data: MonthlyDataPoint[];
}

const CATEGORY_FILTERS = [
  { key: "total", label: "Semua Kategori", color: "#2563eb" },
  { key: "balita", label: "Balita", color: "#ec4899" },
  { key: "bumil", label: "Ibu Hamil", color: "#f43f5e" },
  { key: "remaja", label: "Remaja", color: "#8b5cf6" },
  { key: "produktif", label: "Usia Produktif", color: "#059669" },
  { key: "lansia", label: "Lanjut Usia", color: "#f59e0b" },
] as const;

export default function MonthlyTrendChart({ data }: Props) {
  const [selectedKey, setSelectedKey] = useState<string>("total");

  const allMonths = useMemo(() => data.map((d) => d.month), [data]);
  const [fromMonth, setFromMonth] = useState<string>("");
  const [toMonth, setToMonth] = useState<string>("");

  const activeFilter =
    CATEGORY_FILTERS.find((f) => f.key === selectedKey) || CATEGORY_FILTERS[0];

  const filteredData = useMemo(() => {
    if (!fromMonth && !toMonth) return data;
    return data.filter((d) => {
      const idx = allMonths.indexOf(d.month);
      const fromIdx = fromMonth ? allMonths.indexOf(fromMonth) : 0;
      const toIdx = toMonth ? allMonths.indexOf(toMonth) : allMonths.length - 1;
      return idx >= fromIdx && idx <= toIdx;
    });
  }, [data, fromMonth, toMonth, allMonths]);

  const chartData = filteredData.map((d) => ({
    month: d.month,
    count: Number(d[selectedKey as keyof MonthlyDataPoint] ?? d.total ?? 0),
  }));

  const hasData = chartData.some((d) => d.count > 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-800">
              Kunjungan Bulanan
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Jumlah kehadiran 6 bulan terakhir ({activeFilter.label})
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORY_FILTERS.map((f) => {
            const isSelected = f.key === selectedKey;
            return (
              <button
                key={f.key}
                onClick={() => setSelectedKey(f.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-white border-2 border-blue-200 text-blue-600 font-bold shadow-xs"
                    : "text-gray-500 hover:text-blue-600 hover:bg-blue-50/40"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-3 bg-gray-50/70 px-4 py-2.5 rounded-xl border border-gray-100">
        <span className="text-xs font-semibold text-gray-600">Filter Rentang Bulan:</span>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={fromMonth}
            onChange={(e) => setFromMonth(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 outline-none focus:border-blue-400"
          >
            <option value="">Dari Bulan</option>
            {allMonths.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <span className="text-xs text-gray-400">s/d</span>
          <select
            value={toMonth}
            onChange={(e) => setToMonth(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 outline-none focus:border-blue-400"
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

      {hasData ? (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
            >
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
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
                labelStyle={{ fontWeight: 600, color: "#334155" }}
                formatter={(value) => [
                  `${value ?? 0} Kehadiran`,
                  activeFilter.label,
                ]}
              />
              <Line
                type="monotone"
                dataKey="count"
                name={activeFilter.label}
                stroke={activeFilter.color}
                strokeWidth={2.5}
                connectNulls={false}
                dot={{ r: 4, fill: activeFilter.color, stroke: "#ffffff", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: activeFilter.color, stroke: "#ffffff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-56 flex items-center justify-center text-sm text-gray-400">
          Belum ada data kehadiran {activeFilter.label.toLowerCase()} untuk ditampilkan.
        </div>
      )}
    </div>
  );
}
