"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle2 } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Apa itu Posyandu Aster?",
      answer: "Posyandu Aster adalah Lembaga Kemasyarakatan Desa (LKD) yang menyelenggarakan pelayanan kesehatan terpadu mencakup seluruh siklus hidup—balita, ibu hamil, remaja, usia produktif, hingga lansia."
    },
    {
      question: "Siapa yang bisa datang dan memanfaatkan pelayanan?",
      answer: "Seluruh warga masyarakat (terutama di wilayah kerja Posyandu Aster) mulai dari balita, ibu hamil, remaja, dewasa usia produktif, hingga lanjut usia (lansia)."
    },
    {
      question: "Apakah seluruh pelayanan di Posyandu Aster gratis?",
      answer: "Ya! Seluruh pelayanan dasar mencakup penimbangan balita, suplemen Vitamin A, pemeriksaan ANC ibu hamil, skrining anemia remaja, pemeriksaan tensi lansia, hingga Makanan Tambahan (PMT) disediakan secara GRATIS."
    },
    {
      question: "Bagaimana cara mengetahui jadwal pelaksanaan Posyandu?",
      answer: "Jadwal resmi pelaksanaan Posyandu dipublikasikan secara lengkap di halaman utama website ini pada bagian 'Jadwal Pelayanan' serta diumumkan melalui pengumuman RT/RW setempat."
    },
    {
      question: "Bagaimana cara mendaftar sebagai sasaran Posyandu Aster?",
      answer: "Anda dapat mendaftar langsung saat pelaksanaan Posyandu dengan membawa Fotokopi KTP/KK dan Buku KIA (untuk balita/bumil), atau menghubungi Pengurus Posyandu Aster setempat."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Pertanyaan Sering Diajukan (FAQ)
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Informasi seputar pelayanan dan kegiatan rutin Posyandu Aster.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  isOpen
                    ? "border-blue-300 shadow-2xs"
                    : "border-gray-200/80 hover:border-gray-300 shadow-2xs"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-gray-800 hover:text-blue-600 transition-colors"
                >
                  <span className="text-sm sm:text-base flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 text-xs flex items-center justify-center font-bold shrink-0">
                      Q{index + 1}
                    </span>
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                      isOpen ? "transform rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-blue-50/20 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{faq.answer}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
