// S1-Infraestructura: middleware de Next.js — corre en el Edge antes de cada request
// S2-Auth: ampliado para leer claims del JWT y redirigir según estado de onboarding
// S3-Landing: cambiada la landing de /login a /onboarding/biometrics
import { NextRequest, NextResponse } from "next/server";

// S1-Infraestructura: rutas que no requieren autenticación
const PUBLIC_ROUTES = ["/login", "/onboarding", "/api/"];

// S2-Auth: decodifica el payload del JWT sin verificar la firma (solo para leer claims en el edge)
// El backend .NET es el único que verifica la firma — aquí solo leemos onboarding_completado, rol, clanId
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

  // S3-Landing: sin token → siempre al onboarding (antes redirigía a /login)
  if (!hasToken && !isPublic) {
    return NextResponse.redirect(new URL("/onboarding/biometrics", request.url));
  }

  if (hasToken) {
    // S2-Auth: leer claim onboarding_completado del JWT para decidir flujo
    const payload = decodeJwtPayload(token!);
    const completado = payload?.onboarding_completado === "true";

    // S2-Auth: usuario logueado que intenta ir a /login → ya tiene sesión, mandarlo al santuario
    if (pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/santuario", request.url));
    }
    // S3-CrearClan: onboarding completo intentando volver al onboarding → santuario
    if (completado && isOnboarding) {
      return NextResponse.redirect(new URL("/santuario", request.url));
    }
    // S2-Auth: onboarding incompleto intentando acceder a rutas protegidas → forzar onboarding
    if (!completado && !isPublic) {
      return NextResponse.redirect(new URL("/onboarding/biometrics", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
