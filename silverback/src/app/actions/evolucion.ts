// S7-Evolucion: Server Actions del paquete PKG_EVOLUCIÓN / BÓVEDA (CU-004-001 a 004)
// En un archivo "use server" cada export tiene que ser una función async (Next 16 rechaza arrow functions sin async)
"use server";

import { apiFetch } from "@/lib/api-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type Progreso = {
  miembro: { id: string; nombre: string; rango: string; arquetipo?: string; xp: number; coins: number; llavesAcero: number };
  nivel: number;
  xpParaSiguienteRango: number;
  rangoSiguiente?: string | null;
  rangos: { rango: string; xpMinima: number }[];
  atributos: { fuerza: number; agilidad: number; resistencia: number };
};

export type NodoArbol = {
  id: string;
  nombre: string;
  descripcion: string;
  nivel: number;
  nivelMaximo: number;
  bloqueado: boolean;
  prerequisitosFaltantes: string[];
  prerequisitos: string[];
  costoSiguienteNivel?: number | null;
  efectoActual?: string | null;
  efectoSiguiente?: string | null;
};

export type Arbol = {
  puntosClan: number;
  nodos: NodoArbol[];
  ultimasInversiones: { nodo: string; nivelAlcanzado: number; costo: number; miembro: string; invertidoEn: string }[];
};

export type CofreDTO = {
  id: string;
  rareza: string;
  nombre: string;
  contenido: string;
  llavesRequeridas: number;
  bloqueado: boolean;
  evento: boolean;
  obtendioEn: string;
};

export type Boveda = {
  totalCajas: number;
  listos: number;
  multiplicadorXp: number;
  proximoBotinUtc: string;
  llavesAcero: number;
  cofres: CofreDTO[];
};

export type ItemDTO = {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  rareza: string;
  precio: number;
  imagenUrl?: string | null;
};

export async function getProgreso() {
  return apiFetch<Progreso>("/api/evolucion/progreso", { cache: "no-store" });
}

export async function getArbol() {
  return apiFetch<Arbol>("/api/evolucion/arbol", { cache: "no-store" });
}

export async function getBoveda() {
  return apiFetch<Boveda>("/api/evolucion/boveda", { cache: "no-store" });
}

export async function getItems(categoria?: string) {
  return apiFetch<ItemDTO[]>(`/api/evolucion/items${categoria ? `?categoria=${categoria}` : ""}`, {
    cache: "no-store",
  });
}

// CU-004-002: invierte Puntos de Clan en un nodo del árbol colectivo
export async function mejorarNodo(nodoId: string): Promise<{ error?: string; nivel?: number }> {
  try {
    const r = await apiFetch<{ nivelAlcanzado: number }>("/api/evolucion/nodos/mejorar", {
      method: "POST",
      body: JSON.stringify({ nodoId }),
    });
    revalidatePath("/evolucion/habilidades");
    return { nivel: r.nivelAlcanzado };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo mejorar el nodo." };
  }
}

// CU-004-003: abre el cofre y acredita SilverBack Coins + XP (× multiplicador del día)
export async function reclamarCofre(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string }> {
  const cofreId = formData.get("cofreId") as string;
  if (!cofreId) return { error: "Cofre inválido." };
  let r: { cofre: string; coins: number; xp: number };
  try {
    r = await apiFetch(`/api/evolucion/cofres/${cofreId}/reclamar`, { method: "POST" });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo reclamar el cofre." };
  }
  revalidatePath("/evolucion/botin");
  revalidatePath("/evolucion/tienda");
  revalidatePath("/evolucion");
  // Paso 12: la Bóveda muestra lo que se acreditó al abrir el cofre
  redirect(`/evolucion/botin?abierto=${encodeURIComponent(r.cofre)}&coins=${r.coins}&xp=${r.xp}`);
}

// CU-004-004: compra confirmada desde el modal
export async function comprarItem(itemId: string): Promise<{ error?: string }> {
  if (!itemId) return { error: "Ítem inválido." };
  try {
    await apiFetch("/api/evolucion/items/comprar", { method: "POST", body: JSON.stringify({ itemId }) });
    revalidatePath("/evolucion/tienda");
    revalidatePath("/evolucion");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo comprar el ítem." };
  }
}
