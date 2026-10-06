// S3-Forja: ChallengeForgePage — Server Component, La Forja / Arena Desafíos (P5)
// S4-Fix: clanId y rol salen de requireClan() (base de datos), igual que Tácticas y Roles.
// Antes se leía payload.rol del JWT, pero .NET serializa el rol como la URI de ClaimTypes.Role,
// así que esSilverback era siempre false y el formulario de publicar (CU-002-007) no aparecía nunca.
import { getDesafios, getPanelClan } from "@/app/actions/santuario";
import { requireClan } from "@/lib/clan-context";
import ForjaClient from "./ForjaClient";

export default async function ChallengeForgePage() {
  const { data, clanId } = await requireClan();
  const esSilverback = data.miembro.rol === "SILVERBACK";

  const [desafios, panel] = await Promise.all([
    getDesafios(clanId),
    getPanelClan(clanId),
  ]);

  return <ForjaClient clanId={clanId} panel={panel} desafios={desafios} esSilverback={esSilverback} />;
}
