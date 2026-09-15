// S1-Infraestructura: gestión de sesión via cookie HTTP-only "sb_token"
// Corre SOLO en el servidor. El token es un JWT firmado por el backend .NET.
// maxAge = 7 días. En producción la cookie es Secure (HTTPS only).
import "server-only";
import { cookies } from "next/headers";

const COOKIE_NAME = "sb_token";

// S1-Infraestructura: leer el JWT de la sesión activa
export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

// S1-Infraestructura: persistir el JWT tras login o completar onboarding
// S3-CrearClan: llamado desde crearClan() y joinClan() en onboarding.ts con el token definitivo
export async function setToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: "/",
  });
}

// S1-Infraestructura: destruir sesión (logout)
export async function deleteToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
