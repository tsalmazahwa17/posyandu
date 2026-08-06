"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, BarChart3, CalendarCheck2, Database, Loader2, Pencil, PlusCircle, Trash2, UserPlus, UserRound, X } from "lucide-react";
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
import MonitoringCategoryTabs from "@/components/monitoring/MonitoringCategoryTabs";

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

// ─── Category-specific fields ──────────────────────────────────────────────
type FieldDef = { key: string; label: string; unit: string; required?: boolean };

const CATEGORY_FIELDS: Record<string, FieldDef[]> = {
  bumil: [
    { key: "gestationalAge", label: "Usia Kehamilan", unit: "minggu" },
    { key: "weight", label: "Berat Badan", unit: "kg" },
    { key: "systolicBP", label: "Tekanan Sistolik", unit: "mmHg" },
    { key: "diastolicBP", label: "Tekanan Diastolik", unit: "mmHg" },
    { key: "hb", label: "Hemoglobin (Hb)", unit: "g/dL" },
    { key: "lila", label: "LILA", unit: "cm" },
  ],
  "ibu-hamil": [
    { key: "gestationalAge", label: "Usia Kehamilan", unit: "minggu" },
    { key: "weight", label: "Berat Badan", unit: "kg" },
    { key: "systolicBP", label: "Tekanan Sistolik", unit: "mmHg" },
    { key: "diastolicBP", label: "Tekanan Diastolik", unit: "mmHg" },
    { key: "hb", label: "Hemoglobin (Hb)", unit: "g/dL" },
    { key: "lila", label: "LILA", unit: "cm" },
  ],
  remaja: [
    { key: "weight", label: "Berat Badan", unit: "kg" },
    { key: "height", label: "Tinggi Badan", unit: "cm" },
    { key: "armCircumference", label: "Lingkar Lengan", unit: "cm" },
    { key: "hb", label: "Hemoglobin (Hb)", unit: "g/dL" },
  ],
  produktif: [
    { key: "weight", label: "Berat Badan", unit: "kg" },
    { key: "height", label: "Tinggi Badan", unit: "cm" },
    { key: "bmi", label: "IMT", unit: "kg/m²" },
    { key: "waistCircumference", label: "Lingkar Pinggang", unit: "cm" },
    { key: "systolicBP", label: "Tekanan Sistolik", unit: "mmHg" },
    { key: "diastolicBP", label: "Tekanan Diastolik", unit: "mmHg" },
    { key: "bloodSugar", label: "Gula Darah", unit: "mg/dL" },
    { key: "cholesterol", label: "Kolesterol", unit: "mg/dL" },
  ],
  "usia-produktif": [
    { key: "weight", label: "Berat Badan", unit: "kg" },
    { key: "height", label: "Tinggi Badan", unit: "cm" },
    { key: "bmi", label: "IMT", unit: "kg/m²" },
    { key: "waistCircumference", label: "Lingkar Pinggang", unit: "cm" },
    { key: "systolicBP", label: "Tekanan Sistolik", unit: "mmHg" },
    { key: "diastolicBP", label: "Tekanan Diastolik", unit: "mmHg" },
    { key: "bloodSugar", label: "Gula Darah", unit: "mg/dL" },
    { key: "cholesterol", label: "Kolesterol", unit: "mg/dL" },
  ],
  lansia: [
    { key: "weight", label: "Berat Badan", unit: "kg" },
    { key: "systolicBP", label: "Tekanan Sistolik", unit: "mmHg" },
    { key: "diastolicBP", label: "Tekanan Diastolik", unit: "mmHg" },
    { key: "bloodSugar", label: "Gula Darah", unit: "mg/dL" },
    { key: "cholesterol", label: "Kolesterol", unit: "mg/dL" },
    { key: "uricAcid", label: "Asam Urat", unit: "mg/dL" },
  ],
};

const CATEGORY_ID_MAP: Record<string, number> = {
  bumil: 2,
  "ibu-hamil": 2,
  remaja: 3,
  produktif: 4,
  "usia-produktif": 4,
  lansia: 5,
};

