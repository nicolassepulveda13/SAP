"use client";

import { useActionState, useState } from "react";
import { Users, Lock, Plus } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { joinClan, crearClan, type ClanDisponible } from "@/app/actions/onboarding";

export default function MatchmakingClient({ clanes }: { clanes: ClanDisponible[] }) {
  const [joinState, joinAction, joinPending] = useActionState(joinClan, undefined);
  const [createState, createAction, createPending] = useActionState(crearClan, undefined);
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const pending = joinPending || createPending;

  return (
    <div className="w-full max-w-lg">
      <PageLabel page="P3" />
      <h2 className="font-heading font-bold text-5xl text-[#F97316] uppercase tracking-wider mb-2">
        RADAR DE MANADAS
      </h2>
      <p className="text-[#9CA3AF] mb-6">Encuentra tu manada. Domina la arena.</p>

      {clanes.length === 0 ? (
        <p className="text-[#9CA3AF] text-sm text-center py-6">
          No hay clanes disponibles. Creá el tuyo y liderá la manada.
        </p>
      ) : (
        <div className="space-y-2 mb-6">
          {clanes.map((clan) => {
            const lleno = clan.cantidadMiembros >= clan.capacidadMaxima;
            return (
              <form key={clan.id} action={joinAction}>
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
                    {lleno ? "LLENO" : joinPending ? "..." : "UNIRSE"}
                  </button>
                </div>
              </form>
            );
          })}
        </div>
      )}

      {joinState?.error && (
        <p className="text-red-400 text-xs text-center mb-4">{joinState.error}</p>
      )}

      {/* Crear clan */}
      <div className="border border-[#333] rounded-lg overflow-hidden mb-6">
        <button
          type="button"
          onClick={() => setMostrarCrear((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-[#9CA3AF] hover:text-white hover:bg-[#242424] transition-colors"
        >
          <span className="flex items-center gap-2 font-heading uppercase tracking-wider">
            <Plus size={14} /> Fundar mi propio clan
          </span>
          <span className="text-xs">{mostrarCrear ? "▲" : "▼"}</span>
        </button>

        {mostrarCrear && (
          <form action={createAction} className="px-4 pb-4 pt-2 bg-[#1a1a1a] space-y-3">
            <p className="text-xs text-[#9CA3AF]">
              Serás el <span className="text-[#F97316] font-bold">SILVERBACK</span> — líder de tu manada.
            </p>
            <input
              name="nombreClan"
              type="text"
              required
              maxLength={50}
              placeholder="Nombre del clan..."
              disabled={pending}
              className="w-full rounded bg-[#242424] border border-[#333] px-3 py-2 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#F97316] disabled:opacity-50"
            />
            {createState?.error && (
              <p className="text-red-400 text-xs">{createState.error}</p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="w-full bg-[#F97316] hover:bg-[#EA6800] disabled:opacity-50 text-white font-heading font-bold uppercase text-xs tracking-wider py-2 rounded transition-colors"
            >
              {createPending ? "FUNDANDO..." : "FUNDAR CLAN"}
            </button>
          </form>
        )}
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <div className="w-6 h-1 bg-[#444] rounded-full" />
        <div className="w-6 h-1 bg-[#444] rounded-full" />
        <div className="w-6 h-1 bg-[#F97316] rounded-full" />
      </div>
    </div>
  );
}
