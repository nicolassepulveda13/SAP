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
};

export type EntrenamientoHistorial = {
  id: string;
  ejercicio: string;
  pesoKg: number;
  repeticiones: number;
  puntajeCer: number;
  fechaHora: string;
};

export type GuerraDto = {
  id: string;
  semana: string;
  estado: string;
  fechaFin: string;
  participaciones: { clanId: string; cerAcumulado: number; posicion: number }[];
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
    revalidatePath("/arena/historial");
    revalidatePath("/santuario");
    return { resultado };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Error al registrar el entrenamiento." };
  }
}

// S4-Arena: getHistorial — GET /api/arena/historial?pagina=N (paginado, 20 por página)
export async function getHistorial(pagina = 1): Promise<EntrenamientoHistorial[]> {
  try {
    return await apiFetch<EntrenamientoHistorial[]>(`/api/arena/historial?pagina=${pagina}`, {
      cache: "no-store",
    });
  } catch {
    return [];
  }
}

// S4-Arena: getGuerra — GET /api/arena/guerra — retorna null si no hay guerra activa
export async function getGuerra(): Promise<GuerraDto | null> {
  try {
    return await apiFetch<GuerraDto>("/api/arena/guerra", { cache: "no-store" });
  } catch {
    return null;
  }
}
