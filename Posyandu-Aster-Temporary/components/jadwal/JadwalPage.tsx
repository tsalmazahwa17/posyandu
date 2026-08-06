"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronRight,
} from "lucide-react";

export interface JadwalEvent {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  isPublished: boolean;
  createdAt: string;
}

interface Props {
  events: JadwalEvent[];
  role: "ADMIN" | "KADER" | "MASYARAKAT";
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }),
    day: d.toLocaleDateString("id-ID", { day: "2-digit", timeZone: "UTC" }),
    month: d.toLocaleDateString("id-ID", { month: "short", timeZone: "UTC" }),
    year: d.toLocaleDateString("id-ID", { year: "numeric", timeZone: "UTC" }),
    time: d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }),
    full: d.toLocaleString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }),
  };
}

function toInputDatetime(iso: string) {
  return iso ? iso.slice(0, 16) : "";
}

function isUpcoming(iso: string) {
  return new Date(iso) >= new Date();
}

function getCategoryTag(title: string) {
  const t = title.toLowerCase();
  if (t.includes("balita")) return { label: "Balita", cls: "bg-pink-100 text-pink-700 border-pink-200" };
  if (t.includes("hamil") || t.includes("bumil")) return { label: "Ibu Hamil", cls: "bg-rose-100 text-rose-700 border-rose-200" };
  if (t.includes("remaja")) return { label: "Remaja", cls: "bg-violet-100 text-violet-700 border-violet-200" };
  if (t.includes("lansia")) return { label: "Lansia", cls: "bg-amber-100 text-amber-700 border-amber-200" };
  if (t.includes("produktif")) return { label: "Usia Produktif", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  return { label: "Umum", cls: "bg-blue-100 text-blue-700 border-blue-200" };
}

type FilterTab = "all" | "upcoming" | "past";

const EMPTY_FORM = {
  title: "",
  description: "",
  location: "",
  startDate: "",
  endDate: "",
  isPublished: true,
};

export default function JadwalPage({ events: initialEvents, role }: Props) {
  const router = useRouter();
  const canEdit = role === "ADMIN" || role === "KADER";

  // ─── Filter ────────────────────────────────────────────────────────────────
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = [...initialEvents];
    if (filter === "upcoming") list = list.filter((e) => isUpcoming(e.startDate));
    else if (filter === "past") list = list.filter((e) => !isUpcoming(e.startDate));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.location ?? "").toLowerCase().includes(q) ||
          (e.description ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [initialEvents, filter, search]);

  // ─── Form State ────────────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<JadwalEvent | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // ─── Delete State ──────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<JadwalEvent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openAdd = useCallback(() => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
    setFormError(null);
    setFormSuccess(false);
    setShowModal(true);
  }, []);

  const openEdit = useCallback((event: JadwalEvent) => {
    setEditTarget(event);
    setForm({
      title: event.title,
      description: event.description ?? "",
      location: event.location ?? "",
      startDate: toInputDatetime(event.startDate),
      endDate: event.endDate ? toInputDatetime(event.endDate) : "",
      isPublished: event.isPublished,
    });
    setFormError(null);
    setFormSuccess(false);
    setShowModal(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.title.trim()) { setFormError("Judul jadwal wajib diisi."); return; }
    if (!form.startDate) { setFormError("Tanggal mulai wajib diisi."); return; }
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        isPublished: form.isPublished,
      };
      const url = editTarget ? `/api/events/${editTarget.id}` : "/api/events";
      const method = editTarget ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan jadwal.");
      setFormSuccess(true);
      router.refresh();
      setTimeout(() => setShowModal(false), 1400);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }, [editTarget, form, router]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/events/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menghapus jadwal.");
      setDeleteTarget(null);
      router.refresh();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, router]);

  const upcomingCount = initialEvents.filter((e) => isUpcoming(e.startDate)).length;
  const pastCount = initialEvents.length - upcomingCount;

  return (
    <div className="p-4 sm:p-6 space-y-5 min-h-full">
      {/* ─── Header ─── */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/20" />
          <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-white/10" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="w-5 h-5 text-blue-200" />
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Jadwal Posyandu</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Jadwal Pelayanan</h1>
            <p className="text-sm text-blue-100 mt-1">
              Informasi jadwal kegiatan Posyandu Aster — {initialEvents.length} jadwal terdaftar.
            </p>
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-blue-700 bg-white rounded-xl hover:bg-blue-50 shadow-lg transition whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              + Tambah Jadwal
            </button>
          )}
        </div>
      </div>

      {/* ─── Filter & Search ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-gray-200/80 p-3 shadow-sm">
        <div className="inline-flex rounded-full bg-gray-100/80 p-1">
          {([
            { key: "all", label: `Semua (${initialEvents.length})` },
            { key: "upcoming", label: `Mendatang (${upcomingCount})` },
            { key: "past", label: `Selesai (${pastCount})` },
          ] as { key: FilterTab; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-1.5 text-xs transition-all ${
                filter === key
                  ? "bg-white border-2 border-blue-200 text-blue-600 font-bold shadow-xs"
                  : "text-gray-500 font-semibold hover:text-blue-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Cari judul atau lokasi…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-xs rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* ─── Events Grid ─── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-14 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mb-3" />
          <p className="font-bold text-gray-500 text-sm">Belum ada jadwal</p>
          <p className="text-xs text-gray-400 mt-1">
            {filter === "upcoming" ? "Tidak ada jadwal mendatang." : filter === "past" ? "Tidak ada jadwal yang sudah selesai." : "Belum ada jadwal yang ditambahkan."}
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={openAdd}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah Jadwal Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((event) => {
            const dt = formatDateTime(event.startDate);
            const dtEnd = event.endDate ? formatDateTime(event.endDate) : null;
            const tag = getCategoryTag(event.title);
            const upcoming = isUpcoming(event.startDate);

            return (
              <article
                key={event.id}
                className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col group relative overflow-hidden ${
                  upcoming ? "border-gray-200/80" : "border-gray-100 opacity-80"
                }`}
              >
                {/* Colored top bar */}
                <div className={`h-1.5 w-full ${upcoming ? "bg-gradient-to-r from-blue-500 to-indigo-500" : "bg-gradient-to-r from-gray-300 to-gray-400"}`} />

                <div className="p-5 flex flex-col flex-1 gap-3">
                  {/* Date badge + category tag + status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className={`flex items-center justify-center rounded-xl px-3 py-2 text-center shadow-xs min-w-[52px] ${upcoming ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                      <div>
                        <span className="text-xl font-bold block leading-none">{dt.day}</span>
                        <span className="text-[10px] font-semibold uppercase">{dt.month}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${tag.cls}`}>
                        {tag.label}
                      </span>
                      {canEdit && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${event.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                          {event.isPublished ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                          {event.isPublished ? "Publik" : "Draft"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{event.title}</h3>

                  {/* Description */}
                  {event.description && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{event.description}</p>
                  )}

                  {/* Time & Location */}
                  <div className="space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>
                        {dt.full}
                        {dtEnd ? ` — ${dtEnd.time} WIB` : " WIB"}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
                    {upcoming ? (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        Akan Datang
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Selesai
                      </span>
                    )}

                    {canEdit && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(event)}
                          className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Edit jadwal"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDeleteTarget(event); setDeleteError(null); }}
                          className="p-2 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Hapus jadwal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ─── Add/Edit Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">
                  {editTarget ? "Edit Jadwal" : "Tambah Jadwal Baru"}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {editTarget ? "Perbarui informasi jadwal kegiatan." : "Isi informasi jadwal kegiatan Posyandu."}
                </p>
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
              {formSuccess ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CalendarDays className="w-7 h-7" />
                  </div>
                  <p className="font-bold text-gray-800">
                    {editTarget ? "Jadwal berhasil diperbarui!" : "Jadwal berhasil ditambahkan!"}
                  </p>
                  <p className="text-xs text-gray-400">Halaman akan diperbarui otomatis.</p>
                </div>
              ) : (
                <>
                  {formError && (
                    <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-700 font-medium">
                      {formError}
                    </div>
                  )}

                  {/* Title */}
                  <label className="block text-xs font-semibold text-gray-700">
                    Judul Kegiatan <span className="text-rose-500">*</span>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="cth: Posyandu Balita — Pemantauan Gizi"
                      className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>

                  {/* Description */}
                  <label className="block text-xs font-semibold text-gray-700">
                    Deskripsi
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Keterangan singkat kegiatan (opsional)"
                      className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                    />
                  </label>

                  {/* Location */}
                  <label className="block text-xs font-semibold text-gray-700">
                    Lokasi
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      placeholder="cth: Balai Posyandu Aster, RT 05"
                      className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>

                  {/* Start & End Date */}
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-xs font-semibold text-gray-700">
                      Tanggal & Waktu Mulai <span className="text-rose-500">*</span>
                      <input
                        type="datetime-local"
                        value={form.startDate}
                        onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                        className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="block text-xs font-semibold text-gray-700">
                      Tanggal & Waktu Selesai
                      <input
                        type="datetime-local"
                        value={form.endDate}
                        onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                        className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-700">Publikasikan Jadwal</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {form.isPublished
                          ? "Jadwal akan terlihat di landing page dan dashboard."
                          : "Jadwal disimpan sebagai draft, tidak terlihat publik."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, isPublished: !f.isPublished }))}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                        form.isPublished ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                          form.isPublished ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {!formSuccess && (
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
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {submitting ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan…</>
                  ) : (
                    <><ChevronRight className="w-3.5 h-3.5" /> {editTarget ? "Simpan Perubahan" : "Tambah Jadwal"}</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Dialog ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Hapus Jadwal?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Jadwal <strong>"{deleteTarget.title}"</strong> akan dihapus permanen dan tidak dapat dipulihkan.
                </p>
              </div>
            </div>
            {deleteError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs text-rose-700">
                {deleteError}
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
