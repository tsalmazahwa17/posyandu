import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ArrowRight, HeartPulse, Package } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Katalog Produk PMT & UMKM | Posyandu Aster",
  description: "Sajian gizi dan suplemen nutrisi berstandar kesehatan yang dibagikan secara rutin di Posyandu Aster.",
};

export default async function PublicProdukPage() {
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const products = dbProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    description: p.description || "Olahan bahan pangan lokal bernutrisi sehat Posyandu Aster.",
    image: p.image,
    stock: p.stock,
  }));

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 flex flex-col justify-between">
      <Navbar />

      <main className="pt-32 pb-20 flex-1">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-gray-200/80 px-3.5 py-2 rounded-xl shadow-2xs hover:shadow-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-sm mb-10">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block mb-1">
              PROGRAM MAKANAN TAMBAHAN (PMT)
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Katalog Produk Posyandu Aster
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-blue-100 leading-relaxed max-w-xl">
              Sajian gizi dan suplemen nutrisi berstandar kesehatan yang dibagikan secara rutin di Posyandu Aster.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-xs">
              <Package className="w-12 h-12 mx-auto text-slate-300" />
              <h2 className="mt-4 text-base font-bold text-slate-700">Belum ada produk aktif</h2>
              <p className="mt-1 text-sm text-slate-500">Produk akan tampil otomatis setelah diaktifkan dari dashboard.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((prod) => (
              <Link
                key={prod.id}
                href={`/produk/${prod.id}`}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="h-44 bg-slate-100 relative overflow-hidden border-b border-gray-100">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                        <Package size={44} />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[10px] font-bold bg-white/90 text-gray-800 px-2.5 py-0.5 rounded-md shadow-2xs">
                      PMT Posyandu
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {prod.name}
                      </h2>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                        {formatRupiah(prod.price)}
                      </span>
                    </div>

                    <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-2.5 mb-3">
                      <p className="text-[10px] font-bold text-blue-800 uppercase flex items-center gap-1">
                        <HeartPulse className="w-3 h-3 text-blue-600" />
                        <span>Ketersediaan Stok:</span>
                      </p>
                      <p className="text-xs font-semibold text-blue-700 mt-0.5">
                        {prod.stock > 0 ? `Tersedia (${prod.stock} porsi)` : "Stok Habis"}
                      </p>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {prod.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex justify-end border-t border-gray-50">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                    <span>Lihat Detail Rincian</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
