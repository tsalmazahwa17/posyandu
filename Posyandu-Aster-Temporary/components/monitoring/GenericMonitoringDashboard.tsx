"use client";

import { useMemo, useState } from "react";
import { Activity, BarChart3, CalendarCheck2, Database, Sparkles, UserRound } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface GenericMetric {
  key: string;
  label: string;
  unit: string;
}

export interface GenericRecord {
  id: number;
  date: string;
  metrics: Record<string, number | null>;
  notes: string | null;
}

export interface GenericPerson {
  id: number;
  fullName: string;
  gender: "MALE" | "FEMALE";
  records: GenericRecord[];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { month: "short", year: "2-digit" }).format(
    new Date(Date.UTC(year, month - 1, 1))
  );
}

export default function GenericMonitoringDashboard({
  title,
  description,
  people,
  metrics,
  databaseAvailable,
  initialPersonId = null,
}: {
  title: string;
  description: string;
  people: GenericPerson[];
  metrics: GenericMetric[];
  databaseAvailable: boolean;
  initialPersonId?: number | null;
}) {
  const initialSelection = people.some((person) => person.id === initialPersonId)
    ? initialPersonId
    : people[0]?.id ?? null;
  const [view, setView] = useState<"general" | "individual">(
    initialPersonId && initialSelection === initialPersonId ? "individual" : "general"
  );
  const [metricKey, setMetricKey] = useState(metrics[0]?.key ?? "");
  const [selectedId, setSelectedId] = useState<number | null>(initialSelection);
  const selectedMetric = metrics.find((metric) => metric.key === metricKey) ?? metrics[0];
  const selectedPerson = people.find((person) => person.id === selectedId) ?? people[0];
  const totalRecords = people.reduce((sum, person) => sum + person.records.length, 0);

  const generalTrend = useMemo(() => {
    const buckets = new Map<string, number[]>();
    people.forEach((person) => {
      person.records.forEach((record) => {
        const value = record.metrics[metricKey];
        if (typeof value !== "number") return;
        const key = record.date.slice(0, 7);
        const bucket = buckets.get(key) ?? [];
        bucket.push(value);
        buckets.set(key, bucket);
      });
    });
    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, values]) => ({
        month: formatMonth(month),
        value: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)),
      }));
  }, [metricKey, people]);

  const individualTrend = useMemo(
    () =>
      (selectedPerson?.records ?? [])
        .filter((record) => typeof record.metrics[metricKey] === "number")
        .map((record) => ({ date: formatDate(record.date), value: record.metrics[metricKey] })),
    [metricKey, selectedPerson]
  );

  const latestValues = useMemo(() => {
    return metrics.map((metric) => {
      const values = people
        .map((person) => person.records.at(-1)?.metrics[metric.key])
        .filter((value): value is number => typeof value === "number");
      return {
        ...metric,
        average: values.length ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)) : null,
      };
    });
  }, [metrics, people]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="dashboard-hero relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-[0_32px_90px_-45px_rgba(15,23,42,.9)] sm:px-8">
        <span className="dashboard-orb absolute -right-10 -top-16 h-52 w-52 rounded-full bg-blue-400/20 blur-3xl" />
        <span className="dashboard-orb-slow absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-fuchsia-400/15 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100"><Sparkles className="h-3.5 w-3.5" /> Dashboard monitoring interaktif</span>
            <h1 className="mt-4 text-2xl font-bold sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">{description}</p>
          </div>
          <span className="inline-flex self-start items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur lg:self-auto">
            <span className={`h-2.5 w-2.5 rounded-full ${databaseAvailable ? "bg-emerald-400" : "bg-amber-400"}`} />
            {databaseAvailable ? "Database terhubung" : "Database tidak tersedia"}
          </span>
        </div>
      </section>

      {!databaseAvailable ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Database belum dapat dihubungi sehingga grafik tersimpan belum memiliki data.</div> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="dashboard-card rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><UserRound className="h-5 w-5 text-blue-600" /><p className="mt-4 text-sm text-slate-500">Individu aktif</p><p className="mt-1 text-3xl font-bold text-slate-950">{people.length}</p></article>
        <article className="dashboard-card rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><CalendarCheck2 className="h-5 w-5 text-violet-600" /><p className="mt-4 text-sm text-slate-500">Total pemeriksaan</p><p className="mt-1 text-3xl font-bold text-slate-950">{totalRecords}</p></article>
        <article className="dashboard-card rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><Activity className="h-5 w-5 text-emerald-600" /><p className="mt-4 text-sm text-slate-500">Indikator tersedia</p><p className="mt-1 text-3xl font-bold text-slate-950">{metrics.length}</p></article>
        <article className="dashboard-card rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><Database className="h-5 w-5 text-amber-600" /><p className="mt-4 text-sm text-slate-500">Cakupan riwayat</p><p className="mt-1 text-3xl font-bold text-slate-950">{people.length ? Math.round((people.filter((person) => person.records.length).length / people.length) * 100) : 0}%</p></article>
      </section>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="inline-flex self-start rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          <button type="button" onClick={() => setView("general")} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${view === "general" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}>Grafik General</button>
          <button type="button" onClick={() => setView("individual")} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${view === "individual" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}>Grafik Per Individu</button>
        </div>
        <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">Indikator<select value={metricKey} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setMetricKey(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100">{metrics.map((metric) => <option key={metric.key} value={metric.key}>{metric.label}</option>)}</select></label>
      </div>

      {view === "general" ? (
        <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between"><div><h2 className="font-bold text-slate-900">Tren rata-rata {selectedMetric?.label.toLowerCase()}</h2><p className="mt-1 text-xs text-slate-500">Rata-rata seluruh pemeriksaan per bulan.</p></div><BarChart3 className="h-5 w-5 text-slate-400" /></div>
            <div className="mt-5 h-[340px] min-w-0">
              {generalTrend.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={generalTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}><defs><linearGradient id="genericArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} /><stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 6" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} unit={selectedMetric?.unit ? ` ${selectedMetric.unit}` : ""} width={60} /><Tooltip contentStyle={{ borderRadius: 16, borderColor: "#e2e8f0" }} /><Area type="monotone" dataKey="value" name={selectedMetric?.label} stroke="#2563eb" strokeWidth={3} fill="url(#genericArea)" activeDot={{ r: 6 }} animationDuration={900} /></AreaChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">Belum ada data untuk indikator ini.</div>}
            </div>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Rata-rata nilai terbaru</h2><p className="mt-1 text-xs text-slate-500">Ringkasan lintas individu pada pemeriksaan terakhir.</p>
            <div className="mt-5 space-y-3">{latestValues.map((metric) => <div key={metric.key} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><span className="text-sm font-medium text-slate-600">{metric.label}</span><span className="text-lg font-bold text-slate-950">{metric.average == null ? "—" : `${metric.average.toLocaleString("id-ID")} ${metric.unit}`}</span></div></div>)}</div>
          </article>
        </section>
      ) : (
        <section className="space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="block text-sm font-semibold text-slate-700">Pilih individu<select value={selectedPerson?.id ?? ""} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setSelectedId(Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" disabled={!people.length}>{!people.length ? <option value="">Belum ada data</option> : null}{people.map((person) => <option key={person.id} value={person.id}>{person.fullName}</option>)}</select></label>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Riwayat {selectedMetric?.label.toLowerCase()} {selectedPerson ? `· ${selectedPerson.fullName}` : ""}</h2><p className="mt-1 text-xs text-slate-500">Grafik berubah mengikuti individu dan indikator yang dipilih.</p>
            <div className="mt-5 h-[360px] min-w-0">{individualTrend.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={individualTrend} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 6" /><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} unit={selectedMetric?.unit ? ` ${selectedMetric.unit}` : ""} width={60} /><Tooltip contentStyle={{ borderRadius: 16, borderColor: "#e2e8f0" }} /><Line type="monotone" dataKey="value" name={selectedMetric?.label} stroke="#0f766e" strokeWidth={3.5} dot={{ r: 5, fill: "#fff", strokeWidth: 3 }} activeDot={{ r: 7 }} animationDuration={950} /></LineChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">Individu ini belum memiliki data untuk indikator tersebut.</div>}</div>
          </article>
        </section>
      )}
    </div>
  );
}
