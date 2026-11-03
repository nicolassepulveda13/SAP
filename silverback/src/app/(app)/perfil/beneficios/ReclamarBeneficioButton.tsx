// S8-Perfil: Client Component — invoca reclamarBeneficio y muestra el cupón generado
"use client";

import { useActionState } from "react";
import { reclamarBeneficio } from "@/app/actions/perfil";

export function ReclamarBeneficioButton({ beneficioId, yaReclamado }: {
  beneficioId: string; yaReclamado: boolean;
}) {
  const [state, action, pending] = useActionState(reclamarBeneficio, undefined);

  if (yaReclamado) {
    return (
      <p className="text-xs text-[#9CA3AF] uppercase font-heading font-bold">YA RECLAMADO</p>
    );
  }

  if (state?.cupon) {
    return (
      <div className="border border-[#F97316] rounded p-3 text-center">
        <p className="text-[10px] text-[#9CA3AF] uppercase mb-1">TU CUPÓN</p>
        <p className="font-mono font-bold text-[#F97316] text-lg tracking-wider">{state.cupon}</p>
      </div>
    );
  }

  return (
    <form action={action}>
      <input type="hidden" name="beneficioId" value={beneficioId} />
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[#F97316] hover:bg-[#EA6800] disabled:opacity-50 text-white font-heading font-bold uppercase tracking-wider py-2 rounded text-sm"
      >
        {pending ? "RECLAMANDO..." : "RECLAMAR"}
      </button>
      {state?.error && <p className="text-red-400 text-xs mt-2">{state.error}</p>}
    </form>
  );
}
