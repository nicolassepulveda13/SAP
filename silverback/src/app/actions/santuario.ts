"use server";

import { apiFetch } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export type DesafioClan = {
  id: string;
  descripcion: string;
  tier: string;
  recompensaXp: number;
  fechaExpiracion: string;
  aceptadoPorMi: boolean;
};

export type PanelClan = {
  nombre: string;
  puntosClan: number;
  cantidadMiembros: number;
  posicionRanking: number;
};

export async function getDesafios(clanId: string): Promise<DesafioClan[]> {
  return apiFetch<DesafioClan[]>(`/api/santuario/${clanId}/desafios`, { cache: "no-store" });
}

export async function getPanelClan(clanId: string): Promise<PanelClan> {
  return apiFetch<PanelClan>(`/api/santuario/${clanId}/panel`, { cache: "no-store" });
}

export async function crearDesafio(
  _: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const clanId = formData.get("clanId") as string;
  const descripcion = (formData.get("descripcion") as string)?.trim();
  const tier = formData.get("tier") as string;
  const recompensaXp = Number(formData.get("recompensaXp"));
  const fechaExpiracion = formData.get("fechaExpiracion") as string;

  if (!descripcion || !tier || !recompensaXp || !fechaExpiracion)
    return { error: "Completá todos los campos." };
  if (recompensaXp < 1 || recompensaXp > 10000)
    return { error: "La recompensa debe estar entre 1 y 10.000 XP." };

  try {
    await apiFetch(`/api/santuario/${clanId}/desafios`, {
      method: "POST",
      body: JSON.stringify({
        descripcion,
        tier,
        recompensaXp,
        fechaExpiracion: new Date(fechaExpiracion).toISOString(),
      }),
    });
    revalidatePath("/santuario/forja");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Error al publicar el desafío." };
  }
}

export async function aceptarDesafio(
  _: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const clanId = formData.get("clanId") as string;
  const desafioId = formData.get("desafioId") as string;
  try {
    await apiFetch(`/api/santuario/${clanId}/desafios/${desafioId}/aceptar`, { method: "POST" });
    revalidatePath("/santuario/forja");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Error al aceptar el desafío." };
  }
}
