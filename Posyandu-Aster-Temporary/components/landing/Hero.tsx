import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle2 } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side Content - Matching Login Page Exactly */}
          <div>
            {/* Program Binaan CSR Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-200/80 shadow-2xs mb-4">
              <img
                src="/images/logo-aster.jpg"
                alt="Aster"
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-xs font-semibold text-gray-700">Posyandu 6 SPM Aster</span>
              <span className="text-gray-300">•</span>
              <span className="text-[11px] text-gray-400 font-medium">Binaan</span>
              <img
                src="/images/logo-pertamina.png"
                alt="Pertamina Patra Niaga"
                className="h-4 object-contain"
              />
            </div>

            {/* Main Headline - Matches Login Page Font & Styling */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold leading-tight text-gray-900">
              Layanan Kesehatan{" "}
              <br className="hidden sm:inline" />
              <span className="text-blue-600">Lebih Terukur</span>
              <span> & Ramah.</span>
            </h1>

            {/* Subtitle Paragraph */}
            <p className="mt-5 text-gray-500 text-sm sm:text-base max-w-md leading-relaxed">
              Sistem pencatatan terintegrasi untuk pemantauan tumbuh kembang, pencatatan kunjungan harian, dan pengelolaan administrasi posyandu yang modern.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
              <Link
                href="#jadwal"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm border border-gray-200 shadow-2xs hover:border-gray-300 transition-all"
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Jadwal Posyandu</span>
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm hover:shadow transition-all"
              >
                <span>Masuk Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Highlights Grid - Matches 2 White Cards in Login Page */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs">
                <p className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                  <span>📊</span>
                  <span>Monitoring Akurat</span>
                </p>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Grafik perkembangan tumbuh kembang otomatis terupdate.
                </p>
              </div>

              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs">
                <p className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                  <span>📱</span>
                  <span>Akses Fleksibel</span>
                </p>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Kemudahan pencatatan dari berbagai perangkat.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side Visual - Matches Dashboard Main Blue Banner & Cards */}
          <div className="relative">
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-md space-y-5">
              {/* Dashboard Banner Preview */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200">
                      DASHBOARD POSYANDU ASTER
                    </span>
                    <h3 className="text-xl font-bold mt-1">
                      Pelayanan sehat, data rapi, keputusan lebih cepat.
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-blue-100 max-w-sm mb-4 leading-relaxed">
                  Pemantauan kesehatan rutin mencakup tumbuh kembang balita, ibu hamil, remaja, usia produktif hingga lansia.
                </p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs">
                    544 Sasaran
                  </span>
                  <span className="px-3 py-1 bg-white text-blue-700 rounded-lg text-xs font-bold shadow-2xs">
                    Live Digital KMS
                  </span>
                </div>
              </div>

              {/* 3 Quick Cards Preview like Dashboard */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5">
                  <span className="text-xs font-bold text-blue-700 block">128</span>
                  <span className="text-[11px] font-medium text-gray-600 block mt-0.5">Balita Terdaftar</span>
                </div>

                <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3.5">
                  <span className="text-xs font-bold text-amber-700 block">36</span>
                  <span className="text-[11px] font-medium text-gray-600 block mt-0.5">Ibu Hamil</span>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3.5">
                  <span className="text-xs font-bold text-emerald-700 block">74</span>
                  <span className="text-[11px] font-medium text-gray-600 block mt-0.5">Lansia Sehat</span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs">
                <div className="flex items-center gap-2 font-medium text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Pelayanan Bulan Juli 2026</span>
                </div>
                <span className="text-blue-600 font-bold text-[11px]">Aktif</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
