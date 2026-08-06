"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Tag,
  CheckCircle,
  XCircle,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import type { SessionPayload } from "@/lib/session";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import ProdukModalForm, { ProductItem } from "./ProdukModalForm";

interface Props {
  user: SessionPayload;
}

export default function ProdukManagementView({ user }: Props) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStock, setFilterStock] = useState<"all" | "available" | "empty">("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  const isOfficer = user.role === "ADMIN" || user.role === "KADER";

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/produk?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal memuat katalog produk.");
      }

      setProducts(json.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  useRealtimeRefresh(fetchProducts, ["products"]);

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!isOfficer) return;
    const ok = window.confirm(`Yakin ingin menghapus produk "${name}"?`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/produk/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menghapus produk.");
      }
      fetchProducts();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus produk.");
    }
  };

  const filteredProducts = products.filter((p) => {
    if (filterStock === "available") return p.stock > 0;
    if (filterStock === "empty") return p.stock === 0;
    return true;
  });

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Katalog Produk Posyandu (PMT & UMKM)
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {isOfficer
              ? "Kelola menu Pemberian Makanan Tambahan (PMT) dan olahan produk UMKM warga."
              : "Daftar menu PMT gizi sehat dan produk UMKM warga Posyandu Aster."}
          </p>
        </div>

        {isOfficer && (
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
          >
            <Plus size={16} />
            Tambah Produk Baru
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama produk..."
            className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-500 font-medium">Stok:</span>
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value as "all" | "available" | "empty")}
            className="text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="all">Semua Status</option>
            <option value="available">Tersedia (Stok &gt; 0)</option>
            <option value="empty">Stok Habis</option>
          </select>

          <button
            onClick={fetchProducts}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-xl border border-gray-200 hover:bg-gray-50 transition ml-auto sm:ml-0"
            title="Refresh Data"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin text-blue-500" />
          <span className="text-sm">Memuat katalog produk...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-12 text-center text-gray-400 space-y-2">
          <ShoppingBag size={36} className="mx-auto text-gray-300" />
          <p className="text-sm font-semibold text-slate-700">Belum ada produk</p>
          <p className="text-xs text-gray-400">Tidak ada produk PMT yang sesuai dengan pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-gray-200/80 rounded-2xl shadow-xs hover:shadow-md transition overflow-hidden flex flex-col group"
            >
              {/* Product Thumbnail */}
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-slate-50">
                    <Package size={40} />
                    <span className="text-[10px] mt-1">Foto Belum Ada</span>
                  </div>
                )}

                {/* Stock Badge */}
                <div className="absolute top-3 left-3">
                  {p.stock > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs border border-emerald-200">
                      <CheckCircle size={12} className="text-emerald-500" /> Tersedia ({p.stock})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs border border-rose-200">
                      <XCircle size={12} className="text-rose-500" /> Stok Habis
                    </span>
                  )}
                </div>
              </div>

              {/* Product Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-blue-600 transition">
                    {p.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {p.description || "Makanan tambahan gizi sehat Posyandu Aster."}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-medium text-gray-400 block">Harga</span>
                    <span className="text-sm font-extrabold text-blue-600 font-mono">
                      {formatRupiah(p.price)}
                    </span>
                  </div>

                  {/* Officers Action Buttons */}
                  {isOfficer && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Edit Produk"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus Produk"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal CRUD */}
      {isOfficer && (
        <ProdukModalForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchProducts}
          editingProduct={editingProduct}
        />
      )}
    </div>
  );
}
