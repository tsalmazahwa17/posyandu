import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import ArsipManagementView from "@/components/konten/ArsipManagementView";

export const metadata = {
  title: "Arsip Digital & SOP | Posyandu Aster",
  description: "Pusat dokumen resmi, SOP pelayanan kesehatan, proposal, dan laporan kegiatan Posyandu Aster.",
};

export default async function ArsipPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <ArsipManagementView user={session} />;
}
