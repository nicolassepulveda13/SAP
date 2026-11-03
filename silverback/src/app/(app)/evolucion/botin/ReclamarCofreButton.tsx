// S7-Evolucion: Client Component — invoca reclamarCofre con feedback inline
"use client";

import { useActionState } from "react";
import { reclamarCofre } from "@/app/actions/evolucion";

export function ReclamarCofreButton({ cofreId }: { cofreId: string }) {
  const [state, action, pending] = useActionState(reclamarCofre, undefined);

  return (
    <form action={action}>
      <input type="hidden" name="cofreId" value={cofreId} />
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[#F97316] hover:bg-[#EA6800] disabled:opacity-50 text-white font-heading font-bold uppercase tracking-wider py-2.5 rounded text-sm transition-colors"
      >
        {pending ? "RECLAMANDO..." : "RECLAMAR"}
      </button>
      {state?.error && <p className="text-red-400 text-xs mt-2">{state.error}</p>}
    </form>
  );
}
