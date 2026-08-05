import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const COOKIE_NAME = "posyandu_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) throw new Error("JWT_SECRET wajib diatur pada environment.");
  if (secret.length < 32) throw new Error("JWT_SECRET minimal 32 karakter.");
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: number;
  email: string;
  fullName: string;
  role: "ADMIN" | "KADER" | "MASYARAKAT";
  mustChangePassword: boolean;
  visitorId: number | null;
  remember?: boolean;
}

function normalize(payload: JWTPayload): SessionPayload | null {
  if (
    typeof payload.userId !== "number" ||
    typeof payload.email !== "string" ||
    typeof payload.fullName !== "string" ||
    !["ADMIN", "KADER", "MASYARAKAT"].includes(String(payload.role)) ||
    typeof payload.mustChangePassword !== "boolean"
  ) return null;

  return {
    userId: payload.userId,
    email: payload.email,
    fullName: payload.fullName,
    role: payload.role as SessionPayload["role"],
    mustChangePassword: payload.mustChangePassword,
    visitorId: typeof payload.visitorId === "number" ? payload.visitorId : null,
    remember: payload.remember === true,
  };
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });
    return normalize(payload);
  } catch {
    return null;
  }
}

export async function setSessionCookie(
  payload: SessionPayload,
  remember: boolean = payload.remember === true
): Promise<void> {
  const completePayload = { ...payload, remember };
  const token = await createSession(completePayload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: remember ? COOKIE_MAX_AGE : undefined,
    path: "/",
  });
}

export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : null;
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : null;
}
