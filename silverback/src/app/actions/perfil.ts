// S8-Perfil: Server Actions del paquete PKG_PERFIL (CU-005-001 a 007)
// En un archivo "use server" cada export tiene que ser una función async (Next 16 rechaza arrow functions sin async)
"use server";

import { apiFetch } from "@/lib/api-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type Dashboard = {
  miembro: {
    id: string; nombre: string; email: string; rol: string; rango: string;
    arquetipo?: string; xp: number; coins: number; clanId?: string | null;
  };
  estadisticas: { totalSesiones: number; cargaSemanal: number; cerPromedio: number };
  clan?: { id: string; nombre: string; puntosClan: number } | null;
  indiceDominancia?: number | null;
  posicionEnClan: number;
  miembrosConDatos: number;
  radar: { eje: string; usuario: number; promedioClan: number }[];
  volumen: { usuario: number; promedioClan: number; diferencial?: number | null };
  cer: { capacidad: number; eficiencia: number; recuperacion: number; rango: string };
  calculadoEn: string;
};

export type Racha = { diasConsecutivos: number; estado: string; ultimoEntrenamiento?: string | null; costoRescate: number };
export type Fatiga = {
  cargaSemanal: number; nivelFatiga: string; actualizadoEn: string;
  porcentajeCarga: number; pesoReferenciaKg: number; sincronizacionPendiente: boolean;
  tendencia: { fecha: string; cer: number; esHoy: boolean; esFuturo: boolean }[];
};
export type Trofeo = { id: string; nombre: string; descripcion: string; tipo: string; obtendioEn: string };
export type Vitrina = { victorias: number; rango: string; trofeos: Trofeo[] };
export type Beneficio = {
  id: string; aliadoId: string; aliado: string; urlAliado: string; titulo: string; descripcion: string;
  tipo: string; categoria: string; rangoMinimo: string; fechaVencimiento?: string | null; destacado: boolean;
  estado: "DISPONIBLE" | "RECLAMADO" | "BLOQUEADO" | "EXPIRADO"; codigo?: string | null;
  suscripcionHasta?: string | null;
};
export type ItemInventario = { itemId: string; nombre: string; categoria: string; rareza: string; activo: boolean; compradoEn: string };

export async function getDashboard() {
  return apiFetch<Dashboard>("/api/perfil/dashboard", { cache: "no-store" });
}
export async function getRacha() {
  return apiFetch<Racha | null>("/api/perfil/racha", { cache: "no-store" }).catch(() => null);
}
export async function getFatiga() {
  return apiFetch<Fatiga>("/api/perfil/fatiga", { cache: "no-store" });
}
export async function getVitrina() {
  return apiFetch<Vitrina>("/api/perfil/trofeos", { cache: "no-store" });
}
export async function getInventario() {
  return apiFetch<ItemInventario[]>("/api/perfil/inventario", { cache: "no-store" });
}
export async function getBeneficios() {
  return apiFetch<Beneficio[]>("/api/perfil/beneficios", { cache: "no-store" });
}

// CU-005-003: Salvar Racha con Puntos de Clan (la API usa siempre el clan del miembro). Paso 15: vuelve al Santuario.
export async function salvarRacha(): Promise<{ error?: string }> {
  try {
    await apiFetch("/api/perfil/racha/salvar", { method: "POST" });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo salvar la racha." };
  }
  revalidatePath("/perfil/racha");
  revalidatePath("/santuario");
  redirect("/santuario?racha=salvada");
}

// CU-005-003 FA-2: "DEJAR MORIR LA RACHA" → contador a 0 sin cargo
export async function dejarMorirRacha(): Promise<{ error?: string }> {
  try {
    await apiFetch("/api/perfil/racha/dejar-morir", { method: "POST" });
    revalidatePath("/perfil/racha");
    revalidatePath("/santuario");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo reiniciar la racha." };
  }
}

// CU-004-004 paso 18: activar un ítem comprado (uno por categoría)
export async function activarItem(itemId: string): Promise<{ error?: string }> {
  try {
    await apiFetch(`/api/perfil/inventario/${itemId}/activar`, { method: "POST" });
    revalidatePath("/perfil");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo activar el ítem." };
  }
}

// CU-005-006
export async function reclamarBeneficio(
  _: unknown,
  formData: FormData,
): Promise<{ cupon?: string; url?: string; error?: string }> {
  const beneficioId = formData.get("beneficioId") as string;
  if (!beneficioId) return { error: "Beneficio inválido." };
  try {
    const r = await apiFetch<{ cupon: string; url?: string }>("/api/perfil/beneficios/reclamar", {
      method: "POST",
      body: JSON.stringify({ beneficioId }),
    });
    revalidatePath("/perfil/beneficios");
    return { cupon: r.cupon, url: r.url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo reclamar el beneficio." };
  }
}

// CU-005-007 pasos 3–5: nombre y email
export async function actualizarCuenta(_: unknown, formData: FormData): Promise<{ ok?: boolean; error?: string }> {
  const nombre = ((formData.get("nombre") as string) ?? "").trim();
  const email = ((formData.get("email") as string) ?? "").trim();
  if (!nombre) return { error: "El nombre no puede estar vacío." };
  try {
    await apiFetch("/api/perfil/cuenta", { method: "PUT", body: JSON.stringify({ nombre, email }) });
    revalidatePath("/perfil/cuenta");
    revalidatePath("/perfil");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo actualizar la cuenta." };
  }
}

// CU-005-007 pasos 6–9: contraseña actual + nueva + confirmación (FA-2, FA-3)
export async function cambiarPassword(
  _: unknown,
  formData: FormData,
): Promise<{ ok?: boolean; error?: string; noCoinciden?: boolean }> {
  const passwordActual = (formData.get("passwordActual") as string) ?? "";
  const passwordNueva = (formData.get("passwordNueva") as string) ?? "";
  const passwordConfirmacion = (formData.get("passwordConfirmacion") as string) ?? "";
  if (passwordNueva !== passwordConfirmacion) {
    return { error: "Las contraseñas nuevas no coinciden.", noCoinciden: true };
  }
  try {
    await apiFetch("/api/perfil/cuenta/password", {
      method: "PUT",
      body: JSON.stringify({ passwordActual, passwordNueva, passwordConfirmacion }),
    });
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo cambiar la contraseña." };
  }
}
