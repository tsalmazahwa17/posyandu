import Link from "next/link";
import { ArrowUpRight, Package } from "lucide-react";

interface ProductItem {
  id: number;
  name: string;
  price: number;
  image: string | null;
  stock: number;
}

const GRADIENTS = [
  "from-amber-50 to-orange-100/60",
  "from-emerald-50 to-teal-100/60",
  "from-blue-50 to-indigo-100/60",
];

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProductShowcase({ items }: { items: ProductItem[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-gray-800">
            Katalog Produk Posyandu
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Produk makanan tambahan (PMT) terbaru
          </p>
        </div>
        <Link
          href="/konten/produk"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Kelola
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">
          Belum ada produk terdaftar.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`rounded-xl bg-gradient-to-br ${
                GRADIENTS[i % GRADIENTS.length]
              } border border-gray-200/60 overflow-hidden`}
            >
              <div className="h-24 relative bg-white/40">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">
                  {item.name}
                </p>
                <p className="text-sm font-bold text-orange-600 mt-1.5">
                  {formatRupiah(item.price)}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Stok: {item.stock}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
