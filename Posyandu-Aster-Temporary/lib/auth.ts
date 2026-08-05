import { prisma } from "@/lib/prisma";
import { getSession, type SessionPayload } from "@/lib/session";

export async function getAuthenticatedSession(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      visitorId: true,
    },
  });

  if (!user?.isActive) return null;

  return {
    ...session,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
    visitorId: user.visitorId,
  };
}
