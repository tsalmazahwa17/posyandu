"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Baby,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Info,
  Ruler,
  Scale,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getWhoReference,
  WHO_HEIGHT_FOR_AGE,
  WHO_WEIGHT_FOR_AGE,
  type GrowthGender,
  type WhoGrowthPoint,
} from "@/data/who-growth-standards";

export interface BalitaMonitoringRecord {
  id: number;
  examinationDate: string;
  ageMonth: number;
  weight: number;
  height: number;
  headCircumference: number | null;
  nutritionalStatus: string | null;
  notes: string | null;
}

export interface BalitaPerson {
  id: number;
  fullName: string;
  gender: GrowthGender;
  birthDate: string;
  records: BalitaMonitoringRecord[];
}

interface StatusResult {
  key: "below" | "normal" | "above" | "empty";
  label: string;
  description: string;
  badge: string;
}

function compareWithWho(
  metric: "weight" | "height",
  gender: GrowthGender,
  ageMonth: number,
  value: number | null | undefined
): StatusResult {
  if (!Number.isFinite(value)) {
    return {
      key: "empty",
      label: "Belum dinilai",
      description: "Masukkan atau pilih data pemeriksaan.",
      badge: "bg-slate-100 text-slate-600",
    };
  }

  const reference = getWhoReference(metric, gender, ageMonth);
  if ((value as number) < reference.minus2) {
    return {
      key: "below",
      label: "Di bawah −2 SD",
      description: "Perlu ditinjau kembali oleh tenaga kesehatan.",
      badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
    };
  }
  if ((value as number) > reference.plus2) {
    return {
      key: "above",
      label: "Di atas +2 SD",
      description: "Perlu interpretasi bersama indikator lain.",
      badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    };
  }
  return {
    key: "normal",
    label: "Rentang −2 s.d. +2 SD",
    description: "Nilai berada di rentang referensi utama WHO.",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  };
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

function latestRecord(person: BalitaPerson | undefined) {
  return person?.records.at(-1) ?? null;
}

function GrowthChart({
  title,
  subtitle,
  unit,
  data,
  actualLabel,
}: {
  title: string;
  subtitle: string;
  unit: string;
  data: Array<WhoGrowthPoint & { actual?: number }>;
  actualLabel: string;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-48px_rgba(15,23,42,.7)]">
      <div className="mb-4">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{subtitle}</p>
      </div>
      <div className="h-[330px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 6 }}>
            <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 6" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              interval={5}
              tick={{ fill: "#64748b", fontSize: 11 }}
              label={{ value: "Umur (bulan)", position: "insideBottom", offset: -2, fill: "#94a3b8", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              unit={unit}
              width={52}
            />
            <Tooltip
              labelFormatter={(label: unknown) => `Umur ${String(label)} bulan`}
              contentStyle={{ borderRadius: 16, borderColor: "#e2e8f0", boxShadow: "0 18px 50px -30px rgba(15,23,42,.5)" }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            <Line type="monotone" dataKey="minus2" name="WHO −2 SD" stroke="#f59e0b" strokeWidth={1.8} dot={false} strokeDasharray="6 5" animationDuration={700} />
            <Line type="monotone" dataKey="median" name="Median WHO" stroke="#8b5cf6" strokeWidth={2.3} dot={false} animationDuration={800} />
            <Line type="monotone" dataKey="plus2" name="WHO +2 SD" stroke="#f59e0b" strokeWidth={1.8} dot={false} strokeDasharray="6 5" animationDuration={700} />
            <Line
              type="monotone"
              dataKey="actual"
              name={actualLabel}
              stroke="#0f766e"
              strokeWidth={3.5}
              connectNulls
              dot={{ r: 4, fill: "#ffffff", strokeWidth: 3 }}
              activeDot={{ r: 7, strokeWidth: 3, fill: "#ffffff" }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export default function BalitaMonitoringDashboard({
  people,
  databaseAvailable,
  initialPersonId = null,
}: {
  people: BalitaPerson[];
  databaseAvailable: boolean;
  initialPersonId?: number | null;
}) {
  const initialSelection = people.some((person) => person.id === initialPersonId)
    ? initialPersonId
    : people[0]?.id ?? null;
  const [activeView, setActiveView] = useState<"general" | "individual">(
    initialPersonId && initialSelection === initialPersonId ? "individual" : "general"
  );
  const [inputMode, setInputMode] = useState<"stored" | "manual">("stored");
  const [selectedId, setSelectedId] = useState<number | null>(initialSelection);
  const selectedPerson = useMemo(
    () => people.find((person) => person.id === selectedId) ?? people[0],
    [people, selectedId]
  );
  const selectedLatest = latestRecord(selectedPerson);

  const [manualGender, setManualGender] = useState<GrowthGender>(selectedPerson?.gender ?? "MALE");
  const [manualAge, setManualAge] = useState(String(selectedLatest?.ageMonth ?? 12));
  const [manualWeight, setManualWeight] = useState(selectedLatest ? String(selectedLatest.weight) : "");
  const [manualHeight, setManualHeight] = useState(selectedLatest ? String(selectedLatest.height) : "");

  const totalMeasurements = useMemo(
    () => people.reduce((sum, person) => sum + person.records.length, 0),
    [people]
  );

  const latestStatuses = useMemo(
    () =>
      people.map((person) => {
        const latest = latestRecord(person);
        return {
          weight: compareWithWho("weight", person.gender, latest?.ageMonth ?? 0, latest?.weight),
          height: compareWithWho("height", person.gender, latest?.ageMonth ?? 0, latest?.height),
        };
      }),
    [people]
  );

  const normalCount = latestStatuses.filter(
    (item) => item.weight.key === "normal" && item.height.key === "normal"
  ).length;
  const attentionCount = latestStatuses.filter(
    (item) => item.weight.key === "below" || item.height.key === "below"
  ).length;
  const coverage = people.length ? Math.round((people.filter((person) => person.records.length > 0).length / people.length) * 100) : 0;

  const distributionData = useMemo(() => {
    const weight = { below: 0, normal: 0, above: 0 };
    const height = { below: 0, normal: 0, above: 0 };
    latestStatuses.forEach((status) => {
      if (status.weight.key !== "empty") weight[status.weight.key] += 1;
      if (status.height.key !== "empty") height[status.height.key] += 1;
    });
    return [
      { status: "< −2 SD", berat: weight.below, tinggi: height.below },
      { status: "−2 s.d. +2", berat: weight.normal, tinggi: height.normal },
      { status: "> +2 SD", berat: weight.above, tinggi: height.above },
    ];
  }, [latestStatuses]);

  const averageTrend = useMemo(() => {
    const groups = new Map<string, { weight: number[]; height: number[] }>();
    people.forEach((person) => {
      person.records.forEach((record) => {
        const key = record.examinationDate.slice(0, 7);
        const group = groups.get(key) ?? { weight: [], height: [] };
        group.weight.push(record.weight);
        group.height.push(record.height);
        groups.set(key, group);
      });
    });
    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, values]) => ({
        month: formatMonth(month),
        berat: Number((values.weight.reduce((a, b) => a + b, 0) / values.weight.length).toFixed(1)),
        tinggi: Number((values.height.reduce((a, b) => a + b, 0) / values.height.length).toFixed(1)),
      }));
  }, [people]);

  const effectiveGender = inputMode === "manual" ? manualGender : selectedPerson?.gender ?? "MALE";
  const manualAgeNumber = Math.max(0, Math.min(60, Number(manualAge) || 0));
  const manualWeightNumber = Number(manualWeight);
  const manualHeightNumber = Number(manualHeight);

  const effectiveRecords = useMemo(() => {
    if (inputMode === "manual") {
      return [
        {
          ageMonth: manualAgeNumber,
          weight: Number.isFinite(manualWeightNumber) && manualWeight !== "" ? manualWeightNumber : undefined,
          height: Number.isFinite(manualHeightNumber) && manualHeight !== "" ? manualHeightNumber : undefined,
        },
      ];
    }
    return (selectedPerson?.records ?? []).map((record) => ({
      ageMonth: record.ageMonth,
      weight: record.weight,
      height: record.height,
    }));
  }, [inputMode, manualAgeNumber, manualHeight, manualHeightNumber, manualWeight, manualWeightNumber, selectedPerson]);

  const weightChartData = useMemo(() => {
    const actual = new Map(effectiveRecords.map((record) => [Math.round(record.ageMonth), record.weight]));
    return WHO_WEIGHT_FOR_AGE[effectiveGender].map((point) => ({ ...point, actual: actual.get(point.month) }));
  }, [effectiveGender, effectiveRecords]);

  const heightChartData = useMemo(() => {
    const actual = new Map(effectiveRecords.map((record) => [Math.round(record.ageMonth), record.height]));
    return WHO_HEIGHT_FOR_AGE[effectiveGender].map((point) => ({ ...point, actual: actual.get(point.month) }));
  }, [effectiveGender, effectiveRecords]);

  const effectiveLatest = inputMode === "manual"
    ? { ageMonth: manualAgeNumber, weight: manualWeight !== "" ? manualWeightNumber : null, height: manualHeight !== "" ? manualHeightNumber : null }
    : selectedLatest;
  const weightStatus = compareWithWho("weight", effectiveGender, effectiveLatest?.ageMonth ?? 0, effectiveLatest?.weight);
  const heightStatus = compareWithWho("height", effectiveGender, effectiveLatest?.ageMonth ?? 0, effectiveLatest?.height);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="dashboard-hero relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-[0_32px_90px_-45px_rgba(15,23,42,.9)] sm:px-8 sm:py-9">
        <span className="dashboard-orb absolute -right-14 -top-16 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />
        <span className="dashboard-orb-slow absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Monitoring pertumbuhan interaktif
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-4xl">Monitoring Balita & Perbandingan WHO</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Lihat kondisi umum seluruh balita, pilih satu individu, atau masukkan pengukuran cepat untuk membandingkan berat dan tinggi dengan kurva WHO.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
            </span>
            <div><p className="text-xs text-slate-300">Status data</p><p className="text-sm font-semibold">{databaseAvailable ? "Terhubung database" : "Mode tanpa database"}</p></div>
          </div>
        </div>
      </section>

      {!databaseAvailable ? (
        <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Database belum dapat dihubungi. Grafik WHO dan input cepat tetap dapat digunakan, tetapi daftar individu tersimpan tidak tersedia.
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Balita aktif", value: people.length, help: "Individu dalam pemantauan", icon: Baby, tone: "bg-blue-50 text-blue-700" },
          { label: "Total pemeriksaan", value: totalMeasurements, help: "Riwayat pengukuran tersimpan", icon: CalendarDays, tone: "bg-violet-50 text-violet-700" },
          { label: "Rentang utama WHO", value: normalCount, help: "Berat & tinggi sama-sama −2 hingga +2 SD", icon: Activity, tone: "bg-emerald-50 text-emerald-700" },
          { label: "Perlu perhatian", value: attentionCount, help: "Ada indikator di bawah −2 SD", icon: Info, tone: "bg-rose-50 text-rose-700" },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="dashboard-card group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" style={{ animationDelay: `${index * 80}ms` }}>
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-sm font-medium text-slate-500">{item.label}</p><p className="mt-2 text-3xl font-bold text-slate-950">{item.value.toLocaleString("id-ID")}</p><p className="mt-1 text-xs leading-relaxed text-slate-400">{item.help}</p></div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl transition group-hover:-rotate-6 group-hover:scale-110 ${item.tone}`}><Icon className="h-5 w-5" /></span>
              </div>
            </article>
          );
        })}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          <button type="button" onClick={() => setActiveView("general")} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${activeView === "general" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>
            Grafik General
          </button>
          <button type="button" onClick={() => setActiveView("individual")} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${activeView === "individual" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>
            Grafik Per Individu
          </button>
        </div>
        <p className="text-xs text-slate-500">Cakupan pengukuran: <span className="font-bold text-slate-800">{coverage}%</span></p>
      </div>

      {activeView === "general" ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="font-bold text-slate-900">Sebaran status terbaru</h2><p className="mt-1 text-xs text-slate-500">Perbandingan nilai terakhir setiap balita terhadap −2 SD dan +2 SD WHO.</p></div>
              <BarChart3 className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-4 h-[320px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 6" />
                  <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 16, borderColor: "#e2e8f0" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="berat" name="Berat/umur" fill="#2563eb" radius={[8, 8, 2, 2]} animationDuration={900} />
                  <Bar dataKey="tinggi" name="Tinggi/umur" fill="#8b5cf6" radius={[8, 8, 2, 2]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div><h2 className="font-bold text-slate-900">Rata-rata pengukuran per bulan</h2><p className="mt-1 text-xs text-slate-500">Tren agregat semua pemeriksaan yang tersedia.</p></div>
            <div className="mt-4 h-[320px] min-w-0">
              {averageTrend.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={averageTrend} margin={{ top: 12, right: 10, left: -12, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 6" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis yAxisId="weight" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} width={45} />
                    <YAxis yAxisId="height" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} width={45} />
                    <Tooltip contentStyle={{ borderRadius: 16, borderColor: "#e2e8f0" }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line yAxisId="weight" type="monotone" dataKey="berat" name="Berat rata-rata (kg)" stroke="#0f766e" strokeWidth={3} dot={{ r: 4 }} animationDuration={900} />
                    <Line yAxisId="height" type="monotone" dataKey="tinggi" name="Tinggi rata-rata (cm)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} animationDuration={1000} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">Belum ada riwayat pemeriksaan untuk dibuat grafik.</div>
              )}
            </div>
          </article>
        </section>
      ) : (
        <section className="space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div><h2 className="font-bold text-slate-900">Pilih sumber data individu</h2><p className="mt-1 text-xs text-slate-500">Gunakan riwayat tersimpan atau masukkan pengukuran cepat untuk melihat perbandingan secara langsung.</p></div>
              <div className="inline-flex self-start rounded-2xl bg-slate-100 p-1 lg:self-auto">
                <button type="button" onClick={() => setInputMode("stored")} className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${inputMode === "stored" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}>Data tersimpan</button>
                <button type="button" onClick={() => setInputMode("manual")} className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${inputMode === "manual" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}>Input cepat</button>
              </div>
            </div>

            {inputMode === "stored" ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <label className="block text-sm font-semibold text-slate-700">
                  Individu balita
                  <select
                    value={selectedPerson?.id ?? ""}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setSelectedId(Number(event.target.value))}
                    disabled={!people.length}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                  >
                    {!people.length ? <option value="">Belum ada data individu</option> : null}
                    {people.map((person) => <option key={person.id} value={person.id}>{person.fullName} · {person.gender === "MALE" ? "Laki-laki" : "Perempuan"}</option>)}
                  </select>
                </label>
                {selectedPerson ? (
                  <div className="flex min-w-[260px] items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><UserRound className="h-5 w-5" /></span>
                    <div><p className="text-sm font-bold text-slate-900">{selectedPerson.fullName}</p><p className="text-xs text-slate-500">{selectedPerson.records.length} pemeriksaan · lahir {formatDate(selectedPerson.birthDate)}</p></div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <label className="text-sm font-semibold text-slate-700">Jenis kelamin<select value={manualGender} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setManualGender(event.target.value as GrowthGender)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"><option value="MALE">Laki-laki</option><option value="FEMALE">Perempuan</option></select></label>
                <label className="text-sm font-semibold text-slate-700">Umur (bulan)<input type="number" min="0" max="60" value={manualAge} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setManualAge(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /></label>
                <label className="text-sm font-semibold text-slate-700">Berat badan (kg)<input type="number" min="0" step="0.1" value={manualWeight} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setManualWeight(event.target.value)} placeholder="Contoh: 8.4" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /></label>
                <label className="text-sm font-semibold text-slate-700">Panjang/tinggi (cm)<input type="number" min="0" step="0.1" value={manualHeight} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setManualHeight(event.target.value)} placeholder="Contoh: 74.2" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /></label>
                <p className="sm:col-span-2 xl:col-span-4 text-xs text-slate-500">Input cepat memperbarui grafik secara langsung dan tidak menyimpan perubahan ke database.</p>
              </div>
            )}
          </article>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">Berat menurut umur</p><p className="mt-2 text-2xl font-bold text-slate-950">{effectiveLatest?.weight != null && Number.isFinite(effectiveLatest.weight) ? `${Number(effectiveLatest.weight).toLocaleString("id-ID")} kg` : "—"}</p></div><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Scale className="h-5 w-5" /></span></div>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3"><div><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${weightStatus.badge}`}>{weightStatus.label}</span><p className="mt-2 text-xs text-slate-500">{weightStatus.description}</p></div><ChevronRight className="h-4 w-4 shrink-0 text-slate-300" /></div>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">Panjang/tinggi menurut umur</p><p className="mt-2 text-2xl font-bold text-slate-950">{effectiveLatest?.height != null && Number.isFinite(effectiveLatest.height) ? `${Number(effectiveLatest.height).toLocaleString("id-ID")} cm` : "—"}</p></div><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700"><Ruler className="h-5 w-5" /></span></div>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3"><div><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${heightStatus.badge}`}>{heightStatus.label}</span><p className="mt-2 text-xs text-slate-500">{heightStatus.description}</p></div><ChevronRight className="h-4 w-4 shrink-0 text-slate-300" /></div>
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <GrowthChart title="Kurva berat badan per umur" subtitle="Garis individu dibandingkan median, −2 SD, dan +2 SD WHO untuk jenis kelamin yang dipilih." unit=" kg" data={weightChartData} actualLabel={inputMode === "manual" ? "Input individu" : selectedPerson?.fullName ?? "Individu"} />
            <GrowthChart title="Kurva panjang/tinggi per umur" subtitle="Umur 0–23 bulan memakai referensi panjang terlentang; umur 24–60 bulan memakai tinggi berdiri." unit=" cm" data={heightChartData} actualLabel={inputMode === "manual" ? "Input individu" : selectedPerson?.fullName ?? "Individu"} />
          </section>

          {inputMode === "stored" && selectedPerson?.records.length ? (
            <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">Riwayat pemeriksaan {selectedPerson.fullName}</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Tanggal</th><th className="px-5 py-3">Umur</th><th className="px-5 py-3">Berat</th><th className="px-5 py-3">Tinggi</th><th className="px-5 py-3">Lingkar kepala</th><th className="px-5 py-3">Catatan</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">{[...selectedPerson.records].reverse().map((record) => <tr key={record.id} className="transition hover:bg-blue-50/40"><td className="px-5 py-4 font-medium text-slate-800">{formatDate(record.examinationDate)}</td><td className="px-5 py-4 text-slate-600">{record.ageMonth} bulan</td><td className="px-5 py-4 text-slate-600">{record.weight} kg</td><td className="px-5 py-4 text-slate-600">{record.height} cm</td><td className="px-5 py-4 text-slate-600">{record.headCircumference ? `${record.headCircumference} cm` : "—"}</td><td className="max-w-xs px-5 py-4 text-slate-500">{record.notes ?? record.nutritionalStatus ?? "—"}</td></tr>)}</tbody>
                </table>
              </div>
            </article>
          ) : null}
        </section>
      )}

      <aside className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-relaxed text-blue-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>Kurva ini adalah alat bantu skrining berdasarkan standar pertumbuhan WHO, bukan diagnosis. Interpretasi akhir perlu mempertimbangkan tren, cara pengukuran, kondisi klinis, dan penilaian tenaga kesehatan.</p>
      </aside>
    </div>
  );
}
