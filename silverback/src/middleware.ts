import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/onboarding", "/api/"];
const AUTH_ROUTES = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const hasToken = Boolean(request.cookies.get("sb_token")?.value);

  if (!hasToken && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (hasToken && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/santuario", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
