import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function Products() {
  let dbProducts: any[] = [];
  try {
    dbProducts = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
  } catch (error) {
    console.error("[Products] Database fetch error:", error);
  }

  const products = dbProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    description: p.description || "Produk Makanan Tambahan (PMT) Gizi Sehat Posyandu Aster.",
    image: p.image,
  }));

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section id="produk" className="py-20 bg-white border-y border-gray-200/60">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Katalog Produk Posyandu
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Produk makanan tambahan (PMT) dan suplemen bergizi Posyandu Aster.
            </p>
          </div>

          <Link
            href="/produk"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
          >
            <span>Lihat Produk Lainnya</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <Package className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600">Belum ada produk aktif.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
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
                      <Package size={40} />
                      <span className="text-[10px] text-gray-400 mt-1">PMT Aster</span>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 text-[10px] font-bold bg-white/90 text-gray-800 px-2.5 py-0.5 rounded-md shadow-2xs">
                    PMT / UMKM
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {prod.name}
                    </h3>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                      {formatRupiah(prod.price)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {prod.description}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-1 flex justify-end border-t border-gray-100 mt-2">
                <Link
                  href="/produk"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  <span>Lihat Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
