"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, User, Tag, Clock, Trophy, Image as ImageIcon } from "lucide-react";
import ShareButton from "./ShareButton";

export type NewsSectionType = "paragraph" | "subheading" | "image" | "highlight";

export interface NewsSection {
  id: string;
  type: NewsSectionType;
  content: string;
  caption?: string;
}

export interface NewsArticleData {
  id: number;
  title: string;
  excerpt?: string | null;
  content: string;
  thumbnail?: string | null;
  isPublished?: boolean;
  publishedAt?: string | Date | null;
  createdAt?: string | Date;
  category?: { id: number; name: string } | null;
  author?: { id: number; fullName: string } | null;
}

interface Props {
  article: NewsArticleData;
  onBack?: () => void;
  backHref?: string;
  backLabel?: string;
}

function getNewsThumbnail(url?: string | null): string {
  if (!url || url.startsWith("/images/news/") || url.startsWith("/images/")) {
    return "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop";
  }
  return url;
}

export default function NewsDetailView({
  article,
  onBack,
  backHref = "/berita",
  backLabel = "Kembali ke Daftar Berita",
}: Props) {
  const thumbnailUrl = getNewsThumbnail(article.thumbnail);

  // Parse structured sections if content is stored as JSON array
  let parsedSections: NewsSection[] | null = null;
  try {
    if (article.content && article.content.trim().startsWith("[")) {
      const parsed = JSON.parse(article.content);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) {
        parsedSections = parsed;
      }
    }
  } catch {
    parsedSections = null;
  }

  const formattedDate = new Date(
    article.publishedAt || article.createdAt || Date.now()
  ).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── 1. TOMBOL KEMBALI HIERARKIS ─────────────────────────────────── */}
      <div>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-white border border-gray-200/80 px-4 py-2.5 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← {backLabel}</span>
          </button>
        ) : (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-white border border-gray-200/80 px-4 py-2.5 rounded-xl shadow-2xs hover:shadow-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← {backLabel}</span>
          </Link>
        )}
      </div>

      {/* ── 2. UNIFORM DETAIL CARD LAYOUT ───────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-10 space-y-6 overflow-hidden">
        {/* Meta Header */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
            <Tag size={12} />
            {article.category?.name || "Berita & Pengumuman"}
          </span>

          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{formattedDate}</span>
          </div>

          {article.author && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium ml-auto">
              <User size={13} className="text-gray-400" />
              <span>{article.author.fullName}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
          {article.title}
        </h1>

        {/* Excerpt Summary */}
        {article.excerpt && (
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed bg-blue-50/60 border-l-4 border-blue-600 p-4 rounded-r-2xl">
            {article.excerpt}
          </p>
        )}

        {/* Featured Image */}
        {thumbnailUrl && (
          <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden shadow-xs border border-gray-100 bg-slate-100">
            <img
              src={thumbnailUrl}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop";
              }}
            />
          </div>
        )}

        {/* Article Body Content (Structured Sections or Fallback Text) */}
        <div className="pt-4 border-t border-gray-100 text-slate-700 text-sm sm:text-base leading-relaxed space-y-5">
          {parsedSections ? (
            parsedSections.map((section, idx) => {
              if (section.type === "subheading") {
                return (
                  <h2
                    key={section.id || idx}
                    className="text-xl sm:text-2xl font-bold text-slate-900 pt-4 pb-1 border-b border-gray-100"
                  >
                    {section.content}
                  </h2>
                );
              }

              if (section.type === "paragraph") {
                return (
                  <p key={section.id || idx} className="whitespace-pre-line text-slate-700 leading-relaxed">
                    {section.content}
                  </p>
                );
              }

              if (section.type === "image") {
                return (
                  <figure key={section.id || idx} className="my-6 space-y-2">
                    <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-gray-200 shadow-xs bg-slate-100">
                      <img
                        src={section.content}
                        alt={section.caption || "Gambar Berita"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop";
                        }}
                      />
                    </div>
                    {section.caption && (
                      <figcaption className="text-xs text-center text-gray-500 font-medium italic">
                        📷 {section.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              }

              if (section.type === "highlight") {
                return (
                  <div
                    key={section.id || idx}
                    className="my-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-6 rounded-2xl shadow-md flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                      <Trophy size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-200 block">
                        Highlight / Pencapaian Kegiatan
                      </span>
                      <h4 className="text-lg font-extrabold mt-0.5 text-white">
                        {section.content}
                      </h4>
                      {section.caption && (
                        <p className="text-xs text-blue-100 mt-1.5 leading-relaxed">
                          {section.caption}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }

              return null;
            })
          ) : (
            <div className="whitespace-pre-line text-slate-700 leading-relaxed">
              {article.content}
            </div>
          )}
        </div>

        {/* Share & Footer info */}
        <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
            <Clock size={14} />
            Dipublikasikan oleh Sistem Posyandu Aster Digital
          </span>
          <ShareButton />
        </div>
      </div>
    </div>
  );
}
