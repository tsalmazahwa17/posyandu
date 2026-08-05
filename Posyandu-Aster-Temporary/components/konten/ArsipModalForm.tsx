"use client";

import { useState, useRef } from "react";
import {
  X,
  Loader2,
  FileText,
  Tag,
  Link as LinkIcon,
  Upload,
  FileSpreadsheet,
  File as FileIcon,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ACCEPTED_TYPES = ".pdf,.doc,.docx,.xls,.xlsx,.csv";
const ACCEPTED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
  "application/csv",
];

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "xls" || ext === "xlsx" || ext === "csv") {
    return <FileSpreadsheet size={16} className="text-green-600" />;
  }
  return <FileIcon size={16} className="text-blue-600" />;
}

export default function ArsipModalForm({ isOpen, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number>(2); // Default 2: SOP

  // Mode: "upload" (file langsung) atau "url" (link eksternal)
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [fileUrl, setFileUrl] = useState("");

  // State upload file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi sisi client
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExts = ["pdf", "doc", "docx", "xls", "xlsx", "csv"];
    if (!allowedExts.includes(ext)) {
      setError(`Format .${ext} tidak diizinkan. Gunakan: PDF, Word, Excel, atau CSV.`);
      return;
    }
    const maxSize = ["xls", "xlsx", "csv"].includes(ext) ? 20 : 10;
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Ukuran file terlalu besar. Maksimal ${maxSize} MB untuk .${ext}.`);
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Judul dokumen wajib diisi.");
      return;
    }

    setError(null);
    let finalUrl = fileUrl.trim();

    // Mode upload: upload file ke /api/upload terlebih dahulu
    if (mode === "upload") {
      if (!selectedFile) {
        setError("Pilih file yang akan diunggah.");
        return;
      }
      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", selectedFile);
        form.append("folder", "arsip");

        const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
        const uploadJson = await uploadRes.json();

        if (!uploadRes.ok || !uploadJson.success) {
          throw new Error(uploadJson.error || "Gagal mengunggah file.");
        }
        finalUrl = uploadJson.data.url as string;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Gagal mengunggah file.");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    } else {
      if (!finalUrl) {
        setError("URL file dokumen wajib diisi.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/arsip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() ? description.trim() : null,
          categoryId: Number(categoryId),
          fileUrl: finalUrl,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyimpan dokumen.");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const isSubmitting = uploading || loading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Unggah Dokumen Arsip / SOP</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Simpan dokumen penting Posyandu (Proposal, SOP, Surat, Laporan, Excel).
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Judul */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText size={14} className="text-blue-500" /> Nama / Judul Dokumen <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: SOP Pelayanan Penimbangan Balita 2026"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Tag size={14} className="text-blue-500" /> Kategori Dokumen <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value={1}>Proposal Kegiatan</option>
              <option value={2}>SOP (Standard Operating Procedure)</option>
              <option value={3}>Surat Resmi</option>
              <option value={4}>Laporan Bulanan / Tahunan</option>
              <option value={5}>Dokumen Lainnya</option>
            </select>
          </div>

          {/* Mode toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Sumber File <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setMode("upload"); setFileUrl(""); }}
                className={`flex-1 text-xs font-semibold py-2 rounded-xl border transition flex items-center justify-center gap-1.5 ${
                  mode === "upload"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Upload size={13} />
                Upload File
              </button>
              <button
                type="button"
                onClick={() => { setMode("url"); setSelectedFile(null); }}
                className={`flex-1 text-xs font-semibold py-2 rounded-xl border transition flex items-center justify-center gap-1.5 ${
                  mode === "url"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <LinkIcon size={13} />
                Link Eksternal
              </button>
            </div>
          </div>

          {/* Upload mode */}
          {mode === "upload" && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                className="hidden"
                onChange={handleFileChange}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-5 text-center cursor-pointer transition group"
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    {getFileIcon(selectedFile.name)}
                    <div className="text-left">
                      <p className="text-xs font-semibold text-slate-700 truncate max-w-xs">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload size={22} className="mx-auto text-gray-300 group-hover:text-blue-400 mb-2 transition" />
                    <p className="text-xs font-medium text-gray-500">
                      Klik untuk memilih file
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      PDF, Word, Excel (.xls/.xlsx), CSV — maks. 10 MB (Excel/CSV: 20 MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* URL mode */}
          {mode === "url" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <LinkIcon size={14} className="text-blue-500" /> URL File Dokumen <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://drive.google.com/... atau URL berkas dokumen"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          )}

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText size={14} className="text-blue-500" /> Keterangan / Ringkasan Dokumen
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Penjelasan singkat mengenai petunjuk / rincian dokumen ini..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>

          {/* Footer */}
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
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-2 transition"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {uploading ? "Mengunggah..." : "Simpan Dokumen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
