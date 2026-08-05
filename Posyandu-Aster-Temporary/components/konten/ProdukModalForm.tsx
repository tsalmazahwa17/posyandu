"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Package, Tag, DollarSign, Layers, Image as ImageIcon, FileText } from "lucide-react";

export interface ProductItem {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  image?: string | null;
  isActive: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingProduct?: ProductItem | null;
}

export default function ProdukModalForm({
  isOpen,
  onClose,
  onSuccess,
  editingProduct,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || "");
      setDescription(editingProduct.description || "");
      setPrice(String(editingProduct.price || 0));
      setStock(String(editingProduct.stock || 0));
      setImage(editingProduct.image || "");
      setIsActive(editingProduct.isActive !== undefined ? editingProduct.isActive : true);
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setStock("0");
      setImage("");
      setIsActive(true);
    }
    setError(null);
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama produk wajib diisi.");
      return;
    }
    if (!price || Number(price) < 0) {
      setError("Harga produk harus diisi dengan angka valid.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        price: Number(price),
        stock: Number(stock) || 0,
        image: image.trim() ? image.trim() : null,
        ...(editingProduct && { isActive }),
      };

      const url = editingProduct ? `/api/produk/${editingProduct.id}` : "/api/produk";
      const method = editingProduct ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyimpan produk.");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {editingProduct ? "Edit Produk PMT / UMKM" : "Tambah Produk PMT / UMKM"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Isi rincian produk makanan tambahan/UMKM Posyandu Aster.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-gray-400 hover:text-slate-600 rounded-xl hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Package size={14} className="text-blue-500" /> Nama Produk <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Biskuit PMT Balita Gizi Super"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <DollarSign size={14} className="text-blue-500" /> Harga (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="15000"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Layers size={14} className="text-blue-500" /> Stok Ketersediaan
              </label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="25"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-blue-500" /> URL Foto Produk
            </label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText size={14} className="text-blue-500" /> Deskripsi Produk
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat kandungan gizi atau manfaat produk..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>

          {editingProduct && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status Produk
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="productIsActive"
                    checked={isActive === true}
                    onChange={() => setIsActive(true)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  Aktif Ditampilkan
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="productIsActive"
                    checked={isActive === false}
                    onChange={() => setIsActive(false)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  Disembunyikan
                </label>
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-gray-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-2 transition"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {editingProduct ? "Simpan Perubahan" : "Tambah Produk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
