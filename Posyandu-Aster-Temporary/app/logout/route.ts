import { NextResponse } from "next/server";
import { deleteSessionCookie } from "@/lib/session";

export async function GET(request: Request) {
  await deleteSessionCookie();
  return NextResponse.redirect(new URL("/login", request.url));
}
