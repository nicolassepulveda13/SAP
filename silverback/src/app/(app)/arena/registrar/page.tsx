// S4-Arena: RegistrarPage — Server Component, wrapper de RegistrarClient
// Lee el arquetipo del dashboard API y lo pasa al cliente para el preview CER en vivo
// Mismo patrón que forja/page.tsx: decodificación JWT server-side, datos al Client Component
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import RegistrarClient from "./RegistrarClient";

export default async function RegistrarPage() {
  let arquetipo = "ATLETICO";
  try {
    const d = await apiFetch<{ miembro: { arquetipo: string | null } }>("/api/perfil/dashboard");
    arquetipo = d.miembro.arquetipo ?? "ATLETICO";
  } catch {
    redirect("/santuario");
  }
  return <RegistrarClient arquetipo={arquetipo} />;
}
