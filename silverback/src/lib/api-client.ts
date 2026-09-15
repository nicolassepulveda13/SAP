// S1-Infraestructura: cliente HTTP centralizado para todas las llamadas a la API .NET
// Corre SOLO en el servidor (server-only). Agrega automáticamente el JWT desde la cookie sb_token.
// Todos los Server Actions y Server Components deben usar apiFetch en lugar de fetch directo.
import "server-only";
import { cookies } from "next/headers";

const API_BASE = process.env.API_URL ?? "http://localhost:5057";

// S1-Infraestructura: apiFetch<T> — wrapper genérico tipado sobre fetch.
// Lee la cookie sb_token y la inyecta como "Authorization: Bearer <token>" en cada request.
// Lanza Error con el mensaje del backend si la respuesta no es OK.
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // S1-Infraestructura: leer token de la cookie HTTP-only (no accesible desde el cliente)
  const cookieStore = await cookies();
  const token = cookieStore.get("sb_token")?.value;

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      // S1-Infraestructura: inyección automática del Bearer JWT si existe
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    // S1-Infraestructura: propagar el campo "error" del JSON del backend como mensaje de error
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }

  return res.json() as Promise<T>;
}
