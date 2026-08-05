"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Newspaper,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Calendar,
  User,
  RefreshCw,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { CardSkeleton } from "@/components/ui/Skeleton";
import type { SessionPayload } from "@/lib/session";
import BeritaModalForm from "./BeritaModalForm";
import NewsDetailView, { NewsArticleData } from "@/components/news/NewsDetailView";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";

interface Props {
  user: SessionPayload;
}

export default function BeritaManagementView({ user }: Props) {
  const [newsList, setNewsList] = useState<NewsArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsArticleData | null>(null);

  // Active Selected News for Uniform Detail View (Landing vs Dashboard)
  const [selectedNews, setSelectedNews] = useState<NewsArticleData | null>(null);

  const isOfficer = user.role === "ADMIN" || user.role === "KADER";

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/berita?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal memuat daftar berita.");
      }

      setNewsList(json.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);
  useRealtimeRefresh(fetchNews, ["news", "news_categories", "users"]);

  const handleDelete = async (id: number, title: string) => {
    if (!isOfficer) return;
    const ok = window.confirm(`Yakin ingin menghapus berita "${title}"?`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/berita/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menghapus berita.");
      }
      fetchNews();
      if (selectedNews && selectedNews.id === id) {
        setSelectedNews(null);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus berita.");
    }
  };

  // Helper image thumbnail
  const getThumbnail = (url?: string | null) => {
    if (!url || url.startsWith("/images/news/") || url.startsWith("/images/")) {
      return "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop";
    }
    return url;
  };

  // ── 1. IF NEWS IS SELECTED: UNIFORM DETAIL VIEW MODE ─────────────────────
  if (selectedNews) {
    return (
      <div className="p-6">
        <NewsDetailView
          article={selectedNews}
          onBack={() => setSelectedNews(null)}
          backLabel="Kembali ke Daftar Berita Dashboard"
        />
      </div>
    );
  }

  // ── 2. MAIN DASHBOARD FEED & MANAGEMENT VIEW ────────────────────────────
  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-xs text-white">
            <Newspaper size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Berita & Edukasi Posyandu
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Pengumuman resmi, jadwal kegiatan, dan materi edukasi kesehatan masyarakat.
            </p>
          </div>
        </div>

        {isOfficer && (
          <button
            onClick={() => {
              setEditingNews(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus size={16} />
            Tulis Berita Baru (Block Builder)
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berita atau pengumuman..."
            className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <button
          onClick={fetchNews}
          className="p-2 text-gray-400 hover:text-blue-600 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
          title="Refresh Data"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* News Feed Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : newsList.length === 0 ? (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-12 text-center text-gray-400 space-y-2">
          <Newspaper size={36} className="mx-auto text-gray-300" />
          <p className="text-sm font-semibold text-slate-700">Belum ada berita</p>
          <p className="text-xs text-gray-400">Belum ada pengumuman atau berita yang dipublikasikan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200/80 rounded-2xl shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between group"
            >
              {/* Thumbnail */}
              <div
                className="relative h-48 bg-slate-100 overflow-hidden cursor-pointer"
                onClick={() => setSelectedNews(item)}
              >
                <img
                  src={getThumbnail(item.thumbnail)}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop";
                  }}
                />

                {/* Published Badge */}
                <div className="absolute top-3 left-3">
                  {item.isPublished ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs border border-emerald-200">
                      <CheckCircle2 size={12} className="text-emerald-500" /> Publik
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs border border-amber-200">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3
                    onClick={() => setSelectedNews(item)}
                    className="font-bold text-base text-slate-800 line-clamp-2 hover:text-blue-600 cursor-pointer transition"
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                    {item.excerpt || item.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-[11px] text-gray-400 space-y-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(item.publishedAt || item.createdAt || Date.now()).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {item.author && (
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {item.author.fullName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedNews(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                      title="Baca Berita (Detail View)"
                    >
                      <Eye size={16} />
                    </button>

                    {isOfficer && (
                      <>
                        <button
                          onClick={() => {
                            setEditingNews(item);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                          title="Edit Berita (Section Builder)"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Hapus Berita"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isOfficer && (
        <BeritaModalForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchNews}
          editingNews={editingNews}
        />
      )}
    </div>
  );
}
