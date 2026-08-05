"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Image as ImageIcon,
  Video,
  Plus,
  Search,
  Trash2,
  Loader2,
  Calendar,
  User,
  RefreshCw,
  Eye,
  X,
} from "lucide-react";
import type { SessionPayload } from "@/lib/session";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import DokumentasiModalForm from "./DokumentasiModalForm";

interface DocumentationItem {
  id: number;
  title: string;
  description?: string | null;
  mediaType: "PHOTO" | "VIDEO";
  fileUrl: string;
  activityDate: string | Date;
  uploadedBy: number;
  uploader?: { id: number; fullName: string } | null;
  createdAt: string | Date;
}

interface Props {
  user: SessionPayload;
}

export default function DokumentasiManagementView({ user }: Props) {
  const [docs, setDocs] = useState<DocumentationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "PHOTO" | "VIDEO">("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<DocumentationItem | null>(null);

  const isOfficer = user.role === "ADMIN" || user.role === "KADER";

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (activeTab !== "ALL") params.set("mediaType", activeTab);

      const res = await fetch(`/api/dokumentasi?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal memuat galeri dokumentasi.");
      }

      setDocs(json.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [search, activeTab]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);
  useRealtimeRefresh(fetchDocs, ["documentations", "users"]);

  const handleDelete = async (id: number, title: string) => {
    if (!isOfficer) return;
    const ok = window.confirm(`Yakin ingin menghapus dokumentasi "${title}"?`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/dokumentasi/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menghapus dokumentasi.");
      }
      fetchDocs();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus.");
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-xs text-white">
            <ImageIcon size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Galeri Dokumentasi Kegiatan
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Arsip foto dan video pelaksaaan kegiatan posyandu dan penyuluhan masyarakat.
            </p>
          </div>
        </div>

        {isOfficer && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
          >
            <Plus size={16} />
            Upload Dokumentasi
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === "ALL"
                ? "bg-white text-slate-800 shadow-xs"
                : "text-gray-500 hover:text-slate-700"
            }`}
          >
            Semua Media
          </button>
          <button
            onClick={() => setActiveTab("PHOTO")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === "PHOTO"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-gray-500 hover:text-slate-700"
            }`}
          >
            <ImageIcon size={14} /> Foto
          </button>
          <button
            onClick={() => setActiveTab("VIDEO")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === "VIDEO"
                ? "bg-white text-purple-600 shadow-xs"
                : "text-gray-500 hover:text-slate-700"
            }`}
          >
            <Video size={14} /> Video
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul kegiatan..."
            className="w-full text-xs pl-10 pr-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin text-blue-500" />
          <span className="text-sm">Memuat galeri dokumentasi...</span>
        </div>
      ) : docs.length === 0 ? (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-12 text-center text-gray-400 space-y-2">
          <ImageIcon size={36} className="mx-auto text-gray-300" />
          <p className="text-sm font-semibold text-slate-700">Belum ada dokumentasi</p>
          <p className="text-xs text-gray-400">Belum ada foto atau video kegiatan yang diunggah.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-gray-200/80 rounded-2xl shadow-xs hover:shadow-md transition overflow-hidden flex flex-col group relative"
            >
              {/* Media Preview Box */}
              <div className="relative h-48 bg-slate-900 overflow-hidden cursor-pointer" onClick={() => setPreviewMedia(doc)}>
                {doc.mediaType === "VIDEO" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gradient-to-br from-purple-900 to-slate-900 p-4 text-center">
                    <Video size={40} className="text-purple-400 mb-2" />
                    <span className="text-xs font-semibold">Tonton Video</span>
                  </div>
                ) : (
                  <img
                    src={doc.fileUrl}
                    alt={doc.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop";
                    }}
                  />
                )}

                {/* Media Type Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs ${
                      doc.mediaType === "VIDEO"
                        ? "bg-purple-900/80 text-purple-200"
                        : "bg-black/60 text-white"
                    }`}
                  >
                    {doc.mediaType === "VIDEO" ? <Video size={11} /> : <ImageIcon size={11} />}
                    {doc.mediaType === "VIDEO" ? "Video" : "Foto"}
                  </span>
                </div>

                {/* Delete Button (Officers) */}
                {isOfficer && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(doc.id, doc.title);
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-rose-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-xs hover:bg-rose-700"
                    title="Hapus Dokumentasi"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Info Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-blue-600 transition">
                    {doc.title}
                  </h3>
                  {doc.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {doc.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(doc.activityDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {doc.uploader && (
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {doc.uploader.fullName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Lightbox Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in">
          <div className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-sm text-slate-800">{previewMedia.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(previewMedia.activityDate).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1.5 text-gray-400 hover:text-slate-600 rounded-lg hover:bg-gray-200 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
              {previewMedia.mediaType === "VIDEO" ? (
                <iframe
                  src={previewMedia.fileUrl}
                  title={previewMedia.title}
                  className="w-full h-96 border-none rounded-lg"
                  allowFullScreen
                />
              ) : (
                <img
                  src={previewMedia.fileUrl}
                  alt={previewMedia.title}
                  className="max-h-[65vh] object-contain rounded-lg"
                />
              )}
            </div>
            {previewMedia.description && (
              <div className="p-4 bg-white border-t border-gray-100 text-xs text-slate-600 leading-relaxed">
                {previewMedia.description}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Upload Modal */}
      {isOfficer && (
        <DokumentasiModalForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchDocs}
        />
      )}
    </div>
  );
}
