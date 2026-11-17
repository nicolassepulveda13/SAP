// S7-Evolucion: CU-004-003 — Reclamar Recompensa de la Bóveda (P14), según la carpeta:
// 4 tarjetas (cajas, listos, MULTIPLICADOR XP, PRÓXIMO), cofre básico "LISTO", cofre "BLOQUEADO" con Llaves de Acero
// y cofre "EVENTO LIMITADO". FA-1 sin llaves → botón deshabilitado + cómo conseguirlas · FA-2 contador a cero → LISTO.
import { Lock, KeyRound } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { getBoveda } from "@/app/actions/evolucion";
import { ReclamarCofreButton } from "./ReclamarCofreButton";
import { ContadorProximo } from "./ContadorProximo";

const EMOJI: Record<string, string> = { COMUN: "📦", RARO: "🎁", EPICO: "💎", LEGENDARIO: "🏆" };

export default async function BotinPage({ searchParams }: {
  searchParams: Promise<{ abierto?: string; coins?: string; xp?: string }>;
}) {
  const [b, abierto] = await Promise.all([getBoveda(), searchParams]);

  const stats = [
    { label: "CAJAS EN LA BÓVEDA", valor: b.totalCajas.toString(), testid: "stat-cajas" },
    { label: "LISTOS PARA RECLAMAR", valor: b.listos.toString(), testid: "stat-listos" },
    { label: "MULTIPLICADOR XP", valor: `x${Number(b.multiplicadorXp).toFixed(1)}`, testid: "stat-multiplicador" },
  ];

  return (
    <div>
      <PageLabel page="P14" />
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-4xl text-white uppercase">BÓVEDA</h1>
          <p className="text-sm text-[#9CA3AF]">
            Reclama tus recompensas de alto rendimiento. El esfuerzo se paga en metal y recursos.
          </p>
        </div>
        <div className="bg-[#242424] border border-[#333] rounded-xl px-5 py-3 shrink-0 flex items-center gap-2">
          <KeyRound size={16} className="text-[#F97316]" />
          <span data-testid="llaves" className="font-heading font-bold text-white">{b.llavesAcero} LLAVES DE ACERO</span>
        </div>
      </div>

      {abierto.abierto && (
        <p role="status" data-testid="cofre-abierto" className="mb-4 text-green-400 font-heading font-bold uppercase border border-green-500/40 rounded px-4 py-2">
          Abriste el COFRE {abierto.abierto}: +{abierto.coins} SB · +{abierto.xp} XP
        </p>
      )}

      <div className="grid grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#242424] border border-[#333] rounded-xl p-4">
            <p className="font-heading font-bold text-[10px] text-[#9CA3AF] uppercase">{s.label}</p>
            <p data-testid={s.testid} className="font-heading font-bold text-2xl text-[#F97316]">{s.valor}</p>
          </div>
        ))}
        <div className="bg-[#242424] border border-[#333] rounded-xl p-4">
          <p className="font-heading font-bold text-[10px] text-[#9CA3AF] uppercase">PRÓXIMO</p>
          <ContadorProximo hastaUtc={b.proximoBotinUtc} />
        </div>
      </div>

      {b.cofres.length === 0 ? (
        <div className="bg-[#242424] border border-[#333] rounded-xl p-12 text-center">
          <span className="text-5xl block mb-3">📭</span>
          <p className="text-[#9CA3AF] text-sm">No tenés cofres disponibles. Entrená hoy para desbloquear el botín diario.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {b.cofres.map((c) => {
            const borde = c.evento ? "border-[#F97316]" : c.bloqueado || c.llavesRequeridas > 0 ? "border-[#333]" : "border-[#F97316]/60";
            return (
              <div key={c.id} data-testid="cofre" className={`bg-[#242424] rounded-xl overflow-hidden border-2 ${borde}`}>
                <div className="h-40 bg-[#1a1a1a] flex items-center justify-center relative">
                  <span className={`text-7xl ${c.bloqueado ? "opacity-40" : ""}`}>{EMOJI[c.rareza] ?? "📦"}</span>
                  {c.bloqueado && <Lock size={40} className="absolute text-[#9CA3AF]" />}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-heading font-bold text-white uppercase">COFRE {c.nombre}</p>
                    {c.evento ? (
                      <span className="text-[10px] font-heading font-bold uppercase bg-pink-500 text-white px-2 py-0.5 rounded">EVENTO LIMITADO</span>
                    ) : c.bloqueado ? (
                      <span className="text-[10px] font-heading font-bold uppercase bg-[#444] text-[#9CA3AF] px-2 py-0.5 rounded">BLOQUEADO</span>
                    ) : (
                      <span className="text-[10px] font-heading font-bold uppercase bg-[#F97316] text-white px-2 py-0.5 rounded">LISTO</span>
                    )}
                  </div>
                  <p className="text-xs text-[#9CA3AF] mb-4">Contenido: {c.contenido}</p>
                  <ReclamarCofreButton
                    cofreId={c.id}
                    etiqueta={c.evento ? "RECLAMAR AHORA" : c.llavesRequeridas > 0 ? `ABRIR · ${c.llavesRequeridas} LLAVES DE ACERO` : "RECLAMAR"}
                    disabled={c.bloqueado}
                  />
                  {c.bloqueado && (
                    <p className="text-xs text-[#9CA3AF] mt-2">
                      Necesitás {c.llavesRequeridas} Llaves de Acero (tenés {b.llavesAcero}). Ganás una cada 5 entrenamientos.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
