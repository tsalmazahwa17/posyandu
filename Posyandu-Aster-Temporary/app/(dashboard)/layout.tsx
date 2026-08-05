import { redirect } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAuthenticatedSession } from "@/lib/auth";
import type { SessionPayload } from "@/lib/session";

export default async function Layout({ children }: { children: React.ReactNode }) {
  let session: SessionPayload | null;
  try {
    session = await getAuthenticatedSession();
  } catch (error) {
    console.error("Dashboard session validation error:", error);
    redirect("/logout");
  }
  if (!session) redirect("/logout");
  if (session.mustChangePassword) redirect("/change-password");
  return <DashboardLayout user={session}>{children}</DashboardLayout>;
}
