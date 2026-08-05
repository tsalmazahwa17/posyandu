import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, CheckCircle2, HeartPulse, Package, PhoneCall, ShieldCheck, Tag } from "lucide-react";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const productId = parseInt(id);

  if (!isNaN(productId)) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (product) {
      const description = product.description || product.name;
      const image = product.image?.trim();
      return {
        title: `${product.name} | Katalog PMT Posyandu Aster`,
        description,
        openGraph: {
          title: product.name,
          description,
          ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: product.name }] } : {}),
        },
        twitter: {
          card: image ? "summary_large_image" : "summary",
          title: product.name,
          description,
          ...(image ? { images: [image] } : {}),
        },
      };
    }
  }

  return {
    title: "Detail Produk PMT | Posyandu Aster",
  };
}

interface ProductData {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string | null;
  image: string | null;
  isActive?: boolean;
}

export default async function PublicProductDetailPage({ params }: Props) {
  const { id } = await params;
  const productId = parseInt(id);

  let product: ProductData | null = null;
  let relatedProducts: ProductData[] = [];

  if (!isNaN(productId)) {
    const dbProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (dbProduct) {
      product = {
        ...dbProduct,
        price: Number(dbProduct.price),
      };

      const dbRelated = await prisma.product.findMany({
        where: {
          id: { not: productId },
          isActive: true,
        },
        take: 3,
      });

      relatedProducts = dbRelated.map((p) => ({
        ...p,
        price: Number(p.price),
      }));
    }
  }


  if (!product) {
    notFound();
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between">
      <Navbar />

      <main className="pt-28 pb-20 flex-1">
        <div className="max-w-5xl mx-auto px-6 space-y-10">
          {/* Back Button */}
          <div>
            <Link
              href="/produk"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-white border border-gray-200/80 px-4 py-2.5 rounded-xl shadow-2xs hover:shadow-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Kembali ke Katalog Produk</span>
            </Link>
          </div>

          {/* Product Detail Card */}
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Image */}
            <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-gray-100 shadow-xs bg-slate-100 relative">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                  <Package size={56} />
                </div>
              )}
              <span className="absolute top-4 left-4 text-xs font-bold bg-white/90 backdrop-blur-xs text-blue-800 px-3 py-1 rounded-lg shadow-2xs border border-blue-100">
                PMT Posyandu Aster
              </span>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 mb-3">
                  <Tag size={12} />
                  Program Makanan Tambahan
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {product.name}
                </h1>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-2xl font-black text-blue-600">
                    {formatRupiah(product.price)}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Stok: {product.stock > 0 ? `${product.stock} Porsi` : "Habis"}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Deskripsi & Manfaat Nutrisi
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {product.description || "Olahan sehat berstandar gizi Posyandu Aster."}
                </p>
              </div>

              {/* Quality Standards Checklist */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Jaminan Standar Gizi Posyandu Aster</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Diolah dengan higienis dari bahan pangan lokal segar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Diformulasikan sesuai standar gizi Kemenkes RI</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Konsultasi pemberian gizi gratis oleh Kader Posyandu</span>
                  </li>
                </ul>
              </div>

              {/* Contact Button */}
              <div className="pt-2">
                <a
                  href="https://wa.me/?text=Halo%20Posyandu%20Aster,%20saya%20inisiatif%20menanyakan%20produk%20PMT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 transition"
                >
                  <PhoneCall size={15} />
                  <span>Tanyakan / Dapatkan via Kader Posyandu</span>
                </a>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-gray-200/80">
              <h2 className="text-xl font-bold text-slate-900">Produk PMT Lainnya</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedProducts.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/produk/${rel.id}`}
                    className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="h-36 bg-slate-100 rounded-xl overflow-hidden mb-3">
                        {rel.image ? (
                          <img
                            src={rel.image}
                            alt={rel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Package size={30} />
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition line-clamp-1">
                        {rel.name}
                      </h3>
                      <p className="text-xs text-blue-600 font-bold mt-1">
                        {formatRupiah(rel.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
