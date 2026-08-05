"use client";

import { Share2 } from "lucide-react";

export default function ShareButton() {
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Tautan berita berhasil disalin!");
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-3.5 py-2 rounded-xl transition cursor-pointer"
    >
      <Share2 size={14} /> Bagikan Berita
    </button>
  );
}
