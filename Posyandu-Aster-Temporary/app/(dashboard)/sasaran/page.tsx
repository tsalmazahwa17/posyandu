import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import SasaranManagementView from "@/components/sasaran/SasaranManagementView";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Data Sasaran (Visitors) | Posyandu Aster",
  description: "Kelola, saring, dan pantau seluruh data kelompok target pelayanan warga secara real-time.",
};

export default async function SasaranPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // RBAC & Otorisasi: Halaman ini HANYA BISA DIAKSES oleh ADMIN & KADER
  if (session.role === "MASYARAKAT") {
    return (
      <div className="p-8 max-w-lg mx-auto mt-12 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Akses Ditolak</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Halaman Data Sasaran hanya dapat diakses oleh Petugas Posyandu (Admin & Kader). Silakan kembali ke dasbor utama Anda.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
          >
            <ArrowLeft size={14} /> Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <SasaranManagementView user={session} />;
}
