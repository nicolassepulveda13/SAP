import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDesafios, getPanelClan } from "@/app/actions/santuario";
import ForjaClient from "./ForjaClient";

function decodeJwtPayload(token: string): Record<string, string> | null {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

export default async function ChallengeForgePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sb_token")?.value;
  if (!token) redirect("/login");

  const payload = decodeJwtPayload(token);
  const clanId = payload?.clanId;
  if (!clanId) redirect("/santuario");

  const [desafios, panel] = await Promise.all([
    getDesafios(clanId),
    getPanelClan(clanId),
  ]);

  return <ForjaClient clanId={clanId} panel={panel} desafios={desafios} />;
}
