import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/absensi",
  "/monitoring",
  "/sasaran",
  "/konten",
  "/user",
];
const CHANGE_PASSWORD_ROUTE = "/change-password";

const matches = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const protectedRoute = PROTECTED_ROUTES.some((route) => matches(pathname, route));
  const loginRoute = matches(pathname, "/login");
  const passwordRoute = matches(pathname, CHANGE_PASSWORD_ROUTE);
  const session = await getSessionFromRequest(request);

  if ((protectedRoute || passwordRoute) && !session) {
    const url = new URL("/login", request.url);
    if (protectedRoute) {
      url.searchParams.set("callbackUrl", `${pathname}${search}`);
    }
    return NextResponse.redirect(url);
  }

  if (session?.mustChangePassword && !passwordRoute && (protectedRoute || loginRoute)) {
    return NextResponse.redirect(new URL(CHANGE_PASSWORD_ROUTE, request.url));
  }

  if (passwordRoute && session && !session.mustChangePassword) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (loginRoute && session && !session.mustChangePassword) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (session && protectedRoute) {
    if (
      ["/sasaran", "/monitoring"].some((route) => matches(pathname, route)) &&
      session.role === "MASYARAKAT"
    ) {
      return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
    }
    if (matches(pathname, "/user") && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
