// S4-Arena: Server Actions del módulo Arena — registrar entrenamiento, historial, guerra
// registrarEntrenamiento: llamado desde RegistrarClient via useActionState (CU-003-002)
// El backend calcula el CER (CU-003-003) con fórmula: pesoKg × repeticiones × modificador(arquetipo)
"use server";

import { apiFetch } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export type ResultadoCER = {
  puntaje: number;
  modificador: number;
  descripcion: string;
  xpGanado: number;
};

export type EntrenamientoHistorial = {
  id: string;
  ejercicio: string;
  pesoKg: number;
  repeticiones: number;
  puntajeCer: number;
  fechaHora: string;
};

// S6-Guerra: GET /api/arena/guerra
export type ClanEnGuerra = {
  clanId: string;
  nombre: string;
  cer: number;
  posicion: number;
  progreso: number; // % respecto del líder del ranking
};

export type GuerraDto = {
  id: string;
  semana: string;
  fechaInicio: string;
  fechaFin: string;
  diasRestantes: number;
  nuestro: ClanEnGuerra | null; // null si el clan todavía no sumó CER esta semana
  rival: ClanEnGuerra | null;   // null = SIN RIVAL ASIGNADO
  ranking: ClanEnGuerra[];      // top 10
  totalClanes: number;
};

// S6-Batallas: GET /api/arena/batallas
export type Batalla = {
  guerraId: string;
  semana: string;
  fechaFin: string;
  nuestroCer: number;
  nuestraPosicion: number;
  rival: string | null;
  rivalCer: number | null;
  resultado: "VICTORIA" | "DERROTA" | "SIN_RIVAL";
};

export type HistorialBatallas = {
  totalEnfrentamientos: number;
  victorias: number;
  tasaVictoria: number;
  rachaActual: number;
  batallas: Batalla[];
};

// S4-Arena: registrarEntrenamiento — POST /api/arena/entrenar
// El backend acumula el CER al clan y actualiza la racha del miembro
export async function registrarEntrenamiento(
  _: unknown,
  formData: FormData
): Promise<{ error?: string; resultado?: ResultadoCER }> {
  const ejercicio = (formData.get("ejercicio") as string)?.trim();
  const pesoKg = Number(formData.get("pesoKg"));
  const repeticiones = Number(formData.get("repeticiones"));

  if (!ejercicio) return { error: "Ingresá el nombre del ejercicio." };
  if (pesoKg <= 0) return { error: "El peso debe ser mayor a 0." };
  if (repeticiones < 1) return { error: "Las repeticiones deben ser al menos 1." };

  try {
    const resultado = await apiFetch<ResultadoCER>("/api/arena/entrenar", {
      method: "POST",
      body: JSON.stringify({ ejercicio, pesoKg, repeticiones }),
    });
    revalidatePath("/arena");
    revalidatePath("/arena/historial");
    revalidatePath("/santuario");
    return { resultado };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Error al registrar el entrenamiento." };
  }
}

// S4-Arena: getHistorial — GET /api/arena/historial?pagina=N (paginado, 20 por página)
// S6: filtro opcional por ejercicio
export async function getHistorial(pagina = 1, ejercicio?: string): Promise<EntrenamientoHistorial[]> {
  const filtro = ejercicio ? `&ejercicio=${encodeURIComponent(ejercicio)}` : "";
  try {
    return await apiFetch<EntrenamientoHistorial[]>(`/api/arena/historial?pagina=${pagina}${filtro}`, {
      cache: "no-store",
    });
  } catch {
    return [];
  }
}

// S6-Guerra: getGuerra — la API abre la guerra de la semana si no existe; null solo si falla la llamada
export async function getGuerra(): Promise<GuerraDto | null> {
  try {
    return await apiFetch<GuerraDto>("/api/arena/guerra", { cache: "no-store" });
  } catch {
    return null;
  }
}

// S6-Batallas: getBatallas — historial de semanas cerradas del clan
export async function getBatallas(): Promise<HistorialBatallas | null> {
  try {
    return await apiFetch<HistorialBatallas>("/api/arena/batallas", { cache: "no-store" });
  } catch {
    return null;
  }
}
