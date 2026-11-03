// S7-Evolucion: Server Actions del paquete PKG_EVOLUCIÓN / BÓVEDA (CU-004-001 a 004)
"use server";

import { apiFetch } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export type Progreso = {
  miembro: { id: string; nombre: string; rango: string; arquetipo?: string; xp: number; coins: number };
  xpParaSiguienteRango: number | null;
};

export type NodoDTO = {
  id: string;
  nombre: string;
  descripcion: string;
  costoXp: number;
  prerequisitos: string[];
  invertido: boolean;
};

export type CofreDTO = {
  id: string;
  rareza: string;
  estado: string;
  obtendioEn: string;
};

export type ItemDTO = {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  imagenUrl?: string | null;
};

export const getProgreso = () =>
  apiFetch<Progreso>("/api/evolucion/progreso", { cache: "no-store" });

export const getNodos = () =>
  apiFetch<NodoDTO[]>("/api/evolucion/nodos", { cache: "no-store" });

export const getCofres = () =>
  apiFetch<CofreDTO[]>("/api/evolucion/cofres", { cache: "no-store" });

export const getItems = (categoria?: string) =>
  apiFetch<ItemDTO[]>(`/api/evolucion/items${categoria ? `?categoria=${categoria}` : ""}`, {
    cache: "no-store",
  });

// CU-004-002: invierte XP en un nodo. revalida la página para refrescar XP y estado del nodo.
export async function mejorarNodo(_: unknown, formData: FormData): Promise<{ error?: string }> {
  const nodoId = formData.get("nodoId") as string;
  if (!nodoId) return { error: "Nodo inválido." };
  try {
    await apiFetch(`/api/evolucion/nodos/mejorar`, {
      method: "POST",
      body: JSON.stringify({ nodoId }),
    });
    revalidatePath("/evolucion/habilidades");
    revalidatePath("/evolucion");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo mejorar el nodo." };
  }
}

// CU-004-003: marca el cofre como reclamado
export async function reclamarCofre(_: unknown, formData: FormData): Promise<{ error?: string }> {
  const cofreId = formData.get("cofreId") as string;
  if (!cofreId) return { error: "Cofre inválido." };
  try {
    await apiFetch(`/api/evolucion/cofres/${cofreId}/reclamar`, { method: "POST" });
    revalidatePath("/evolucion/botin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo reclamar el cofre." };
  }
}

// CU-004-004: compra un ítem con coins
export async function comprarItem(_: unknown, formData: FormData): Promise<{ error?: string }> {
  const itemId = formData.get("itemId") as string;
  if (!itemId) return { error: "Ítem inválido." };
  try {
    await apiFetch(`/api/evolucion/items/comprar`, {
      method: "POST",
      body: JSON.stringify({ itemId }),
    });
    revalidatePath("/evolucion/tienda");
    revalidatePath("/evolucion");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo comprar el ítem." };
  }
}
