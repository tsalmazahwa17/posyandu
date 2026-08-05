"use client";

import {
  AlignLeft,
  Heading2,
  Image as ImageIcon,
  Trophy,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { NewsSection, NewsSectionType } from "@/components/news/NewsDetailView";

interface Props {
  sections: NewsSection[];
  onChange: (sections: NewsSection[]) => void;
}

export default function NewsBlockEditor({ sections, onChange }: Props) {
  // Tambah Section Baru
  const handleAddSection = (type: NewsSectionType) => {
    const newSec: NewsSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      type,
      content: "",
      caption: type === "image" || type === "highlight" ? "" : undefined,
    };
    onChange([...sections, newSec]);
  };

  // Update isi / caption dari section tertentu
  const handleUpdateSection = (id: string, field: "content" | "caption", value: string) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, [field]: value } : sec
    );
    onChange(updated);
  };

  // Hapus section
  const handleDeleteSection = (id: string) => {
    if (sections.length <= 1) {
      alert("Artikel berita wajib memiliki minimal 1 (satu) section.");
      return;
    }
    onChange(sections.filter((sec) => sec.id !== id));
  };

  // Geser Urutan Ke Atas
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...sections];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    onChange(next);
  };

  // Geser Urutan Ke Bawah
  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const next = [...sections];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {/* Header Editor */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <AlignLeft size={14} className="text-blue-600" /> Section Block Editor ({sections.length} Blok)
        </label>
        <span className="text-[11px] text-gray-500 font-medium">
          Susun urutan blok sesuai kebutuhan penyampaian artikel
        </span>
      </div>

      {/* List Blok Section */}
      <div className="space-y-3">
        {sections.map((sec, idx) => (
          <div
            key={sec.id}
            className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-3 transition hover:border-blue-200"
          >
            {/* Section Header Bar */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  Blok #{idx + 1}
                </span>
                <span className="text-xs font-semibold text-slate-700 capitalize flex items-center gap-1">
                  {sec.type === "paragraph" && (
                    <><AlignLeft size={13} className="text-gray-400" /> Paragraf Teks</>
                  )}
                  {sec.type === "subheading" && (
                    <><Heading2 size={13} className="text-purple-500" /> Judul Sub-Heading</>
                  )}
                  {sec.type === "image" && (
                    <><ImageIcon size={13} className="text-emerald-500" /> Gambar & Caption</>
                  )}
                  {sec.type === "highlight" && (
                    <><Trophy size={13} className="text-amber-500" /> Highlight / Pencapaian</>
                  )}
                </span>
              </div>

              {/* Action Buttons: Up, Down, Delete */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMoveUp(idx)}
                  disabled={idx === 0}
                  className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                  title="Geser Naik"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(idx)}
                  disabled={idx === sections.length - 1}
                  className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                  title="Geser Turun"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSection(sec.id)}
                  className="p-1 text-rose-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition ml-1 cursor-pointer"
                  title="Hapus Blok"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Input Form per Jenis Blok */}
            {sec.type === "subheading" && (
              <input
                type="text"
                value={sec.content}
                onChange={(e) => handleUpdateSection(sec.id, "content", e.target.value)}
                placeholder="Masukkan Judul Sub-Heading (misal: Hasil Capaian Imunisasi Balita)..."
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            )}

            {sec.type === "paragraph" && (
              <textarea
                rows={3}
                value={sec.content}
                onChange={(e) => handleUpdateSection(sec.id, "content", e.target.value)}
                placeholder="Tuliskan isi paragraf berita di sini..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y leading-relaxed"
              />
            )}

            {sec.type === "image" && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={sec.content}
                  onChange={(e) => handleUpdateSection(sec.id, "content", e.target.value)}
                  placeholder="URL Gambar (misal: /uploads/news/... atau https://...)"
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={sec.caption || ""}
                  onChange={(e) => handleUpdateSection(sec.id, "caption", e.target.value)}
                  placeholder="Caption / Keterangan Gambar (misal: Suasana Penimbangan Balita Posyandu Aster)"
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-200 bg-slate-50/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {sec.type === "highlight" && (
              <div className="space-y-2 bg-amber-50/60 border border-amber-200/80 p-3.5 rounded-xl">
                <input
                  type="text"
                  value={sec.content}
                  onChange={(e) => handleUpdateSection(sec.id, "content", e.target.value)}
                  placeholder="Judul / Angka Pencapaian (misal: Total 98% Balita Terimunisasi)"
                  className="w-full text-xs font-bold px-3.5 py-2 rounded-xl border border-amber-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={sec.caption || ""}
                  onChange={(e) => handleUpdateSection(sec.id, "caption", e.target.value)}
                  placeholder="Catatan Penjelas (misal: Meningkat 15% dibandingkan dengan periode bulan sebelumnya)"
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-amber-200 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Control Toolbar + Tambah Section */}
      <div className="pt-2">
        <span className="text-[11px] font-semibold text-gray-500 block mb-2">
          + Tambah Blok Section Baru:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleAddSection("paragraph")}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl border border-blue-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <AlignLeft size={13} /> + Paragraf
          </button>
          <button
            type="button"
            onClick={() => handleAddSection("subheading")}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl border border-purple-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Heading2 size={13} /> + Sub-Heading
          </button>
          <button
            type="button"
            onClick={() => handleAddSection("image")}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <ImageIcon size={13} /> + Gambar & Caption
          </button>
          <button
            type="button"
            onClick={() => handleAddSection("highlight")}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-xl border border-amber-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trophy size={13} /> + Highlight Pencapaian
          </button>
        </div>
      </div>
    </div>
  );
}
