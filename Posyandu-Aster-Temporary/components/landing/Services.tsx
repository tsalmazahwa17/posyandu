import { Check } from "lucide-react";

export default function Services() {
  const services = [
    {
      icon: "👶",
      title: "Balita",
      subtitle: "Pemantauan tumbuh kembang",
      badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
      description: "Pemeriksaan penimbangan berat badan, tinggi badan, imunisasi dasar, dan evaluasi KMS digital.",
      features: ["Penimbangan Harian", "Vitamin A & Imunisasi", "Konsultasi Stunting"]
    },
    {
      icon: "🤰",
      title: "Ibu Hamil",
      subtitle: "Pemeriksaan ANC & Kelas Bumil",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-100",
      description: "Pemeriksaan antenatal (ANC), pemantauan LILA, suplemen tambah darah, dan edukasi persalinan.",
      features: ["Pemeriksaan LILA", "Tablet Tambah Darah", "Kelas Ibu Hamil"]
    },
    {
      icon: "🧑",
      title: "Remaja",
      subtitle: "Skrining anemia & edukasi",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
      description: "Pemeriksaan kadar Hb remaja putri, edukasi gizi seimbang, dan kesehatan reproduksi.",
      features: ["Cek Hb Gratis", "Tablet Fe Remaja", "Konseling Kesehatan"]
    },
    {
      icon: "💼",
      title: "Usia Produktif",
      subtitle: "Skrining PTM (Penyakit Tidak Menular)",
      badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-100",
      description: "Deteksi dini hipertensi, diabetes, dan pengukuran IMT serta lingkar perut secara berkala.",
      features: ["Pemeriksaan Tensi", "Cek Gula Darah", "Pengukuran IMT"]
    },
    {
      icon: "👴",
      title: "Lansia",
      subtitle: "Pemeriksaan rutin lansia sehat",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-100",
      description: "Pemeriksaan kesehatan berkala, cek asam urat, kolesterol, dan senam lansia bersama.",
      features: ["Tensi & Asam Urat", "Cek Kolesterol", "Senam Lansia"]
    }
  ];

  return (
    <section id="layanan" className="py-20 bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Title */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Layanan Posyandu Aster
          </h2>
          <p className="text-sm text-gray-500 mt-2 max-w-xl leading-relaxed">
            Pelayanan kesehatan terpadu 5 siklus hidup dengan standar pencatatan digital yang ramah dan terukur.
          </p>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Icon & Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                    {service.icon}
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${service.badgeColor}`}>
                    {service.title}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-0.5">
                  {service.title}
                </h3>
                <p className="text-xs font-semibold text-blue-600 mb-3">
                  {service.subtitle}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed mb-5">
                  {service.description}
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="pt-3 border-t border-gray-100">
                <div className="space-y-1.5">
                  {service.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-gray-700">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
