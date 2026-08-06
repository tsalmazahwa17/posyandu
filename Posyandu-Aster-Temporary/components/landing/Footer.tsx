import Link from "next/link";
import { MapPin, Phone, Mail, MessageCircle, Share2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#f8fafc] text-gray-600 pt-16 pb-12 border-t border-gray-200/80">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-gray-200/80">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo-aster.jpg"
                alt="Posyandu Aster"
                className="w-10 h-10 rounded-full object-cover border border-amber-200 shadow-xs"
              />
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-base leading-tight">Posyandu Aster</span>
                <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
                  SISTEM INFORMASI DIGITAL
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              Layanan Kesehatan Lebih Terukur & Ramah. Pencatatan terintegrasi pemantauan tumbuh kembang balita hingga lansia.
            </p>

            {/* Pertamina Patra Niaga CSR Banner */}
            <div className="inline-flex items-center gap-3 p-2.5 pr-4 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
              <img
                src="/images/logo-pertamina.png"
                alt="Pertamina Patra Niaga"
                className="h-7 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-800 leading-none">Didukung oleh CSR</span>
                <span className="text-[10px] text-gray-400 font-medium mt-0.5">Pertamina Patra Niaga</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://wa.me/6285646519926"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-blue-600 flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-blue-600 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="https://maps.app.goo.gl/WcqukfBndZsPDvG59?g_st=aw"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-blue-600 flex items-center justify-center transition-colors"
                aria-label="Google Maps"
              >
                <MapPin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Navigasi</h4>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li><Link href="#tentang" className="hover:text-blue-600">Tentang Posyandu</Link></li>
              <li><Link href="#layanan" className="hover:text-blue-600">Layanan Kesehatan</Link></li>
              <li><Link href="#jadwal" className="hover:text-blue-600">Jadwal Pelayanan</Link></li>
              <li><Link href="/berita" className="hover:text-blue-600">Berita Terbaru</Link></li>
              <li><Link href="/produk" className="hover:text-blue-600">Produk PMT</Link></li>
              <li><Link href="/dokumentasi" className="hover:text-blue-600">Dokumentasi</Link></li>
              <li><Link href="#faq" className="hover:text-blue-600">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4 space-y-2">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Alamat & Kontak</h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <a
                  href="https://maps.app.goo.gl/WcqukfBndZsPDvG59?g_st=aw"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-600 transition"
                >
                  Jl. Aster Raya No. 12, Kel. Harapan Baru, Kecamatan Aster Sejahtera.
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>+62 856-4651-9926</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>nrl.azizah@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
          <p>© {new Date().getFullYear()} Posyandu Aster. Hak Cipta Dilindungi.</p>
          <p>Sistem Informasi Digital Posyandu</p>
        </div>
      </div>
    </footer>
  );
}
