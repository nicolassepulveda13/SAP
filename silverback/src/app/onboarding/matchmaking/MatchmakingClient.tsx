"use client";

import { useActionState } from "react";
import { Users, Lock } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { joinClan, type ClanDisponible } from "@/app/actions/onboarding";

export default function MatchmakingClient({ clanes }: { clanes: ClanDisponible[] }) {
  const [state, action, pending] = useActionState(joinClan, undefined);

  return (
    <div className="w-full max-w-lg">
      <PageLabel page="P3" />
      <h2 className="font-heading font-bold text-5xl text-[#F97316] uppercase tracking-wider mb-2">
        RADAR DE MANADAS
      </h2>
      <p className="text-[#9CA3AF] mb-6">Encuentra tu manada. Domina la arena.</p>

      {clanes.length === 0 ? (
        <p className="text-[#9CA3AF] text-sm text-center py-8">
          No hay clanes disponibles por ahora. Volvé más tarde.
        </p>
      ) : (
        <div className="space-y-2 mb-6">
          {clanes.map((clan) => {
            const lleno = clan.cantidadMiembros >= clan.capacidadMaxima;
            return (
              <form key={clan.id} action={action}>
                <input type="hidden" name="clanId" value={clan.id} />
                <div className="bg-[#242424] border border-[#333] rounded-lg p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#2e2e2e] flex items-center justify-center shrink-0">
                    <span className="text-lg">🦍</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-heading font-bold text-sm text-white uppercase">{clan.nombre}</p>
                    {lleno ? (
                      <p className="text-xs text-[#F97316] flex items-center gap-1">
                        <Lock size={10} /> {clan.cantidadMiembros}/{clan.capacidadMaxima} LLENO
                      </p>
                    ) : (
                      <p className="text-xs text-[#9CA3AF] flex items-center gap-1">
                        <Users size={10} /> {clan.cantidadMiembros}/{clan.capacidadMaxima} Miembros
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={lleno || pending}
                    className={`px-4 py-1.5 text-xs font-heading font-bold uppercase tracking-wider rounded transition-colors ${
                      lleno
                        ? "border border-[#555] text-[#555] cursor-not-allowed"
                        : "bg-[#F97316] hover:bg-[#EA6800] disabled:opacity-50 text-white"
                    }`}
                  >
                    {lleno ? "LLENO" : pending ? "..." : "UNIRSE"}
                  </button>
                </div>
              </form>
            );
          })}
        </div>
      )}

      {state?.error && (
        <p className="text-red-400 text-xs text-center mb-4">{state.error}</p>
      )}

      <div className="flex justify-center gap-2 mt-4">
        <div className="w-6 h-1 bg-[#444] rounded-full" />
        <div className="w-6 h-1 bg-[#444] rounded-full" />
        <div className="w-6 h-1 bg-[#F97316] rounded-full" />
      </div>
    </div>
  );
}
