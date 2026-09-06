import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/onboarding", "/api/"];
const AUTH_ROUTES = ["/login"];

function decodeJwtPayload(token: string): Record<string, string> | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const token = request.cookies.get("sb_token")?.value;
  const hasToken = Boolean(token);

  if (!hasToken && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (hasToken && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/santuario", request.url));
  }

  if (hasToken && !isPublic) {
    const payload = decodeJwtPayload(token!);
    if (payload?.onboarding_completado !== "true") {
      return NextResponse.redirect(new URL("/onboarding/biometrics", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
