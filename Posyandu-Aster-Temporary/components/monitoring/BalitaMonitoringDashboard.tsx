"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Baby,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Info,
  Loader2,
  Pencil,
  PlusCircle,
  Ruler,
  Scale,
  Trash2,
  UserPlus,
  UserRound,
  X,
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
import MonitoringCategoryTabs from "@/components/monitoring/MonitoringCategoryTabs";

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
      badge: "bg-slate-100 text-slate-700 border border-slate-200",
    };
  }

  const reference = getWhoReference(metric, gender, ageMonth);
  if ((value as number) < reference.minus2) {
    return {
      key: "below",
      label: "Di bawah −2 SD",
      description: "Perlu ditinjau kembali oleh tenaga kesehatan.",
      badge: "bg-rose-50 text-rose-700 border border-rose-200 font-bold",
    };
  }
  if ((value as number) > reference.plus2) {
    return {
      key: "above",
      label: "Di atas +2 SD",
      description: "Perlu interpretasi bersama indikator lain.",
      badge: "bg-amber-50 text-amber-700 border border-amber-200 font-bold",
    };
  }
  return {
    key: "normal",
    label: "Rentang −2 s.d. +2 SD",
    description: "Nilai berada di rentang referensi utama WHO.",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold",
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
    <article className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-gray-400">{subtitle}</p>
      </div>
      <div className="h-[330px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 6 }}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 6" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              interval={5}
              tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }}
              label={{ value: "Umur (bulan)", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }}
              unit={unit}
              width={52}
            />
            <Tooltip
              labelFormatter={(label: unknown) => `Umur ${String(label)} bulan`}
              contentStyle={{ borderRadius: 12, borderColor: "#cbd5e1", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            <Line type="monotone" dataKey="minus2" name="WHO −2 SD" stroke="#f59e0b" strokeWidth={1.8} dot={false} strokeDasharray="6 5" animationDuration={700} />
            <Line type="monotone" dataKey="median" name="Median WHO" stroke="#8b5cf6" strokeWidth={2.3} dot={false} animationDuration={800} />
            <Line type="monotone" dataKey="plus2" name="WHO +2 SD" stroke="#f59e0b" strokeWidth={1.8} dot={false} strokeDasharray="6 5" animationDuration={700} />
            <Line
              type="monotone"
              dataKey="actual"
              name={actualLabel}
              stroke="#2563eb"
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
  const router = useRouter();
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

  // ─── Add KMS Examination Modal ───────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [modalPersonId, setModalPersonId] = useState<number | "">(selectedPerson?.id ?? "");
  const [kmsDate, setKmsDate] = useState(new Date().toISOString().split("T")[0]);
  const [kmsAge, setKmsAge] = useState("");
  const [kmsWeight, setKmsWeight] = useState("");
  const [kmsHeight, setKmsHeight] = useState("");
  const [kmsHead, setKmsHead] = useState("");
  const [kmsNotes, setKmsNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  // Conflict (409) state
  const [kmsConflict, setKmsConflict] = useState<{ conflictId: number; conflictDate: string } | null>(null);

  const openModal = useCallback(() => {
    setModalPersonId(selectedPerson?.id ?? "");
    setKmsDate(new Date().toISOString().split("T")[0]);
    setKmsAge(selectedLatest ? String(selectedLatest.ageMonth) : "");
    setKmsWeight("");
    setKmsHeight("");
    setKmsHead("");
    setKmsNotes("");
    setSubmitError(null);
    setSubmitSuccess(false);
    setShowModal(true);
  }, [selectedPerson, selectedLatest]);

  const openModalForPerson = useCallback((personId?: number) => {
    const targetId = personId ?? selectedPerson?.id ?? "";
    setModalPersonId(targetId);
    setKmsDate(new Date().toISOString().split("T")[0]);
    setKmsAge(selectedLatest ? String(selectedLatest.ageMonth) : "");
    setKmsWeight("");
    setKmsHeight("");
    setKmsHead("");
    setKmsNotes("");
    setSubmitError(null);
    setSubmitSuccess(false);
    setShowModal(true);
  }, [selectedPerson, selectedLatest]);

  const handleKmsSubmit = useCallback(async (forceNew?: boolean) => {
    if (!modalPersonId || !kmsDate || !kmsWeight || !kmsHeight || !kmsAge) {
      setSubmitError("Pilih sasaran, tanggal, umur, berat, dan tinggi badan terlebih dahulu.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body = {
        visitorId: Number(modalPersonId),
        examinationDate: kmsDate,
        monthNumber: new Date(kmsDate).getMonth() + 1,
        ageMonth: parseInt(kmsAge),
        weight: parseFloat(kmsWeight),
        height: parseFloat(kmsHeight),
        headCircumference: kmsHead ? parseFloat(kmsHead) : null,
        notes: kmsNotes || null,
        ...(forceNew ? { forceNew: true } : {}),
      };
      const res = await fetch("/api/monitoring/balita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.status === 409 && json.data?.conflictId) {
        setKmsConflict({ conflictId: json.data.conflictId, conflictDate: json.data.conflictDate });
        return;
      }
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan pemeriksaan.");
      setSubmitSuccess(true);
      setKmsConflict(null);
      router.refresh();
      setTimeout(() => setShowModal(false), 1200);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }, [kmsAge, kmsDate, kmsHead, kmsHeight, kmsNotes, kmsWeight, modalPersonId, router]);

  const handleKmsConflictUpdate = useCallback(async () => {
    if (!kmsConflict) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/monitoring/balita/${kmsConflict.conflictId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examinationDate: kmsDate,
          ageMonth: parseInt(kmsAge),
          weight: parseFloat(kmsWeight),
          height: parseFloat(kmsHeight),
          headCircumference: kmsHead ? parseFloat(kmsHead) : null,
          notes: kmsNotes || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memperbarui pemeriksaan.");
      setSubmitSuccess(true);
      setKmsConflict(null);
      router.refresh();
      setTimeout(() => setShowModal(false), 1200);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }, [kmsAge, kmsConflict, kmsDate, kmsHead, kmsHeight, kmsNotes, kmsWeight, router]);

  // ─── Edit KMS Record State ────────────────────────────────────────────────
  const [editingRecord, setEditingRecord] = useState<BalitaMonitoringRecord | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editHeight, setEditHeight] = useState("");
  const [editHead, setEditHead] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const openEditKmsModal = useCallback((record: BalitaMonitoringRecord) => {
    setEditingRecord(record);
    setEditDate(record.examinationDate.slice(0, 10));
    setEditAge(String(record.ageMonth));
    setEditWeight(String(record.weight));
    setEditHeight(String(record.height));
    setEditHead(record.headCircumference ? String(record.headCircumference) : "");
    setEditNotes(record.notes || "");
    setEditError(null);
  }, []);

  const handleUpdateKms = useCallback(async () => {
    if (!editingRecord) return;
    if (!editDate || !editWeight || !editHeight || !editAge) {
      setEditError("Tanggal, umur, berat, dan tinggi badan wajib diisi.");
      return;
    }
    setEditSubmitting(true);
    setEditError(null);
    try {
      const body = {
        examinationDate: editDate,
        monthNumber: new Date(editDate).getMonth() + 1,
        ageMonth: parseInt(editAge),
        weight: parseFloat(editWeight),
        height: parseFloat(editHeight),
        headCircumference: editHead ? parseFloat(editHead) : null,
        notes: editNotes || null,
      };
      const res = await fetch(`/api/monitoring/balita/${editingRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memperbarui pemeriksaan.");
      router.refresh();
      setEditingRecord(null);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setEditSubmitting(false);
    }
  }, [editAge, editDate, editHead, editHeight, editNotes, editWeight, editingRecord, router]);

  const handleDeleteKms = useCallback(async (recordId: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data pemeriksaan KMS ini?")) return;
    try {
      const res = await fetch(`/api/monitoring/balita/${recordId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menghapus data.");
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus data.");
    }
  }, [router]);

  // ─── Add / Edit Child (Visitor) Modal State ──────────────────────────────
  const [showChildModal, setShowChildModal] = useState(false);
  const [childModalMode, setChildModalMode] = useState<"add" | "edit">("add");
  const [childName, setChildName] = useState("");
  const [childNik, setChildNik] = useState("");
  const [childBirthDate, setChildBirthDate] = useState("");
  const [childGender, setChildGender] = useState<"MALE" | "FEMALE">("MALE");
  const [childPhone, setChildPhone] = useState("");
  const [childAddress, setChildAddress] = useState("");
  const [childSubmitting, setChildSubmitting] = useState(false);
  const [childError, setChildError] = useState<string | null>(null);

  const openAddChildModal = useCallback(() => {
    setChildModalMode("add");
    setChildName("");
    setChildNik("");
    setChildBirthDate(new Date().toISOString().split("T")[0]);
    setChildGender("MALE");
    setChildPhone("");
    setChildAddress("");
    setChildError(null);
    setShowChildModal(true);
  }, []);

  const openEditChildModal = useCallback(() => {
    if (!selectedPerson) return;
    setChildModalMode("edit");
    setChildName(selectedPerson.fullName || "");
    setChildNik("");
    setChildBirthDate(selectedPerson.birthDate ? selectedPerson.birthDate.slice(0, 10) : "");
    setChildGender(selectedPerson.gender || "MALE");
    setChildPhone("");
    setChildAddress("");
    setChildError(null);
    setShowChildModal(true);
  }, [selectedPerson]);

  const handleSaveChild = useCallback(async () => {
    if (!childName || childName.trim().length < 2) {
      setChildError("Nama balita minimal 2 karakter.");
      return;
    }
    if (!childBirthDate) {
      setChildError("Tanggal lahir wajib diisi.");
      return;
    }
    setChildSubmitting(true);
    setChildError(null);
    try {
      if (childModalMode === "add") {
        const body = {
          categoryId: 1, // Balita
          fullName: childName.trim(),
          nik: childNik.trim() || null,
          birthDate: childBirthDate,
          gender: childGender,
          phone: childPhone.trim() || null,
          address: childAddress.trim() || null,
        };
        const res = await fetch("/api/sasaran", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Gagal menambah data balita.");
      } else if (childModalMode === "edit" && selectedPerson) {
        const body = {
          fullName: childName.trim(),
          nik: childNik.trim() || null,
          birthDate: childBirthDate,
          gender: childGender,
          phone: childPhone.trim() || null,
          address: childAddress.trim() || null,
        };
        const res = await fetch(`/api/sasaran/${selectedPerson.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Gagal memperbarui profil balita.");
      }
      router.refresh();
      setShowChildModal(false);
    } catch (err: unknown) {
      setChildError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setChildSubmitting(false);
    }
  }, [childAddress, childBirthDate, childGender, childModalMode, childName, childNik, childPhone, router, selectedPerson]);

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

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const averageTrend = useMemo(() => {
    const groups = new Map<string, { weight: number[]; height: number[] }>();
    people.forEach((person) => {
      person.records.forEach((record) => {
        if (dateFrom && record.examinationDate < dateFrom) return;
        if (dateTo && record.examinationDate > dateTo) return;
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
  }, [people, dateFrom, dateTo]);

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
    <div className="p-4 sm:p-6 space-y-5 min-h-full">
      {/* Header + Category Tabs */}
      <MonitoringCategoryTabs
        title="Monitoring Balita & Kurva Pertumbuhan WHO"
        description="Analisis grafik pertumbuhan balita (0-60 bulan) berdasarkan standar WHO, sebaran antropometri agregat, dan penelusuran riwayat per balita."
        databaseAvailable={databaseAvailable}
      />

      {/* Metric Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Balita Aktif", value: people.length, help: "Individu sasaran terdaftar", icon: Baby, tone: "bg-blue-100 text-blue-700" },
          { label: "Total Pemeriksaan", value: totalMeasurements, help: "Riwayat KMS tersimpan", icon: CalendarDays, tone: "bg-purple-100 text-purple-700" },
          { label: "Rentang Utama WHO", value: normalCount, help: "Gizi & tumbuh kembang normal", icon: Activity, tone: "bg-emerald-100 text-emerald-700" },
          { label: "Perlu Perhatian", value: attentionCount, help: "Di bawah −2 SD WHO", icon: Info, tone: "bg-rose-100 text-rose-700" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:border-blue-300 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 leading-none">{item.value.toLocaleString("id-ID")}</p>
                  <p className="mt-2 text-xs text-gray-500">{item.help}</p>
                </div>
                <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.tone}`}>
                  <Icon className="w-5.5 h-5.5" />
                </span>
              </div>
            </article>
          );
        })}
      </section>

      {/* View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-gray-200/80 p-3 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-full bg-gray-100/80 p-1">
            <button
              type="button"
              onClick={() => setActiveView("general")}
              className={`rounded-full px-4 py-1.5 text-xs transition-all ${
                activeView === "general"
                  ? "bg-white border-2 border-blue-200 text-blue-600 font-bold shadow-xs"
                  : "text-gray-500 font-semibold hover:text-blue-600"
              }`}
            >
              Grafik Agregat / General
            </button>
            <button
              type="button"
              onClick={() => setActiveView("individual")}
              className={`rounded-full px-4 py-1.5 text-xs transition-all ${
                activeView === "individual"
                  ? "bg-white border-2 border-blue-200 text-blue-600 font-bold shadow-xs"
                  : "text-gray-500 font-semibold hover:text-blue-600"
              }`}
            >
              Grafik Per Individu (KMS)
            </button>
          </div>

          {/* Add KMS Record Button */}
          {people.length > 0 && (
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Tambah Pemeriksaan KMS
            </button>
          )}
        </div>
        <div className="text-xs font-semibold text-gray-500">
          Cakupan pengukuran: <span className="font-bold text-blue-600">{coverage}%</span>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-2xl border border-gray-200/80 px-4 py-3 shadow-sm">
        <span className="text-xs font-semibold text-gray-600">Filter Rentang Tanggal:</span>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
          />
          <span className="text-xs text-gray-400">s/d</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
          />
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {activeView === "general" ? (
        <section className="grid gap-5 xl:grid-cols-2">
          <article className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <h2 className="font-bold text-gray-800 text-sm">Sebaran Status Pertumbuhan</h2>
                </div>
                <p className="mt-0.5 text-xs text-gray-400">Perbandingan pengukuran terakhir setiap balita terhadap standar Z-score WHO.</p>
              </div>
            </div>
            <div className="h-[320px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} labelStyle={{ fontWeight: 600, color: "#334155" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="berat" name="Berat / Umur" fill="#2563eb" radius={[6, 6, 0, 0]} animationDuration={900} />
                  <Bar dataKey="tinggi" name="Tinggi / Umur" fill="#8b5cf6" radius={[6, 6, 0, 0]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="font-bold text-gray-800 text-sm">Rata-Rata Pertumbuhan per Bulan</h2>
              <p className="mt-0.5 text-xs text-gray-400">Tren perubahan berat & tinggi rata-rata seluruh balita Posyandu Aster.</p>
            </div>
            <div className="h-[320px] min-w-0">
              {averageTrend.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={averageTrend} margin={{ top: 12, right: 10, left: -12, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis yAxisId="weight" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} width={45} />
                    <YAxis yAxisId="height" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} width={45} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} labelStyle={{ fontWeight: 600, color: "#334155" }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line yAxisId="weight" type="monotone" dataKey="berat" name="Berat (kg)" stroke="#059669" strokeWidth={2.5} dot={{ r: 4, fill: "#059669", stroke: "#ffffff", strokeWidth: 2 }} animationDuration={900} />
                    <Line yAxisId="height" type="monotone" dataKey="tinggi" name="Tinggi (cm)" stroke="#d97706" strokeWidth={2.5} dot={{ r: 4, fill: "#d97706", stroke: "#ffffff", strokeWidth: 2 }} animationDuration={1000} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  Belum ada riwayat pemeriksaan untuk ditampilkan.
                </div>
              )}
            </div>
          </article>
        </section>
      ) : (
        <section className="space-y-5">
          {/* Target Selector Card */}
          <article className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-bold text-gray-800 text-sm">Pilih Sasaran Balita</h2>
                <p className="mt-0.5 text-xs text-gray-400">Pilih balita terdaftar atau gunakan kalkulator input cepat untuk simulasi kurva WHO.</p>
              </div>
              <div className="inline-flex self-start rounded-full bg-gray-100/80 p-1 lg:self-auto">
                <button
                  type="button"
                  onClick={() => setInputMode("stored")}
                  className={`rounded-full px-4 py-1.5 text-xs transition-all ${
                    inputMode === "stored"
                      ? "bg-white border-2 border-blue-200 text-blue-600 font-bold shadow-xs"
                      : "text-gray-500 font-semibold hover:text-blue-600"
                  }`}
                >
                  Data Tersimpan
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("manual")}
                  className={`rounded-full px-4 py-1.5 text-xs transition-all ${
                    inputMode === "manual"
                      ? "bg-white border-2 border-blue-200 text-blue-600 font-bold shadow-xs"
                      : "text-gray-500 font-semibold hover:text-blue-600"
                  }`}
                >
                  Simulasi Cepat
                </button>
              </div>
            </div>

            {inputMode === "stored" ? (
              <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
                <div className="flex-1 max-w-md">
                  <label className="block text-xs font-semibold text-gray-700">
                    Pilih Nama Balita
                    <select
                      value={selectedPerson?.id ?? ""}
                      onChange={(e) => setSelectedId(Number(e.target.value))}
                      disabled={!people.length}
                      className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                    >
                      {!people.length ? <option value="">Belum ada data sasaran balita</option> : null}
                      {people.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.fullName} ({person.gender === "MALE" ? "Laki-laki" : "Perempuan"})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {selectedPerson ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-blue-50 border border-blue-100 p-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                        <UserRound className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{selectedPerson.fullName}</p>
                        <p className="text-xs text-gray-500">
                          {selectedPerson.records.length} pemeriksaan · Lahir {formatDate(selectedPerson.birthDate)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openModalForPerson(selectedPerson.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-xs transition"
                    >
                      <PlusCircle className="w-4 h-4" />
                      + Input Hasil Pemeriksaan Balita
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <label className="text-xs font-semibold text-gray-700">
                  Jenis Kelamin
                  <select
                    value={manualGender}
                    onChange={(e) => setManualGender(e.target.value as GrowthGender)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="MALE">Laki-laki</option>
                    <option value="FEMALE">Perempuan</option>
                  </select>
                </label>
                <label className="text-xs font-semibold text-gray-700">
                  Umur (Bulan)
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={manualAge}
                    onChange={(e) => setManualAge(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="text-xs font-semibold text-gray-700">
                  Berat Badan (kg)
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={manualWeight}
                    onChange={(e) => setManualWeight(e.target.value)}
                    placeholder="Contoh: 8.4"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="text-xs font-semibold text-gray-700">
                  Tinggi Badan (cm)
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={manualHeight}
                    onChange={(e) => setManualHeight(e.target.value)}
                    placeholder="Contoh: 74.2"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>
            )}
          </article>

          {/* Indicator Status Cards */}
          <section className="grid gap-4 lg:grid-cols-2">
            <article className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Berat menurut Umur (BB/U)</p>
                  <p className="mt-1.5 text-3xl font-bold text-gray-900 leading-none">
                    {effectiveLatest?.weight != null && Number.isFinite(effectiveLatest.weight)
                      ? `${Number(effectiveLatest.weight).toLocaleString("id-ID")} kg`
                      : "—"}
                  </p>
                </div>
                <span className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Scale className="w-4.5 h-4.5" />
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3 border border-gray-100">
                <div>
                  <span className={`inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold ${weightStatus.badge}`}>
                    {weightStatus.label}
                  </span>
                  <p className="mt-1.5 text-xs text-gray-500">{weightStatus.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </div>
            </article>

            <article className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tinggi menurut Umur (TB/U)</p>
                  <p className="mt-1.5 text-3xl font-bold text-gray-900 leading-none">
                    {effectiveLatest?.height != null && Number.isFinite(effectiveLatest.height)
                      ? `${Number(effectiveLatest.height).toLocaleString("id-ID")} cm`
                      : "—"}
                  </p>
                </div>
                <span className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                  <Ruler className="w-4.5 h-4.5" />
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3 border border-gray-100">
                <div>
                  <span className={`inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold ${heightStatus.badge}`}>
                    {heightStatus.label}
                  </span>
                  <p className="mt-1.5 text-xs text-gray-500">{heightStatus.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </div>
            </article>
          </section>

          {/* WHO Growth Charts */}
          <section className="grid gap-5 xl:grid-cols-2">
            <GrowthChart
              title="Kurva Berat Badan menurut Umur"
              subtitle="Garis balita dibandingkan median, −2 SD, dan +2 SD standar WHO."
              unit=" kg"
              data={weightChartData}
              actualLabel={inputMode === "manual" ? "Simulasi" : selectedPerson?.fullName ?? "Individu"}
            />
            <GrowthChart
              title="Kurva Tinggi/Panjang Badan menurut Umur"
              subtitle="Referensi panjang badan (0-23 bln) & tinggi badan (24-60 bln)."
              unit=" cm"
              data={heightChartData}
              actualLabel={inputMode === "manual" ? "Simulasi" : selectedPerson?.fullName ?? "Individu"}
            />
          </section>

          {/* Records History Table */}
          {inputMode === "stored" && selectedPerson?.records.length ? (
            <article className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  <h2 className="font-bold text-gray-800 text-sm">
                    Riwayat Hasil Pemeriksaan KMS
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedPerson.fullName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => openModalForPerson(selectedPerson.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  + Input Hasil Pemeriksaan Baru
                </button>
              </div>
              <div className="overflow-x-auto -mx-0">
                <table className="w-full min-w-[650px] text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                      <th className="font-medium px-6 py-2">Tanggal</th>
                      <th className="font-medium px-6 py-2">Umur</th>
                      <th className="font-medium px-6 py-2">Berat</th>
                      <th className="font-medium px-6 py-2">Tinggi</th>
                      <th className="font-medium px-6 py-2">Lingkar Kepala</th>
                      <th className="font-medium px-6 py-2">Status / Catatan</th>
                      <th className="font-medium px-6 py-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...selectedPerson.records].reverse().map((record) => (
                      <tr key={record.id} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-2.5 font-medium text-gray-800">{formatDate(record.examinationDate)}</td>
                        <td className="px-6 py-2.5 text-gray-500">{record.ageMonth} Bulan</td>
                        <td className="px-6 py-2.5 text-gray-500">{record.weight} kg</td>
                        <td className="px-6 py-2.5 text-gray-500">{record.height} cm</td>
                        <td className="px-6 py-2.5 text-gray-500">
                          {record.headCircumference ? `${record.headCircumference} cm` : "—"}
                        </td>
                        <td className="px-6 py-2.5 text-gray-500">
                          {record.notes ?? record.nutritionalStatus ?? "—"}
                        </td>
                        <td className="px-6 py-2.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openEditKmsModal(record)}
                            title="Edit Data Pemeriksaan"
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition mr-1"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteKms(record.id)}
                            title="Hapus Data Pemeriksaan"
                            className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ) : null}
        </section>
      )}

      {/* Footer Info Banner */}
      <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-700 leading-relaxed">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p>
          Kurva pertumbuhan ini diposisikan sebagai alat skrining standar WHO untuk pemantauan tumbuh kembang Posyandu Aster.
        </p>
      </div>

      {/* ─── Conflict Dialog (409 Duplikat Tanggal) ──────────────────────── */}
      {kmsConflict && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
              </span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Data Sudah Ada di Tanggal Ini</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Sudah terdapat data pemeriksaan KMS pada tanggal <strong>{kmsConflict.conflictDate ? new Date(kmsConflict.conflictDate).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : kmsDate}</strong>. Pilih tindakan yang ingin dilakukan:
                </p>
              </div>
            </div>
            {submitError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs text-rose-700">{submitError}</div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={handleKmsConflictUpdate}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Update Data yang Ada
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleKmsSubmit(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition disabled:opacity-50"
              >
                Buat Catatan Baru
              </button>
              <button
                type="button"
                onClick={() => setKmsConflict(null)}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tambah Pemeriksaan KMS Modal ─────────────────────────────────── */}
      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Tambah Pemeriksaan KMS</h3>
                <p className="text-xs text-gray-400 mt-0.5">Input data pemeriksaan balita ke database</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {submitSuccess ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Baby className="w-7 h-7" />
                  </div>
                  <p className="font-bold text-gray-800">Pemeriksaan berhasil disimpan!</p>
                  <p className="text-xs text-gray-400">Data KMS akan diperbarui secara otomatis.</p>
                </div>
              ) : (
                <>
                  {/* Person select */}
                  <label className="block text-xs font-semibold text-gray-700">
                    Nama Balita
                    <select
                      value={modalPersonId}
                      onChange={(e) => setModalPersonId(e.target.value === "" ? "" : Number(e.target.value))}
                      className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">— Pilih Balita —</option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.fullName} ({p.gender === "MALE" ? "Laki-laki" : "Perempuan"})
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Date + Age */}
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-xs font-semibold text-gray-700">
                      Tanggal Pemeriksaan
                      <input
                        type="date"
                        value={kmsDate}
                        onChange={(e) => setKmsDate(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="block text-xs font-semibold text-gray-700">
                      Umur (Bulan)
                      <input
                        type="number"
                        min="0"
                        max="60"
                        placeholder="mis: 24"
                        value={kmsAge}
                        onChange={(e) => setKmsAge(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                  </div>

                  {/* Weight + Height */}
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-xs font-semibold text-gray-700">
                      Berat Badan (kg)
                      <div className="relative mt-1.5">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="8.5"
                          value={kmsWeight}
                          onChange={(e) => setKmsWeight(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 pr-10 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">kg</span>
                      </div>
                    </label>
                    <label className="block text-xs font-semibold text-gray-700">
                      Tinggi Badan (cm)
                      <div className="relative mt-1.5">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="74.2"
                          value={kmsHeight}
                          onChange={(e) => setKmsHeight(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 pr-10 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">cm</span>
                      </div>
                    </label>
                  </div>

                  {/* Head Circumference */}
                  <label className="block text-xs font-semibold text-gray-700">
                    Lingkar Kepala (opsional, cm)
                    <div className="relative mt-1.5">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="42.0"
                        value={kmsHead}
                        onChange={(e) => setKmsHead(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 pr-10 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">cm</span>
                    </div>
                  </label>

                  {/* Notes */}
                  <label className="block text-xs font-semibold text-gray-700">
                    Catatan (opsional)
                    <textarea
                      value={kmsNotes}
                      onChange={(e) => setKmsNotes(e.target.value)}
                      rows={2}
                      placeholder="Status gizi, imunisasi, keterangan lain…"
                      className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                    />
                  </label>

                  {submitError && (
                    <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
                      {submitError}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!submitSuccess && (
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleKmsSubmit()}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {submitting ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan…</>
                  ) : (
                    "Simpan Pemeriksaan"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ─── Edit KMS Examination Modal ─────────────────────────────────────── */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Edit Pemeriksaan KMS</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedPerson?.fullName}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold text-gray-700">
                  Tanggal Pemeriksaan
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="block text-xs font-semibold text-gray-700">
                  Umur (Bulan)
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold text-gray-700">
                  Berat Badan (kg)
                  <div className="relative mt-1.5">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 pr-10 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">kg</span>
                  </div>
                </label>
                <label className="block text-xs font-semibold text-gray-700">
                  Tinggi Badan (cm)
                  <div className="relative mt-1.5">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={editHeight}
                      onChange={(e) => setEditHeight(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 pr-10 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">cm</span>
                  </div>
                </label>
              </div>
              <label className="block text-xs font-semibold text-gray-700">
                Lingkar Kepala (opsional, cm)
                <div className="relative mt-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editHead}
                    onChange={(e) => setEditHead(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 pr-10 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">cm</span>
                </div>
              </label>
              <label className="block text-xs font-semibold text-gray-700">
                Catatan (opsional)
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </label>
              {editError && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
                  {editError}
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUpdateKms}
                disabled={editSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
              >
                {editSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan…</> : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add / Edit Child Profile Modal ─────────────────────────────────── */}
      {showChildModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">
                  {childModalMode === "add" ? "Tambah Balita Baru" : "Edit Profil Balita"}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Kelola data identitas sasaran balita</p>
              </div>
              <button
                type="button"
                onClick={() => setShowChildModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <label className="block text-xs font-semibold text-gray-700">
                Nama Lengkap Balita *
                <input
                  type="text"
                  placeholder="Nama Balita"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold text-gray-700">
                  Jenis Kelamin *
                  <select
                    value={childGender}
                    onChange={(e) => setChildGender(e.target.value as "MALE" | "FEMALE")}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="MALE">Laki-laki</option>
                    <option value="FEMALE">Perempuan</option>
                  </select>
                </label>
                <label className="block text-xs font-semibold text-gray-700">
                  Tanggal Lahir *
                  <input
                    type="date"
                    value={childBirthDate}
                    onChange={(e) => setChildBirthDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>

              <label className="block text-xs font-semibold text-gray-700">
                NIK (opsional)
                <input
                  type="text"
                  placeholder="NIK 16 Digit"
                  value={childNik}
                  onChange={(e) => setChildNik(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block text-xs font-semibold text-gray-700">
                Alamat (opsional)
                <input
                  type="text"
                  placeholder="Alamat rumah / RT/RW"
                  value={childAddress}
                  onChange={(e) => setChildAddress(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              {childError && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
                  {childError}
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowChildModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveChild}
                disabled={childSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
              >
                {childSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan…</> : "Simpan Data Balita"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
