// S8-Perfil: Server Actions del paquete PKG_PERFIL (CU-005-001 a 007)
"use server";

import { apiFetch } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export type Dashboard = {
  miembro: {
    id: string; nombre: string; email: string; rol: string; rango: string;
    arquetipo?: string; xp: number; coins: number; clanId?: string | null;
  };
  estadisticas: { totalSesiones: number; cargaSemanal: number; cerPromedio: number };
  clan?: { id: string; nombre: string; puntosClan: number } | null;
};

export type Racha = { diasConsecutivos: number; estado: string; ultimoEntrenamiento?: string | null };
export type Fatiga = { cargaSemanal: number; nivelFatiga: string; actualizadoEn: string };
export type Trofeo = { id: string; nombre: string; descripcion: string; tipo: string; obtendioEn: string };
export type Beneficio = {
  id: string; aliadoId: string; titulo: string; descripcion: string;
  tipo: string; rangoMinimo: string; estado: string;
};

export const getDashboard = () => apiFetch<Dashboard>("/api/perfil/dashboard", { cache: "no-store" });
export const getRacha = () => apiFetch<Racha | null>("/api/perfil/racha", { cache: "no-store" }).catch(() => null);
export const getFatiga = () => apiFetch<Fatiga>("/api/perfil/fatiga", { cache: "no-store" });
export const getTrofeos = () => apiFetch<Trofeo[]>("/api/perfil/trofeos", { cache: "no-store" });
export const getBeneficios = () => apiFetch<Beneficio[]>("/api/perfil/beneficios", { cache: "no-store" });

// CU-005-003: Salvar Racha con Puntos de Clan
export async function salvarRacha(_: unknown, formData: FormData): Promise<{ error?: string }> {
  const clanId = formData.get("clanId") as string;
  if (!clanId) return { error: "Clan no detectado." };
  try {
    await apiFetch("/api/perfil/racha/salvar", {
      method: "POST",
      body: JSON.stringify({ clanId }),
    });
    revalidatePath("/perfil/racha");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo salvar la racha." };
  }
}

// CU-005-006: Reclamar Beneficio — devuelve cupón para mostrar al usuario
export async function reclamarBeneficio(
  _: { cupon?: string; error?: string } | undefined,
  formData: FormData
): Promise<{ cupon?: string; error?: string }> {
  const beneficioId = formData.get("beneficioId") as string;
  if (!beneficioId) return { error: "Beneficio inválido." };
  try {
    const { cupon } = await apiFetch<{ cupon: string }>("/api/perfil/beneficios/reclamar", {
      method: "POST",
      body: JSON.stringify({ beneficioId }),
    });
    revalidatePath("/perfil/beneficios");
    return { cupon };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo reclamar el beneficio." };
  }
}

// CU-005-007: Gestionar Datos de Cuenta
export async function actualizarCuenta(
  _: unknown,
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  const nombre = (formData.get("nombre") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const passwordActual = (formData.get("passwordActual") as string) || null;
  const passwordNueva = (formData.get("passwordNueva") as string) || null;
  if (!nombre || !email) return { error: "Nombre y email son obligatorios." };
  try {
    await apiFetch("/api/perfil/cuenta", {
      method: "PUT",
      body: JSON.stringify({ nombre, email, passwordActual, passwordNueva }),
    });
    revalidatePath("/perfil/cuenta");
    revalidatePath("/perfil");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo actualizar la cuenta." };
  }
}
