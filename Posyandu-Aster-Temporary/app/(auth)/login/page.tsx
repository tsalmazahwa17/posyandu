import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Activity, Shield, Smartphone } from "lucide-react";
import LoginForm from "@/components/forms/LoginForm";

export const metadata = {
  title: "Masuk | Posyandu Aster",
  description:
    "Masuk ke Sistem Informasi Digital Posyandu Aster untuk mengakses dasbor pelayanan kesehatan.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full opacity-30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100 rounded-full opacity-20 blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 w-full px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white/70 backdrop-blur-sm border border-white/50 px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-8">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* ── LEFT SIDE ── */}
          <div className="hidden lg:block">
            {/* Brand & CSR Co-Branding */}
            <div className="flex items-center gap-3 mb-8">
              <img
                src="/images/logo-aster.jpg"
                alt="Posyandu Aster"
                className="w-11 h-11 rounded-full object-cover border border-amber-200 shadow-sm flex-shrink-0"
              />
              <div>
                <h3 className="font-bold text-slate-800 text-base leading-none">
                  Posyandu Aster
                </h3>
                <p className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mt-0.5">
                  Sistem Informasi Digital
                </p>
              </div>

              <div className="flex items-center gap-2 pl-3 ml-2 border-l border-slate-200">
                <span className="text-[10px] text-slate-400 font-medium">Binaan</span>
                <img
                  src="/images/logo-pertamina.png"
                  alt="Pertamina Patra Niaga"
                  className="h-6 object-contain"
                />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-slate-900 mb-5">
              Layanan Kesehatan
              <br />
              <span className="text-blue-600">Lebih Terukur</span>
              <span className="text-slate-700"> &amp; </span>
              <span className="text-orange-500">Ramah.</span>
            </h1>

            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-10">
              Sistem pencatatan terintegrasi untuk pemantauan tumbuh kembang,
              pencatatan kunjungan harian, dan pengelolaan administrasi posyandu
              yang modern.
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-4 bg-white/60 backdrop-blur-sm border border-white/70 rounded-2xl p-4 hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800">
                    Monitoring Akurat
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Grafik perkembangan tumbuh kembang balita yang otomatis
                    terupdate setiap saat.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/60 backdrop-blur-sm border border-white/70 rounded-2xl p-4 hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800">
                    Akses Fleksibel
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Kemudahan pencatatan data layanan dari berbagai perangkat,
                    kapan saja.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/60 backdrop-blur-sm border border-white/70 rounded-2xl p-4 hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800">
                    Data Aman &amp; Terpercaya
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Sistem keamanan berlapis memastikan data warga posyandu
                    terlindungi.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="mt-8 flex items-center gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-800">500+</p>
                <p className="text-xs text-slate-500 mt-0.5">Warga Terdaftar</p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <p className="text-2xl font-bold text-slate-800">12</p>
                <p className="text-xs text-slate-500 mt-0.5">Layanan Aktif</p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <p className="text-2xl font-bold text-slate-800">99%</p>
                <p className="text-xs text-slate-500 mt-0.5">Uptime Sistem</p>
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDE: Login Card ── */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
              {/* Card header */}
              <div className="mb-7">
                {/* Mobile brand */}
                <div className="flex items-center justify-between mb-5 lg:hidden pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/images/logo-aster.jpg"
                      alt="Posyandu Aster"
                      className="w-9 h-9 rounded-full object-cover border border-amber-200 shadow-xs flex-shrink-0"
                    />
                    <div>
                      <p className="font-bold text-slate-800 text-sm leading-none">
                        Posyandu Aster
                      </p>
                      <p className="text-[9px] font-semibold text-slate-400 tracking-widest uppercase mt-0.5">
                        Sistem Informasi Digital
                      </p>
                    </div>
                  </div>

                  <img
                    src="/images/logo-pertamina.png"
                    alt="Pertamina Patra Niaga"
                    className="h-5 object-contain"
                  />
                </div>

                <h2 className="text-2xl font-bold text-slate-900">
                  Selamat Datang 👋
                </h2>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Masukkan email dan kata sandi Anda untuk mengakses dasbor
                  pelayanan.
                </p>
              </div>

              {/* Login Form wrapped in Suspense for useSearchParams */}
              <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100 rounded-xl" />}>
                <LoginForm />
              </Suspense>

              {/* Footer note */}
              <div className="mt-7 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sistem informasi khusus untuk pengurus &amp; kader Posyandu Aster
                </p>
              </div>

            </div>

            {/* Security badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Shield className="w-3 h-3" />
              <span>Koneksi aman &amp; terenkripsi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-4 text-center">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Posyandu Aster · Sistem Informasi Digital
          Pelayanan Kesehatan
        </p>
      </div>
    </div>
  );
}