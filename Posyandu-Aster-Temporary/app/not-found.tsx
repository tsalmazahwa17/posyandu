import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Halaman Tidak Ditemukan | Posyandu Aster",
  description: "Halaman yang Anda cari tidak tersedia.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Illustration */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
              <FileQuestion className="w-16 h-16 text-blue-400" />
            </div>
            <div className="absolute -top-2 -right-2 bg-white rounded-full shadow-md w-10 h-10 flex items-center justify-center">
              <span className="text-xl font-bold text-orange-500">?</span>
            </div>
          </div>
        </div>

        {/* 404 text */}
        <p className="text-7xl font-black text-blue-100 leading-none mb-2 select-none">
          404
        </p>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2 -mt-4">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau belum tersedia. Periksa kembali alamat URL yang Anda masukkan.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            Ke Beranda
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm px-5 py-2.5 rounded-xl border border-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
