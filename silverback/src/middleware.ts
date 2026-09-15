import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/onboarding", "/api/"];

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
  const isOnboarding = pathname.startsWith("/onboarding");
  const token = request.cookies.get("sb_token")?.value;
  const hasToken = Boolean(token);

  // Sin token y ruta protegida → landing = onboarding
  if (!hasToken && !isPublic) {
    return NextResponse.redirect(new URL("/onboarding/biometrics", request.url));
  }

  if (hasToken) {
    const payload = decodeJwtPayload(token!);
    const completado = payload?.onboarding_completado === "true";

    // Login con sesión activa → santuario
    if (pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/santuario", request.url));
    }
    // Onboarding completo intentando volver al onboarding → santuario
    if (completado && isOnboarding) {
      return NextResponse.redirect(new URL("/santuario", request.url));
    }
    // Onboarding incompleto en ruta protegida → volver al onboarding
    if (!completado && !isPublic) {
      return NextResponse.redirect(new URL("/onboarding/biometrics", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
