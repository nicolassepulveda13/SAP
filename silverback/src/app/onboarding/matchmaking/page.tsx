import { getClanesDisponibles } from "@/app/actions/onboarding";
import MatchmakingClient from "./MatchmakingClient";

export default async function MatchmakingPage() {
  const clanes = await getClanesDisponibles();
  return <MatchmakingClient clanes={clanes} />;
}
