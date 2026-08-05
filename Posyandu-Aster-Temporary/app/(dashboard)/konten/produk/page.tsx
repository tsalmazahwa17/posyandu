import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import ProdukManagementView from "@/components/konten/ProdukManagementView";

export const metadata = {
  title: "Katalog Produk PMT & UMKM | Posyandu Aster",
  description: "Kelola dan lihat katalog produk pemberian makanan tambahan serta olahan UMKM warga.",
};

export default async function ProdukPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <ProdukManagementView user={session} />;
}
