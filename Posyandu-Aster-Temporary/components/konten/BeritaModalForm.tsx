"use client";

import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Newspaper,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import type { NewsSection, NewsArticleData } from "@/components/news/NewsDetailView";
import NewsBlockEditor from "./NewsBlockEditor";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingNews?: NewsArticleData | null;
}

export default function BeritaModalForm({
  isOpen,
  onClose,
  onSuccess,
  editingNews,
}: Props) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // Array of Sections / Blocks for article builder
  const [sections, setSections] = useState<NewsSection[]>([
    {
      id: "sec-1",
      type: "paragraph",
      content: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingNews) {
      setTitle(editingNews.title || "");
      setExcerpt(editingNews.excerpt || "");
      setThumbnail(editingNews.thumbnail || "");
      setIsPublished(editingNews.isPublished !== undefined ? editingNews.isPublished : true);

      // Parse content into sections if content is JSON array
      try {
        if (editingNews.content && editingNews.content.trim().startsWith("[")) {
          const parsed = JSON.parse(editingNews.content);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSections(parsed);
          } else {
            setSections([{ id: "sec-1", type: "paragraph", content: editingNews.content }]);
          }
        } else {
          setSections([{ id: "sec-1", type: "paragraph", content: editingNews.content || "" }]);
        }
      } catch {
        setSections([{ id: "sec-1", type: "paragraph", content: editingNews.content || "" }]);
      }
    } else {
      setTitle("");
      setExcerpt("");
      setThumbnail("");
      setIsPublished(true);
      setSections([{ id: "sec-1", type: "paragraph", content: "" }]);
    }
    setError(null);
  }, [editingNews, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Judul berita wajib diisi.");
      return;
    }

    // Verify sections non-empty
    const hasContent = sections.some((s) => s.content.trim().length > 0);
    if (!hasContent) {
      setError("Artikel harus memiliki setidaknya satu section bertuliskan isi berita.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Serialize sections into JSON format for rich layout rendering
      const serializedContent = JSON.stringify(sections);

      // Auto-extract first paragraph for excerpt if user didn't specify
      let autoExcerpt = excerpt.trim();
      if (!autoExcerpt) {
        const firstP = sections.find((s) => s.type === "paragraph" && s.content.trim().length > 0);
        if (firstP) {
          autoExcerpt = firstP.content.slice(0, 150) + "...";
        } else {
          autoExcerpt = title;
        }
      }

      const payload = {
        title: title.trim(),
        excerpt: autoExcerpt,
        content: serializedContent,
        thumbnail: thumbnail.trim() ? thumbnail.trim() : null,
        isPublished,
      };

      const url = editingNews ? `/api/berita/${editingNews.id}` : "/api/berita";
      const method = editingNews ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyimpan berita.");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {editingNews ? "Edit Berita (Section Block Builder)" : "Tulis Berita Baru (Section Block Builder)"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Susun berita secara terstruktur menggunakan blok section paragraf, judul bagian, gambar, dan highlight pencapaian.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-gray-400 hover:text-slate-600 rounded-xl hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Title & Thumbnail Header */}
          <div className="space-y-3 p-4 bg-slate-50/70 border border-slate-100 rounded-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Newspaper size={14} className="text-blue-500" /> Judul Utama Berita <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Pencapaian Program PMT & Imunisasi Balita Desa Aster"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-blue-500" /> Header Thumbnail URL
                </label>
                <input
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-500" /> Ringkasan (Excerpt Opsional)
                </label>
                <input
                  type="text"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Ringkasan 1-2 kalimat untuk pratinjau..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {/* ── MODULAR SECTION BLOCK EDITOR COMPONENT ──────────────────────── */}
          <NewsBlockEditor sections={sections} onChange={setSections} />

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              Publikasikan Berita Ini
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-gray-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-2 transition cursor-pointer"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {editingNews ? "Simpan Perubahan" : "Publikasikan Berita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