export default function GenericMonitoringDashboard({
  title,
  description,
  people,
  metrics,
  databaseAvailable,
  category,
  onRecordAdded,
  initialPersonId = null,
}: {
  title: string;
  description: string;
  people: GenericPerson[];
  metrics: GenericMetric[];
  databaseAvailable: boolean;
  category?: string;
  onRecordAdded?: () => void;
  initialPersonId?: number | null;
}) {
  const router = useRouter();
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

  // ─── Add Examination Modal ──────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [modalPersonId, setModalPersonId] = useState<number | "">(selectedPerson?.id ?? "");
  const [examDate, setExamDate] = useState(new Date().toISOString().split("T")[0]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [examNotes, setExamNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  // Conflict (409) state
  const [conflictInfo, setConflictInfo] = useState<{ conflictId: number; conflictDate: string; pendingBody: Record<string, unknown> } | null>(null);

  const catKey = (category ?? "").toLowerCase().trim();
  const formFields: FieldDef[] = CATEGORY_FIELDS[catKey] ?? [];

  const openModal = useCallback(() => {
    setModalPersonId(selectedPerson?.id ?? "");
    setExamDate(new Date().toISOString().split("T")[0]);
    setFieldValues({});
    setExamNotes("");
    setSubmitError(null);
    setSubmitSuccess(false);
    setShowModal(true);
  }, [selectedPerson]);

  const openModalForPerson = useCallback((personId?: number) => {
    setModalPersonId(personId ?? selectedPerson?.id ?? "");
    setExamDate(new Date().toISOString().split("T")[0]);
    setFieldValues({});
    setExamNotes("");
    setSubmitError(null);
    setSubmitSuccess(false);
    setShowModal(true);
  }, [selectedPerson]);

  const handleSubmit = useCallback(async (forceNew?: boolean) => {
    if (!modalPersonId || !examDate) {
      setSubmitError("Pilih sasaran dan tanggal pemeriksaan terlebih dahulu.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body: Record<string, unknown> = {
        visitorId: Number(modalPersonId),
        examinationDate: examDate,
        notes: examNotes || null,
        ...(forceNew ? { forceNew: true } : {}),
      };
      for (const field of formFields) {
        const raw = fieldValues[field.key];
        body[field.key] = raw && raw.trim() !== "" ? parseFloat(raw) : null;
      }
      const res = await fetch(`/api/monitoring/${catKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.status === 409 && json.data?.conflictId) {
        // Duplicate date — show conflict dialog
        setConflictInfo({ conflictId: json.data.conflictId, conflictDate: json.data.conflictDate, pendingBody: body });
        return;
      }
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan pemeriksaan.");
      setSubmitSuccess(true);
      setConflictInfo(null);
      onRecordAdded?.();
      router.refresh();
      setTimeout(() => setShowModal(false), 1200);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }, [catKey, examDate, examNotes, fieldValues, formFields, modalPersonId, onRecordAdded, router]);

  // Handle conflict: update existing record instead
  const handleConflictUpdate = useCallback(async () => {
    if (!conflictInfo) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { conflictId, pendingBody } = conflictInfo;
      const updateBody: Record<string, unknown> = { ...pendingBody };
      delete updateBody.visitorId;
      delete updateBody.forceNew;
      const res = await fetch(`/api/monitoring/${catKey}/${conflictId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateBody),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memperbarui pemeriksaan.");
      setSubmitSuccess(true);
      setConflictInfo(null);
      onRecordAdded?.();
      router.refresh();
      setTimeout(() => setShowModal(false), 1200);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }, [catKey, conflictInfo, onRecordAdded, router]);

  // ─── Edit Exam Record State ──────────────────────────────────────────────
  const [editingRecord, setEditingRecord] = useState<GenericRecord | null>(null);
  const [editExamDate, setEditExamDate] = useState("");
  const [editFieldValues, setEditFieldValues] = useState<Record<string, string>>({});
  const [editExamNotes, setEditExamNotes] = useState("");
  const [editExamSubmitting, setEditExamSubmitting] = useState(false);
  const [editExamError, setEditExamError] = useState<string | null>(null);

  const openEditExamModal = useCallback((record: GenericRecord) => {
    setEditingRecord(record);
    setEditExamDate(record.date.slice(0, 10));
    const vals: Record<string, string> = {};
    for (const f of formFields) {
      const v = record.metrics[f.key];
      vals[f.key] = v != null ? String(v) : "";
    }
    setEditFieldValues(vals);
    setEditExamNotes(record.notes || "");
    setEditExamError(null);
  }, [formFields]);

  const handleUpdateExam = useCallback(async () => {
    if (!editingRecord) return;
    if (!editExamDate) {
      setEditExamError("Tanggal pemeriksaan wajib diisi.");
      return;
    }
    setEditExamSubmitting(true);
    setEditExamError(null);
    try {
      const body: Record<string, unknown> = {
        examinationDate: editExamDate,
        notes: editExamNotes || null,
      };
      for (const field of formFields) {
        const raw = editFieldValues[field.key];
        body[field.key] = raw && raw.trim() !== "" ? parseFloat(raw) : null;
      }
      const res = await fetch(`/api/monitoring/${catKey}/${editingRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memperbarui pemeriksaan.");
      router.refresh();
      setEditingRecord(null);
    } catch (err: unknown) {
      setEditExamError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setEditExamSubmitting(false);
    }
  }, [catKey, editExamDate, editExamNotes, editFieldValues, editingRecord, formFields, router]);

  const handleDeleteExam = useCallback(async (recordId: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data pemeriksaan ini?")) return;
    try {
      const res = await fetch(`/api/monitoring/${catKey}/${recordId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menghapus data.");
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus data.");
    }
  }, [catKey, router]);

  // ─── Add / Edit Target Person Modal State ─────────────────────────
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [personModalMode, setPersonModalMode] = useState<"add" | "edit">("add");
  const [personName, setPersonName] = useState("");
  const [personNik, setPersonNik] = useState("");
  const [personBirthDate, setPersonBirthDate] = useState("");
  const [personGender, setPersonGender] = useState<"MALE" | "FEMALE">("FEMALE");
  const [personPhone, setPersonPhone] = useState("");
  const [personAddress, setPersonAddress] = useState("");
  const [personSubmitting, setPersonSubmitting] = useState(false);
  const [personError, setPersonError] = useState<string | null>(null);

  const openAddPersonModal = useCallback(() => {
    setPersonModalMode("add");
    setPersonName("");
    setPersonNik("");
    setPersonBirthDate(new Date().toISOString().split("T")[0]);
    setPersonGender(catKey.includes("bumil") ? "FEMALE" : "FEMALE");
    setPersonPhone("");
    setPersonAddress("");
    setPersonError(null);
    setShowPersonModal(true);
  }, [catKey]);

  const openEditPersonModal = useCallback(() => {
    if (!selectedPerson) return;
    setPersonModalMode("edit");
    setPersonName(selectedPerson.fullName || "");
    setPersonNik("");
    setPersonBirthDate(new Date().toISOString().split("T")[0]);
    setPersonGender(selectedPerson.gender || "FEMALE");
    setPersonPhone("");
    setPersonAddress("");
    setPersonError(null);
    setShowPersonModal(true);
  }, [selectedPerson]);

  const handleSavePerson = useCallback(async () => {
    if (!personName || personName.trim().length < 2) {
      setPersonError("Nama lengkap minimal 2 karakter.");
      return;
    }
    if (!personBirthDate) {
      setPersonError("Tanggal lahir wajib diisi.");
      return;
    }
    setPersonSubmitting(true);
    setPersonError(null);
    try {
      const targetCatId = CATEGORY_ID_MAP[catKey] ?? 2;
      if (personModalMode === "add") {
        const body = {
          categoryId: targetCatId,
          fullName: personName.trim(),
          nik: personNik.trim() || null,
          birthDate: personBirthDate,
          gender: personGender,
          phone: personPhone.trim() || null,
          address: personAddress.trim() || null,
        };
        const res = await fetch("/api/sasaran", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Gagal menambah data sasaran.");
      } else if (personModalMode === "edit" && selectedPerson) {
        const body = {
          fullName: personName.trim(),
          nik: personNik.trim() || null,
          birthDate: personBirthDate,
          gender: personGender,
          phone: personPhone.trim() || null,
          address: personAddress.trim() || null,
        };
        const res = await fetch(`/api/sasaran/${selectedPerson.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Gagal memperbarui profil sasaran.");
      }
      router.refresh();
      setShowPersonModal(false);
    } catch (err: unknown) {
      setPersonError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setPersonSubmitting(false);
    }
  }, [catKey, personAddress, personBirthDate, personGender, personModalMode, personName, personNik, personPhone, router, selectedPerson]);

  // ─── Date Range Filter ───────────────────────────────────────────────────
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const generalTrend = useMemo(() => {
    const buckets = new Map<string, number[]>();
    people.forEach((person) => {
      person.records.forEach((record) => {
        // Date range filter
        if (dateFrom && record.date < dateFrom) return;
        if (dateTo && record.date > dateTo) return;
        const value = record.metrics[metricKey];
        if (typeof value !== "number" || !isFinite(value)) return;
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
        value: values.length > 0
          ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1))
          : null,
      }));
  }, [metricKey, people, dateFrom, dateTo]);

  const individualTrend = useMemo(
    () =>
      (selectedPerson?.records ?? [])
        .filter((record) => {
          if (dateFrom && record.date < dateFrom) return false;
          if (dateTo && record.date > dateTo) return false;
          return typeof record.metrics[metricKey] === "number";
        })
        .sort((a, b) => a.date.localeCompare(b.date)) // ensure chronological order
        .map((record) => ({ date: formatDate(record.date), value: record.metrics[metricKey] })),
    [metricKey, selectedPerson, dateFrom, dateTo]
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
    <div className="p-4 sm:p-6 space-y-5 min-h-full">
      {/* Header + Category Tabs */}
      <MonitoringCategoryTabs
        title={title}
        description={description}
        databaseAvailable={databaseAvailable}
      />

      {/* Metric Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Individu Sasaran Aktif", value: people.length.toLocaleString("id-ID"), sub: "Total terdaftar", icon: UserRound, tone: "bg-blue-100 text-blue-600" },
          { label: "Total Pemeriksaan", value: totalRecords.toLocaleString("id-ID"), sub: "Riwayat pemeriksaan", icon: CalendarCheck2, tone: "bg-violet-100 text-violet-600" },
          { label: "Indikator Terukur", value: String(metrics.length), sub: "Parameter kesehatan", icon: Activity, tone: "bg-emerald-100 text-emerald-600" },
          {
            label: "Cakupan Pemantauan",
            value: `${people.length ? Math.round((people.filter((p) => p.records.length).length / people.length) * 100) : 0}%`,
            sub: "Sasaran dengan riwayat",
            icon: Database,
            tone: "bg-amber-100 text-amber-600",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:border-blue-300 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 leading-none">{item.value}</p>
                  <p className="mt-2 text-xs text-gray-500">{item.sub}</p>
                </div>
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.tone}`}>
                  <Icon className="w-4.5 h-4.5" />
                </span>
              </div>
            </article>
          );
        })}
      </section>

      {/* Action / View Mode & Metric Selector */}
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center bg-white rounded-2xl border border-gray-200/80 p-3 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-full bg-gray-100/80 p-1 shrink-0">
            <button
              type="button"
              onClick={() => setView("general")}
              className={`rounded-full px-4 py-1.5 text-xs transition-all ${
                view === "general"
                  ? "bg-white border-2 border-blue-200 text-blue-600 font-bold shadow-xs"
                  : "text-gray-500 font-semibold hover:text-blue-600"
              }`}
            >
              Grafik Agregat / General
            </button>
            <button
              type="button"
              onClick={() => setView("individual")}
              className={`rounded-full px-4 py-1.5 text-xs transition-all ${
                view === "individual"
                  ? "bg-white border-2 border-blue-200 text-blue-600 font-bold shadow-xs"
                  : "text-gray-500 font-semibold hover:text-blue-600"
              }`}
            >
              Grafik Per Individu
            </button>
          </div>

          {/* Add Record Button */}
          {category && people.length > 0 && (
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Tambah Pemeriksaan
            </button>
          )}
        </div>

        {/* Indicator Pill Buttons — exact style from user image */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {metrics.map((metric) => {
            const isSelected = metric.key === metricKey;
            return (
              <button
                key={metric.key}
                type="button"
                onClick={() => setMetricKey(metric.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-white border-2 border-blue-200 text-blue-600 font-bold shadow-xs"
                    : "text-gray-500 hover:text-blue-600 hover:bg-blue-50/40"
                }`}
              >
                {metric.label}
              </button>
            );
          })}
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
      {view === "general" ? (
        <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
          <article className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <h2 className="font-bold text-gray-800 text-sm">Tren Rata-Rata {selectedMetric?.label}</h2>
                </div>
                <p className="mt-0.5 text-xs text-gray-400">Perkembangan rata-rata seluruh sasaran per bulan.</p>
              </div>
            </div>
            <div className="h-[340px] min-w-0">
              {generalTrend.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={generalTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="genericArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      unit={selectedMetric?.unit ? ` ${selectedMetric.unit}` : ""}
                      width={60}
                    />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} labelStyle={{ fontWeight: 600, color: "#334155" }} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name={selectedMetric?.label}
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fill="url(#genericArea)"
                      dot={{ r: 4, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
                      animationDuration={900}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  Belum ada data riwayat untuk indikator {selectedMetric?.label}.
                </div>
              )}
            </div>
          </article>

          <article className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 text-sm">Rata-Rata Parameter Terbaru</h2>
            <p className="mt-0.5 text-xs text-gray-400 mb-4">Ringkasan nilai rata-rata pada pemeriksaan terakhir.</p>
            <div className="space-y-2">
              {latestValues.map((metric) => (
                <div key={metric.key} className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-gray-600">{metric.label}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {metric.average == null ? "—" : `${metric.average.toLocaleString("id-ID")} ${metric.unit}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : (
        <section className="space-y-5">
          <article className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
              <div className="flex-1 max-w-md">
                <label className="block text-xs font-semibold text-gray-700">
                  Pilih Nama Sasaran
                  <select
                    value={selectedPerson?.id ?? ""}
                    onChange={(e) => setSelectedId(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 font-semibold"
                    disabled={!people.length}
                  >
                    {!people.length ? <option value="">Belum ada data sasaran</option> : null}
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.fullName}
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
                        {selectedPerson.records.length} pemeriksaan tercatat
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openModalForPerson(selectedPerson.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-xs transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    + Input Hasil Pemeriksaan
                  </button>
                </div>
              ) : null}
            </div>
          </article>

          <article className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 text-sm mb-0.5">
              Grafik {selectedMetric?.label}{selectedPerson ? ` · ${selectedPerson.fullName}` : ""}
            </h2>
            <p className="text-xs text-gray-400 mb-4">Grafik riwayat pengukuran individu.</p>
            <div className="h-[360px] min-w-0">
              {individualTrend.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={individualTrend} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      unit={selectedMetric?.unit ? ` ${selectedMetric.unit}` : ""}
                      width={60}
                    />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} labelStyle={{ fontWeight: 600, color: "#334155" }} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={selectedMetric?.label}
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#ffffff", stroke: "#2563eb", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
                      animationDuration={950}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  Individu ini belum memiliki data riwayat untuk {selectedMetric?.label}.
                </div>
              )}
            </div>
          </article>

          {/* Records Table for Selected Person */}
          {selectedPerson?.records.length ? (
            <article className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  <h2 className="font-bold text-gray-800 text-sm">
                    Riwayat Hasil Pemeriksaan {selectedPerson.fullName}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Daftar seluruh catatan medis & indikator terukur</p>
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
                      {metrics.map((m) => (
                        <th key={m.key} className="font-medium px-6 py-2">{m.label}</th>
                      ))}
                      <th className="font-medium px-6 py-2">Catatan</th>
                      <th className="font-medium px-6 py-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...selectedPerson.records].reverse().map((record) => (
                      <tr key={record.id} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-2.5 font-medium text-gray-800">{formatDate(record.date)}</td>
                        {metrics.map((m) => {
                          const val = record.metrics[m.key];
                          return (
                            <td key={m.key} className="px-6 py-2.5 text-gray-600">
                              {val != null ? `${val} ${m.unit}` : "—"}
                            </td>
                          );
                        })}
                        <td className="px-6 py-2.5 text-gray-500">{record.notes || "—"}</td>
                        <td className="px-6 py-2.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openEditExamModal(record)}
                            title="Edit Data Pemeriksaan"
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition mr-1"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteExam(record.id)}
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

      {/* ─── Tambah Pemeriksaan Modal ──────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Tambah Pemeriksaan</h3>
                <p className="text-xs text-gray-400 mt-0.5">{title}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {submitSuccess ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Activity className="w-7 h-7" />
                  </div>
                  <p className="font-bold text-gray-800">Pemeriksaan berhasil disimpan!</p>
                  <p className="text-xs text-gray-400">Data akan diperbarui secara otomatis.</p>
                </div>
              ) : (
                <>
                  {/* Person select */}
                  <label className="block text-xs font-semibold text-gray-700">
                    Sasaran
                    <select
                      value={modalPersonId}
                      onChange={(e) => setModalPersonId(e.target.value === "" ? "" : Number(e.target.value))}
                      className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">— Pilih Sasaran —</option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>{p.fullName}</option>
                      ))}
                    </select>
                  </label>

                  {/* Exam date */}
                  <label className="block text-xs font-semibold text-gray-700">
                    Tanggal Pemeriksaan
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>

                  {/* Dynamic metric fields */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {formFields.map((field) => (
                      <label key={field.key} className="block text-xs font-semibold text-gray-700">
                        {field.label}
                        <div className="relative mt-1.5">
                          <input
                            type="number"
                            step="0.1"
                            placeholder={`contoh: —`}
                            value={fieldValues[field.key] ?? ""}
                            onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2 pr-14 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">
                            {field.unit}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Notes */}
                  <label className="block text-xs font-semibold text-gray-700">
                    Catatan (opsional)
                    <textarea
                      value={examNotes}
                      onChange={(e) => setExamNotes(e.target.value)}
                      rows={2}
                      placeholder="Catatan pemeriksaan, kondisi khusus, dll."
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

            {/* Modal Footer */}
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
                  onClick={() => handleSubmit()}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Menyimpan…
                    </>
                  ) : (
                    "Simpan Pemeriksaan"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ─── Conflict Dialog (409 Duplicate Date) ─── */}
      {conflictInfo && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
              </span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Data Sudah Ada di Tanggal Ini</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Sudah terdapat hasil pemeriksaan pada tanggal <strong>{conflictInfo.conflictDate ? new Date(conflictInfo.conflictDate).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : examDate}</strong>. Pilih tindakan yang ingin dilakukan:
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
                onClick={handleConflictUpdate}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Update Data yang Ada
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition disabled:opacity-50"
              >
                Buat Catatan Baru
              </button>
              <button
                type="button"
                onClick={() => setConflictInfo(null)}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ─── Edit Examination Modal ────────────────────────────────────────── */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Edit Pemeriksaan</h3>
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
              <label className="block text-xs font-semibold text-gray-700">
                Tanggal Pemeriksaan
                <input
                  type="date"
                  value={editExamDate}
                  onChange={(e) => setEditExamDate(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                {formFields.map((field) => (
                  <label key={field.key} className="block text-xs font-semibold text-gray-700">
                    {field.label}
                    <div className="relative mt-1.5">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="—"
                        value={editFieldValues[field.key] ?? ""}
                        onChange={(e) => setEditFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2 pr-14 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">
                        {field.unit}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              <label className="block text-xs font-semibold text-gray-700">
                Catatan (opsional)
                <textarea
                  value={editExamNotes}
                  onChange={(e) => setEditExamNotes(e.target.value)}
                  rows={2}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </label>

              {editExamError && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
                  {editExamError}
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
                onClick={handleUpdateExam}
                disabled={editExamSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
              >
                {editExamSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan…</> : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add / Edit Person Profile Modal ───────────────────────────────── */}
      {showPersonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">
                  {personModalMode === "add" ? "Tambah Sasaran Baru" : "Edit Profil Sasaran"}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Kelola data identitas sasaran posyandu</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPersonModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <label className="block text-xs font-semibold text-gray-700">
                Nama Lengkap *
                <input
                  type="text"
                  placeholder="Nama Sasaran"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold text-gray-700">
                  Jenis Kelamin *
                  <select
                    value={personGender}
                    onChange={(e) => setPersonGender(e.target.value as "MALE" | "FEMALE")}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="FEMALE">Perempuan</option>
                    <option value="MALE">Laki-laki</option>
                  </select>
                </label>
                <label className="block text-xs font-semibold text-gray-700">
                  Tanggal Lahir *
                  <input
                    type="date"
                    value={personBirthDate}
                    onChange={(e) => setPersonBirthDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>

              <label className="block text-xs font-semibold text-gray-700">
                NIK (opsional)
                <input
                  type="text"
                  placeholder="NIK 16 Digit"
                  value={personNik}
                  onChange={(e) => setPersonNik(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block text-xs font-semibold text-gray-700">
                Alamat (opsional)
                <input
                  type="text"
                  placeholder="Alamat rumah / RT/RW"
                  value={personAddress}
                  onChange={(e) => setPersonAddress(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              {personError && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
                  {personError}
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowPersonModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePerson}
                disabled={personSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
              >
                {personSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan…</> : "Simpan Data Sasaran"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
