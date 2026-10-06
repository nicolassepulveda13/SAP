import "server-only";
import { redirect } from "next/navigation";
import { apiFetch } from "./api-client";

export type DashboardData = {
  miembro: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    rango: string;
    xp: number;
    coins: number;
    clanId: string | null;
  };
  estadisticas: { totalSesiones: number; cargaSemanal: number; cerPromedio: number };
  clan: { id: string; nombre: string; puntosClan: number } | null;
};

export async function requireClan(): Promise<{ data: DashboardData; clanId: string }> {
  let data: DashboardData;
  try {
    data = await apiFetch<DashboardData>("/api/perfil/dashboard");
  } catch {
    redirect("/login");
  }

  if (!data.clan) redirect("/onboarding/matchmaking");

  return { data, clanId: data.clan.id };
}
