// S8-Perfil: Client Component — invoca salvarRacha con feedback
"use client";

import { useActionState } from "react";
import { Shield } from "lucide-react";
import { salvarRacha } from "@/app/actions/perfil";

export function SalvarRachaButton({ clanId, disabled }: { clanId: string; disabled: boolean }) {
  const [state, action, pending] = useActionState(salvarRacha, undefined);

  return (
    <form action={action}>
      <input type="hidden" name="clanId" value={clanId} />
      <button
        type="submit"
        disabled={disabled || pending}
        className="bg-[#F97316] hover:bg-[#EA6800] disabled:bg-[#555] disabled:cursor-not-allowed text-white font-heading font-bold uppercase tracking-wider px-6 py-3 rounded flex items-center gap-2 mx-auto"
      >
        <Shield size={16} /> {pending ? "SALVANDO..." : "SALVAR RACHA"}
      </button>
      {state?.error && <p className="text-red-400 text-xs mt-3">{state.error}</p>}
    </form>
  );
}
