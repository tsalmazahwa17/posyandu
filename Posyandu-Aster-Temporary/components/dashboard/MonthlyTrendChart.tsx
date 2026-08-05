"use client";

import { useState } from "react";
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

  const activeFilter =
    CATEGORY_FILTERS.find((f) => f.key === selectedKey) || CATEGORY_FILTERS[0];

  const chartData = data.map((d) => ({
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
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORY_FILTERS.map((f) => {
            const isSelected = f.key === selectedKey;
            return (
              <button
                key={f.key}
                onClick={() => setSelectedKey(f.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
                }`}
              >
                {f.label}
              </button>
            );
          })}
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
