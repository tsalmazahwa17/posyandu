"use client";

import { useState, useEffect } from "react";
import { X, Loader2, User, CreditCard, Calendar, Phone, MapPin, Tag, Heart } from "lucide-react";
import type { VisitorDTO } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingVisitor?: VisitorDTO | null;
}

export default function SasaranModalForm({
  isOpen,
  onClose,
  onSuccess,
  editingVisitor,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [nik, setNik] = useState("");
  const [categoryId, setCategoryId] = useState<number>(1);
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingVisitor) {
      setFullName(editingVisitor.fullName || "");
      setNik(editingVisitor.nik || "");
      setCategoryId(editingVisitor.categoryId || 1);
      setGender(editingVisitor.gender || "MALE");
      setBirthPlace(editingVisitor.birthPlace || "");
      setBirthDate(
        editingVisitor.birthDate
          ? new Date(editingVisitor.birthDate).toISOString().split("T")[0]
          : ""
      );
      setPhone(editingVisitor.phone || "");
      setAddress(editingVisitor.address || "");
      setIsActive(editingVisitor.isActive !== undefined ? editingVisitor.isActive : true);
    } else {
      setFullName("");
      setNik("");
      setCategoryId(1);
      setGender("MALE");
      setBirthPlace("");
      setBirthDate("");
      setPhone("");
      setAddress("");
      setIsActive(true);
    }
    setError(null);
  }, [editingVisitor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }
    if (!birthDate) {
      setError("Tanggal lahir wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        fullName: fullName.trim(),
        nik: nik.trim() ? nik.trim() : null,
        categoryId: Number(categoryId),
        gender,
        birthPlace: birthPlace.trim() ? birthPlace.trim() : null,
        birthDate,
        phone: phone.trim() ? phone.trim() : null,
        address: address.trim() ? address.trim() : null,
        ...(editingVisitor && { isActive }),
      };

      const url = editingVisitor
        ? `/api/sasaran/${editingVisitor.id}`
        : "/api/sasaran";
      const method = editingVisitor ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyimpan data sasaran.");
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
      <div className="bg-white border border-gray-200 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {editingVisitor ? "Edit Data Sasaran" : "Tambah Data Sasaran Baru"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Isi formulir data sasaran pelayanan Posyandu Aster secara akurat.
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Nama Lengkap & NIK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User size={14} className="text-blue-500" /> Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Anisa Putri"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <CreditCard size={14} className="text-blue-500" /> NIK (Nomor Induk Kependudukan)
              </label>
              <input
                type="text"
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
                placeholder="16 digit NIK"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono transition"
              />
            </div>
          </div>

          {/* Kategori & Jenis Kelamin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag size={14} className="text-blue-500" /> Kategori Sasaran <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value={1}>Balita (0-5 tahun)</option>
                <option value={2}>Ibu Hamil (Bumil)</option>
                <option value={3}>Remaja (10-19 tahun)</option>
                <option value={4}>Usia Produktif (15-49 tahun)</option>
                <option value={5}>Lanjut Usia (Lansia 60+)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Heart size={14} className="text-blue-500" /> Jenis Kelamin <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setGender("MALE")}
                  className={`py-2 text-xs font-semibold rounded-xl border transition ${
                    gender === "MALE"
                      ? "bg-blue-50 border-blue-500 text-blue-700 shadow-xs"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Laki-laki
                </button>
                <button
                  type="button"
                  onClick={() => setGender("FEMALE")}
                  className={`py-2 text-xs font-semibold rounded-xl border transition ${
                    gender === "FEMALE"
                      ? "bg-pink-50 border-pink-500 text-pink-700 shadow-xs"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Perempuan
                </button>
              </div>
            </div>
          </div>

          {/* Tempat & Tanggal Lahir */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-blue-500" /> Tempat Lahir
              </label>
              <input
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="Contoh: Banyumas"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-500" /> Tanggal Lahir <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* No HP & Alamat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone size={14} className="text-blue-500" /> No HP / WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812xxxxxxx"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-blue-500" /> Domisili / RT RW / Alamat
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Contoh: RT 02 / RW 04, Desa Aster"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Status (If Edit) */}
          {editingVisitor && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status Sasaran
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="isActive"
                    checked={isActive === true}
                    onChange={() => setIsActive(true)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  Aktif
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="isActive"
                    checked={isActive === false}
                    onChange={() => setIsActive(false)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  Nonaktif
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
              className="px-5 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-2 transition"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {editingVisitor ? "Simpan Perubahan" : "Tambah Sasaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
