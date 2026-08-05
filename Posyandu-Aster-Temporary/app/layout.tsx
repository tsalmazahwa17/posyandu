import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { RealtimeProvider } from "@/components/realtime/RealtimeProvider";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Posyandu Aster — Layanan Kesehatan & Sistem Informasi Digital",
    template: "%s | Posyandu Aster",
  },
  description:
    "Sistem Informasi Digital & Layanan Kesehatan Terpadu Posyandu Aster. Pemantauan tumbuh kembang balita, pemeriksaan lansia, ibu hamil, absensi QR, dan publikasi kegiatan posyandu.",
  keywords: [
    "Posyandu Aster",
    "Sistem Informasi Posyandu",
    "Kesehatan Masyarakat",
    "MPASI Balita",
    "Pemeriksaan Lansia",
    "Absensi Posyandu",
    "Pencegahan Stunting",
  ],
  authors: [{ name: "Pengurus Posyandu Aster" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://posyandu-aster.org",
    siteName: "Posyandu Aster",
    title: "Posyandu Aster — Layanan Kesehatan & Sistem Informasi Digital",
    description:
      "Sistem Informasi Digital & Layanan Kesehatan Terpadu Posyandu Aster. Pemantauan tumbuh kembang balita, lansia, bumil, dan absensi QR.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Posyandu Aster Digital",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Posyandu Aster — Layanan Kesehatan Digital",
    description:
      "Sistem Informasi Digital Posyandu Aster untuk pelayanan balita, bumil, lansia, dan informasi masyarakat.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased bg-[#f8fafc] text-slate-800 selection:bg-blue-600 selection:text-white">
        <Script
          src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.107.0"
          strategy="beforeInteractive"
        />
        <RealtimeProvider>
          <ToastProvider>{children}</ToastProvider>
        </RealtimeProvider>
      </body>
    </html>
  );
}