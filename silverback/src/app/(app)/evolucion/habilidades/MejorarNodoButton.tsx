// S7-Evolucion: Client Component — invoca mejorarNodo con feedback inline
"use client";

import { useActionState } from "react";
import { TrendingUp } from "lucide-react";
import { mejorarNodo } from "@/app/actions/evolucion";

export function MejorarNodoButton({ nodoId, disabled, nombre }: {
  nodoId: string;
  disabled: boolean;
  nombre: string;
}) {
  const [state, action, pending] = useActionState(mejorarNodo, undefined);

  return (
    <form action={action}>
      <input type="hidden" name="nodoId" value={nodoId} />
      <button
        type="submit"
        disabled={disabled || pending}
        title={`Invertir XP en ${nombre}`}
        className="bg-[#F97316] hover:bg-[#EA6800] disabled:bg-[#555] disabled:cursor-not-allowed text-white font-heading font-bold uppercase text-xs tracking-wider px-3 py-1.5 rounded flex items-center gap-1"
      >
        <TrendingUp size={12} /> {pending ? "..." : "MEJORAR"}
      </button>
      {state?.error && <p className="text-red-400 text-xs mt-2">{state.error}</p>}
    </form>
  );
}
