import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import AbsensiMasyarakatView from "@/components/absensi/AbsensiMasyarakatView";
import AbsensiKaderView from "@/components/absensi/AbsensiKaderView";

export const metadata = {
  title: "Absensi Posyandu | Posyandu Aster",
  description: "Kelola kehadiran dan sesi Posyandu Aster secara digital.",
};

export default async function AbsensiPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role === "MASYARAKAT") {
    return <AbsensiMasyarakatView user={session} />;
  }

  // ADMIN & KADER: manajemen sesi + absensi manual
  return <AbsensiKaderView user={session} />;
}
