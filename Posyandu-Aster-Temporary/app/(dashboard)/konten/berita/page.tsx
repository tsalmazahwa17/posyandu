import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import BeritaManagementView from "@/components/konten/BeritaManagementView";

export const metadata = {
  title: "Berita & Pengumuman | Posyandu Aster",
  description: "Daftar berita, pengumuman resmi, dan materi edukasi kesehatan Posyandu Aster.",
};

export default async function BeritaPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <BeritaManagementView user={session} />;
}
