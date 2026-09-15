"use client";

import { useActionState, useState } from "react";
import { aceptarDesafio, crearDesafio, type DesafioClan, type PanelClan } from "@/app/actions/santuario";
import { ArrowLeft, Plus, Flame } from "lucide-react";
import Link from "next/link";
import { PageLabel } from "@/components/ui/PageLabel";

const TIER_COLORS: Record<string, string> = {
  TITAN: "#F97316",
  ALPHA: "#a78bfa",
  BETA: "#60a5fa",
};

function tierColor(tier: string): string {
  return TIER_COLORS[tier] ?? "#9CA3AF";
}

function tierLabel(tier: string): string {
  return `${tier} TIER`;
}

export default function ForjaClient({
  clanId,
  panel,
  desafios,
  esSilverback,
}: {
  clanId: string;
  panel: PanelClan;
  desafios: DesafioClan[];
  esSilverback: boolean;
}) {
  const [aceptarState, aceptarAction, aceptarPending] = useActionState(aceptarDesafio, undefined);
  const [crearState, crearAction, crearPending] = useActionState(crearDesafio, undefined);
  const [mostrarCrear, setMostrarCrear] = useState(false);

  return (
    <div>
      <PageLabel page="P5" />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/santuario" className="text-[#9CA3AF] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-heading font-bold text-3xl text-[#F97316] uppercase tracking-wider">
            ARENA DESAFÍOS
          </h1>
        </div>
        <span className="text-xs text-[#9CA3AF] bg-[#2e2e2e] px-3 py-1 rounded font-heading uppercase tracking-wider">
          RANGO DEL CLAN: #{panel.posicionRanking}
        </span>
      </div>

      <div className="mb-6">
        <h2 className="font-heading font-bold text-xl text-white uppercase mb-1 border-l-2 border-[#F97316] pl-3">
          DIRECTIVAS SEMANALES
        </h2>
        <p className="text-sm text-[#9CA3AF] pl-3">
          Completa estos protocolos para ganar reputación en el clan.
        </p>
      </div>

      {/* Formulario crear desafío — solo Silverback */}
      {esSilverback && (
        <div className="border border-[#333] rounded-lg overflow-hidden mb-6">
          <button
            type="button"
            onClick={() => setMostrarCrear((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-[#9CA3AF] hover:text-white hover:bg-[#242424] transition-colors"
          >
            <span className="flex items-center gap-2 font-heading uppercase tracking-wider text-[#F97316]">
              <Flame size={14} /> Publicar nueva directiva
            </span>
            <span className="text-xs">{mostrarCrear ? "▲" : "▼"}</span>
          </button>

          {mostrarCrear && (
            <form action={crearAction} className="px-4 pb-4 pt-2 bg-[#1a1a1a] space-y-3">
              <input type="hidden" name="clanId" value={clanId} />

              <div>
                <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-1">DESCRIPCIÓN</label>
                <input
                  name="descripcion"
                  type="text"
                  required
                  maxLength={200}
                  placeholder="Ej: Levantá 3.000 kg acumulados esta semana"
                  disabled={crearPending}
                  className="w-full rounded bg-[#242424] border border-[#333] px-3 py-2 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#F97316] disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-1">TIER</label>
                  <select
                    name="tier"
                    required
                    defaultValue=""
                    disabled={crearPending}
                    className="w-full rounded bg-[#242424] border border-[#333] px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F97316] disabled:opacity-50"
                  >
                    <option value="" disabled>Tier</option>
                    <option value="TITAN">TITAN</option>
                    <option value="ALPHA">ALPHA</option>
                    <option value="BETA">BETA</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-1">XP RECOMPENSA</label>
                  <input
                    name="recompensaXp"
                    type="number"
                    required
                    min={1}
                    max={10000}
                    placeholder="500"
                    disabled={crearPending}
                    className="w-full rounded bg-[#242424] border border-[#333] px-3 py-2 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#F97316] disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-1">EXPIRA</label>
                  <input
                    name="fechaExpiracion"
                    type="date"
                    required
                    disabled={crearPending}
                    className="w-full rounded bg-[#242424] border border-[#333] px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F97316] disabled:opacity-50"
                  />
                </div>
              </div>

              {crearState?.error && (
                <p className="text-red-400 text-xs">{crearState.error}</p>
              )}

              <button
                type="submit"
                disabled={crearPending}
                className="w-full bg-[#F97316] hover:bg-[#EA6800] disabled:opacity-50 text-white font-heading font-bold uppercase text-xs tracking-wider py-2 rounded transition-colors"
              >
                {crearPending ? "PUBLICANDO..." : "PUBLICAR DIRECTIVA"}
              </button>
            </form>
          )}
        </div>
      )}

      {aceptarState?.error && (
        <p className="text-red-400 text-xs mb-4">{aceptarState.error}</p>
      )}

      {desafios.length === 0 ? (
        <p className="text-[#9CA3AF] text-sm text-center py-12">
          No hay desafíos activos en este momento.
        </p>
      ) : (
        <div className="space-y-4">
          {desafios.map((d) => (
            <div
              key={d.id}
              className={`bg-[#242424] border border-[#333] rounded-xl overflow-hidden flex ${d.aceptadoPorMi ? "opacity-70" : ""}`}
            >
              <div className="w-36 bg-[#1a1a1a] flex items-center justify-center shrink-0 relative">
                <span className="text-5xl">{d.aceptadoPorMi ? "💪" : "🏋️"}</span>
                <span
                  className="absolute top-2 left-2 text-xs font-heading font-bold uppercase px-2 py-0.5 rounded"
                  style={{ backgroundColor: tierColor(d.tier), color: "white" }}
                >
                  {tierLabel(d.tier)}
                </span>
              </div>
              <div className="flex-1 p-5">
                <h3
                  className={`font-heading font-bold text-lg uppercase mb-1 ${d.aceptadoPorMi ? "line-through text-[#9CA3AF]" : "text-white"}`}
                >
                  {d.descripcion}
                </h3>
                <p className="text-xs text-[#9CA3AF] mb-3">
                  Recompensa: {d.recompensaXp} XP · Expira:{" "}
                  {new Date(d.fechaExpiracion).toLocaleDateString("es-AR")}
                </p>
                <div className="flex justify-end">
                  {d.aceptadoPorMi ? (
                    <span className="border border-[#555] text-[#9CA3AF] font-heading font-bold uppercase text-xs px-4 py-2 rounded tracking-wider">
                      PROTOCOLO ASEGURADO
                    </span>
                  ) : (
                    <form action={aceptarAction}>
                      <input type="hidden" name="clanId" value={clanId} />
                      <input type="hidden" name="desafioId" value={d.id} />
                      <button
                        type="submit"
                        disabled={aceptarPending}
                        className="bg-[#F97316] hover:bg-[#EA6800] disabled:opacity-50 text-white font-heading font-bold uppercase text-xs px-4 py-2 rounded tracking-wider transition-colors"
                      >
                        {aceptarPending ? "..." : "ACEPTAR DESAFÍO"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
