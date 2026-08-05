import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-16 bg-white border-t border-gray-200/60">
      <div className="max-w-6xl mx-auto px-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 sm:p-12 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block">
              SISTEM INFORMASI DIGITAL POSYANDU ASTER
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Siap menggunakan Sistem Informasi Posyandu Aster?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Akses cepat pencatatan tumbuh kembang balita, pemeriksaan ibu hamil, lansia, hingga presensi pengurus.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <Link
              href="/login"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-sm shadow-sm transition-all"
            >
              <span>Masuk Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
