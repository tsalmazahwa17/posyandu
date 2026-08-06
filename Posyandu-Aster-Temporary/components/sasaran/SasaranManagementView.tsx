"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Baby,
  HeartPulse,
  GraduationCap,
  BriefcaseMedical,
  Accessibility,
  Plus,
  Download,
  Search,
  Filter,
  Edit2,
  Trash2,
  LineChart,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  RefreshCw,
} from "lucide-react";
import type { SessionPayload } from "@/lib/session";
import type { VisitorDTO } from "@/types";
import SasaranModalForm from "./SasaranModalForm";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";

interface Props {
  user: SessionPayload;
}

interface SummaryStats {
  total: number;
  balita: { count: number; percentage: number };
  bumil: { count: number; percentage: number };
  remaja: { count: number; percentage: number };
  lansiaProduktif: { count: number; percentage: number };
  produktif: { count: number; percentage: number };
  lansia: { count: number; percentage: number };
}

export default function SasaranManagementView({ user }: Props) {
  // ── State Filter & Data ───────────────────────────────────────────────────
  const [visitors, setVisitors] = useState<VisitorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [wilayah, setWilayah] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const [stats, setStats] = useState<SummaryStats | null>(null);

  // ── Modal State ───────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<VisitorDTO | null>(null);

  // ── Fetch Data Sasaran ────────────────────────────────────────────────────
  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        includeStats: "true",
      });

      if (search.trim()) params.set("search", search.trim());
      if (categoryId !== "all") params.set("categoryId", categoryId);
      if (status !== "all") params.set("status", status);

      const res = await fetch(`/api/sasaran?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal memuat data sasaran.");
      }

      const rawData = json.data;
      setVisitors(rawData.items || []);
      setTotalPages(rawData.totalPages || 1);
      setTotalCount(rawData.total || 0);

      if (rawData.stats) {
        setStats(rawData.stats);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryId, status]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);
  useRealtimeRefresh(fetchVisitors, ["visitors", "categories", "users"]);

  // Debounce Search & Filters reset page
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryId(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handleWilayahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setWilayah(e.target.value);
    setPage(1);
  };

  // Client-side filter for Wilayah if specified in address
  const filteredVisitors = visitors.filter((v) => {
    if (wilayah === "all") return true;
    if (!v.address) return false;
    return v.address.toLowerCase().includes(wilayah.toLowerCase());
  });

  // ── Handlers Modal ────────────────────────────────────────────────────────
  const handleOpenAddModal = () => {
    setEditingVisitor(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v: VisitorDTO) => {
    setEditingVisitor(v);
    setIsModalOpen(true);
  };

  const handleDeleteVisitor = async (id: number, name: string) => {
    const ok = window.confirm(`Yakin ingin menonaktifkan data sasaran "${name}"?`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/sasaran/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menghapus data.");
      }
      fetchVisitors();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus data sasaran.");
    }
  };

  // ── Ekspor Data CSV ───────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (filteredVisitors.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const headers = ["ID Sasaran", "Nama Lengkap", "NIK", "Jenis Kelamin", "Kategori", "Tempat Lahir", "Tanggal Lahir", "No HP", "Alamat", "Status"];
    const rows = filteredVisitors.map((v) => [
      `AST-${String(v.id).padStart(5, "0")}`,
      `"${v.fullName.replace(/"/g, '""')}"`,
      `"${v.nik || "-"}"`,
      v.gender === "MALE" ? "Laki-laki" : "Perempuan",
      `"${v.category?.name || "-"}"`,
      `"${v.birthPlace || "-"}"`,
      new Date(v.birthDate).toLocaleDateString("id-ID"),
      `"${v.phone || "-"}"`,
      `"${(v.address || "-").replace(/"/g, '""')}"`,
      v.isActive ? "Aktif" : "Nonaktif",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Sasaran_Posyandu_Aster_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper formatting category badge colors & route slug
  const getCategoryBadge = (catName?: string, catId?: number) => {
    const id = catId || 1;
    const name = catName || "Balita";

    if (id === 1 || name.toLowerCase().includes("balita")) {
      return { label: name, bg: "bg-blue-50 text-blue-700 border-blue-200/80", slug: "balita" };
    }
    if (id === 2 || name.toLowerCase().includes("hamil") || name.toLowerCase().includes("bumil")) {
      return { label: name, bg: "bg-orange-50 text-orange-700 border-orange-200/80", slug: "bumil" };
    }
    if (id === 3 || name.toLowerCase().includes("remaja")) {
      return { label: name, bg: "bg-indigo-50 text-indigo-700 border-indigo-200/80", slug: "remaja" };
    }
    if (id === 4 || name.toLowerCase().includes("produktif")) {
      return { label: name, bg: "bg-slate-100 text-slate-700 border-slate-200/80", slug: "produktif" };
    }
    if (id === 5 || name.toLowerCase().includes("lansia") || name.toLowerCase().includes("lanjut")) {
      return { label: name, bg: "bg-amber-50 text-amber-700 border-amber-200/80", slug: "lansia" };
    }

    return { label: name, bg: "bg-gray-100 text-gray-700 border-gray-200/80", slug: "balita" };
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* ── 1. HEADER SECTION ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Data Sasaran (Visitors)
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Kelola, saring, dan pantau seluruh data kelompok target pelayanan warga secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-xs transition"
          >
            <Download size={15} className="text-gray-500" />
            Ekspor Data
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
          >
            <Plus size={16} />
            Tambah Sasaran
          </button>
        </div>
      </div>

      {/* ── 2. SUMMARY STAT CARDS (GRID 5 KOLOM) ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total Sasaran</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-800">
              {stats ? stats.total : totalCount}
            </h3>
            <span className="inline-block mt-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Semua Sasaran Active
            </span>
          </div>
        </div>

        {/* Balita */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Balita (0-5 Thn)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Baby size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-800">
              {stats ? stats.balita.count : 0}
            </h3>
            <span className="inline-block mt-1 text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
              {stats ? `${stats.balita.percentage}%` : "0%"} dari total
            </span>
          </div>
        </div>

        {/* Ibu Hamil */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Ibu Hamil</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
              <HeartPulse size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-800">
              {stats ? stats.bumil.count : 0}
            </h3>
            <span className="inline-block mt-1 text-[11px] font-semibold text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded-full">
              {stats ? `${stats.bumil.percentage}%` : "0%"} dari total
            </span>
          </div>
        </div>

        {/* Remaja */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Remaja</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <GraduationCap size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-800">
              {stats ? stats.remaja.count : 0}
            </h3>
            <span className="inline-block mt-1 text-[11px] font-semibold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full">
              {stats ? `${stats.remaja.percentage}%` : "0%"} dari total
            </span>
          </div>
        </div>

        {/* Lansia & Produktif */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Lansia & Produktif</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Accessibility size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-800">
              {stats ? stats.lansiaProduktif.count : 0}
            </h3>
            <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
              {stats ? `${stats.lansiaProduktif.percentage}%` : "0%"} dari total
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. FILTER & SEARCH BAR ───────────────────────────────────────── */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari nama, NIK, ID Sasaran..."
              className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Select Kategori */}
          <div>
            <select
              value={categoryId}
              onChange={handleCategoryChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="all">Semua Kategori</option>
              <option value="1">Balita (0-5 tahun)</option>
              <option value="2">Ibu Hamil (Bumil)</option>
              <option value="3">Remaja (10-19 tahun)</option>
              <option value="4">Usia Produktif (15-49 tahun)</option>
              <option value="5">Lanjut Usia (Lansia)</option>
            </select>
          </div>

          {/* Select Wilayah */}
          <div>
            <select
              value={wilayah}
              onChange={handleWilayahChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="all">Semua Wilayah</option>
              <option value="RT 01">RT 01 / RW 04</option>
              <option value="RT 02">RT 02 / RW 04</option>
              <option value="RT 03">RT 03 / RW 04</option>
              <option value="RT 04">RT 04 / RW 04</option>
              <option value="RT 05">RT 05 / RW 04</option>
            </select>
          </div>

          {/* Select Status */}
          <div>
            <select
              value={status}
              onChange={handleStatusChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 4. INTERACTIVE DATA TABLE ────────────────────────────────────── */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm text-slate-800">Daftar Sasaran Terdaftar</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-semibold">
              {totalCount} data
            </span>
          </div>
          <button
            onClick={fetchVisitors}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition"
            title="Refresh Data"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3.5 px-5">Identitas Sasaran</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">NIK & Wali</th>
                <th className="py-3.5 px-4">Domisili & Kontak</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin text-blue-500" />
                      <span>Memuat data sasaran...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Tidak ada data sasaran yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((item) => {
                  const catBadge = getCategoryBadge(item.category?.name, item.categoryId);
                  const formattedId = `AST-${String(item.id).padStart(5, "0")}`;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      {/* IDENTITAS SASARAN */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {item.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{item.fullName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                {formattedId}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                ({item.gender === "MALE" ? "Laki-laki" : "Perempuan"})
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* KATEGORI */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full border ${catBadge.bg}`}>
                          {catBadge.label}
                        </span>
                      </td>

                      {/* DATA KELUARGA / NIK */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-mono font-medium text-slate-700">
                            {item.nik || <span className="text-gray-400 italic">Belum mengisi NIK</span>}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Tgl Lahir: {new Date(item.birthDate).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </td>

                      {/* DOMISILI & KONTAK */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="text-slate-700 flex items-center gap-1">
                            <MapPin size={12} className="text-gray-400 shrink-0" />
                            <span className="truncate max-w-[180px]">
                              {item.address || "Wilayah Posyandu Aster"}
                            </span>
                          </p>
                          {item.phone && (
                            <p className="text-gray-400 text-[11px] flex items-center gap-1">
                              <Phone size={12} className="text-gray-400 shrink-0" />
                              {item.phone}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="py-3.5 px-4">
                        {item.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Nonaktif
                          </span>
                        )}
                      </td>

                      {/* AKSI */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/monitoring/${catBadge.slug}?id=${item.id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Lihat Detail & Grafik Monitoring"
                          >
                            <LineChart size={16} />
                          </Link>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Edit Data Sasaran"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteVisitor(item.id, item.fullName)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                            title="Nonaktifkan Data"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>
            Menampilkan <span className="font-semibold text-slate-700">{filteredVisitors.length}</span> dari{" "}
            <span className="font-semibold text-slate-700">{totalCount}</span> sasaran
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-semibold text-slate-700">
              Halaman {page} dari {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Form Tambah / Edit */}
      <SasaranModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchVisitors}
        editingVisitor={editingVisitor}
      />
    </div>
  );
}
