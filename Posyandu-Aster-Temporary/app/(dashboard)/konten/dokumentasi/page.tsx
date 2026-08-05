import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import DokumentasiManagementView from "@/components/konten/DokumentasiManagementView";

export const metadata = {
  title: "Dokumentasi Kegiatan | Posyandu Aster",
  description: "Galeri foto dan video pelaksanaan kegiatan Posyandu Aster.",
};

export default async function DokumentasiPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <DokumentasiManagementView user={session} />;
}
