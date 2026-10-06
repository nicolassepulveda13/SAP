// S2-Onboarding: RadarManadasPage (CU-001-003/004/005) — lista clanes con cupo, unirse o fundar
// S6-Fix: también lo usan cuentas existentes sin clan (expulsados). Si el usuario ya tiene clan, al Santuario.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getClanesDisponibles } from "@/app/actions/onboarding";
import { apiFetch } from "@/lib/api-client";
import MatchmakingClient from "./MatchmakingClient";

export default async function MatchmakingPage() {
  if ((await cookies()).get("sb_token")?.value) {
    let tieneClan = false;
    try {
      const d = await apiFetch<{ clan: { id: string } | null }>("/api/perfil/dashboard");
      tieneClan = d.clan != null; // la API omite los null (WhenWritingNull): "sin clan" llega como undefined
    } catch {
      // token inválido o vencido: se sigue con el radar; unirse fallará con el mensaje de la API
    }
    if (tieneClan) redirect("/santuario");
  }

  const clanes = await getClanesDisponibles();
  return <MatchmakingClient clanes={clanes} />;
}
