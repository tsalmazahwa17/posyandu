import { redirect } from "next/navigation";
import { ShieldAlert, Shield } from "lucide-react";
import { getAuthenticatedSession } from "@/lib/auth";
import type { SessionPayload } from "@/lib/session";
import ChangePasswordForm from "@/components/forms/ChangePasswordForm";

export const metadata = {
  title: "Ganti Kata Sandi | Posyandu Aster",
  description: "Wajib ganti kata sandi sebelum melanjutkan.",
};

export default async function ChangePasswordPage() {
  let session: SessionPayload | null;
  try {
    session = await getAuthenticatedSession();
  } catch (error) {
    console.error("Change password session validation error:", error);
    redirect("/logout");
  }

  if (!session) {
    redirect("/logout");
  }

  if (!session.mustChangePassword) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
            <div className="mb-7">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Ganti Kata Sandi
              </h2>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                Demi keamanan akun, Anda wajib mengganti kata sandi sementara
                yang diberikan administrator sebelum melanjutkan ke dasbor.
              </p>
            </div>

            <ChangePasswordForm />
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Shield className="w-3 h-3" />
            <span>Sesi masuk menggunakan cookie HTTP-only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
