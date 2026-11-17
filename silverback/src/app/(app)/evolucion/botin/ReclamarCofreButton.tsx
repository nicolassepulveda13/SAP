// S7-Evolucion: Client Component — reclama el cofre (la acción vuelve a la Bóveda con lo acreditado)
"use client";

import { useActionState } from "react";
import { reclamarCofre } from "@/app/actions/evolucion";

export function ReclamarCofreButton({ cofreId, etiqueta, disabled }: { cofreId: string; etiqueta: string; disabled?: boolean }) {
  const [state, action, pending] = useActionState(reclamarCofre, undefined);

  return (
    <form action={action}>
      <input type="hidden" name="cofreId" value={cofreId} />
      <button
        type="submit"
        disabled={pending || disabled}
        className="w-full bg-[#F97316] hover:bg-[#EA6800] disabled:bg-[#555] disabled:cursor-not-allowed text-white font-heading font-bold uppercase tracking-wider py-2.5 rounded text-sm transition-colors"
      >
        {pending ? "RECLAMANDO..." : etiqueta}
      </button>
      {state?.error && <p className="text-red-400 text-xs mt-2">{state.error}</p>}
    </form>
  );
}
