"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Plus,
  Search,
  Download,
  Trash2,
  Loader2,
  Calendar,
  User,
  Tag,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import type { SessionPayload } from "@/lib/session";
import ArsipModalForm from "./ArsipModalForm";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";

interface ArchiveItem {
  id: number;
  categoryId: number;
  title: string;
  description?: string | null;
  fileUrl: string;
  uploadedBy: number;
  createdAt: string | Date;
  category?: { id: number; name: string } | null;
  uploader?: { id: number; fullName: string } | null;
}

interface Props {
  user: SessionPayload;
}

export default function ArsipManagementView({ user }: Props) {
  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const isOfficer = user.role === "ADMIN" || user.role === "KADER";

  const fetchArchives = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (categoryId !== "all") params.set("categoryId", categoryId);

      const res = await fetch(`/api/arsip?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal memuat arsip dokumen.");
      }

      setArchives(json.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [search, categoryId]);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);
  useRealtimeRefresh(fetchArchives, ["archives", "archive_categories", "users"]);

  const handleDelete = async (id: number, title: string) => {
    if (!isOfficer) return;
    const ok = window.confirm(`Yakin ingin menghapus dokumen "${title}"?`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/arsip/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menghapus dokumen.");
      }
      fetchArchives();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus dokumen.");
    }
  };

  const getCategoryBadgeColor = (catName?: string) => {
    const name = (catName || "").toLowerCase();
    if (name.includes("sop")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (name.includes("proposal")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (name.includes("surat")) return "bg-purple-50 text-purple-700 border-purple-200";
    if (name.includes("laporan")) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Arsip Digital & SOP Posyandu
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Pusat penyimpanan dokumen SOP kesehatan, proposal, dan laporan kegiatan Posyandu Aster.
          </p>
        </div>

        {isOfficer && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
          >
            <Plus size={16} />
            Unggah Dokumen
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul dokumen atau SOP..."
            className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="all">Semua Kategori</option>
            <option value="1">Proposal Kegiatan</option>
            <option value="2">SOP Pelayanan</option>
            <option value="3">Surat Resmi</option>
            <option value="4">Laporan</option>
            <option value="5">Dokumen Lainnya</option>
          </select>

          <button
            onClick={fetchArchives}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-xl border border-gray-200 hover:bg-gray-50 transition ml-auto sm:ml-0"
            title="Refresh Data"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Table View */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3.5 px-5">Nama Dokumen & Deskripsi</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Tanggal Unggah</th>
                <th className="py-3.5 px-4">Pengunggah</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin text-blue-500" />
                      <span>Memuat arsip dokumen...</span>
                    </div>
                  </td>
                </tr>
              ) : archives.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Belum ada dokumen yang diunggah.
                  </td>
                </tr>
              ) : (
                archives.map((doc) => {
                  const badgeColor = getCategoryBadgeColor(doc.category?.name);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-5">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl mt-0.5 shrink-0">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{doc.title}</p>
                            {doc.description && (
                              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                                {doc.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full border ${badgeColor}`}>
                          {doc.category?.name || "Umum"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                        {new Date(doc.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {doc.uploader?.fullName || "Petugas Aster"}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                          >
                            <ExternalLink size={13} /> Buka / Unduh
                          </a>

                          {isOfficer && (
                            <button
                              onClick={() => handleDelete(doc.id, doc.title)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus Dokumen"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Upload */}
      {isOfficer && (
        <ArsipModalForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchArchives}
        />
      )}
    </div>
  );
}
