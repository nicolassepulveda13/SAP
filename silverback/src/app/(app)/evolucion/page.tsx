// S7-Evolucion: CU-004-001 — Visualizar Progreso de Evolución (P12). Server Component con datos reales.
import { Flame, Coins, TrendingUp } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { getProgreso } from "@/app/actions/evolucion";

const RANGOS = ["BRONCE", "PLATA", "ORO", "RANGO_S"] as const;

export default async function EvolucionPage() {
  const p = await getProgreso();
  const idx = RANGOS.indexOf(p.miembro.rango as typeof RANGOS[number]);
  const proximoRango = idx >= 0 && idx < RANGOS.length - 1 ? RANGOS[idx + 1] : null;
  const faltaXp = p.xpParaSiguienteRango ?? 0;
  const progresoRango = proximoRango
    ? Math.min(100, Math.max(0, Math.round((p.miembro.xp / (p.miembro.xp + Math.max(1, faltaXp))) * 100)))
    : 100;

  return (
    <div>
      <PageLabel page="P12" />
      <div className="mb-6">
        <h1 className="font-heading font-bold text-4xl text-white uppercase">EVOLUCIÓN</h1>
        <p className="text-sm text-[#9CA3AF]">Tu progreso de rango, árbol de habilidades y recompensas.</p>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        <div className="bg-[#242424] border border-[#333] rounded-xl p-8 flex flex-col items-center">
          <div className="w-40 h-40 rounded-full border-4 border-[#F97316] bg-[#1a1a1a] flex items-center justify-center mb-4">
            <span className="text-7xl">🦍</span>
          </div>
          <p className="font-heading font-bold text-xl text-white uppercase mb-1">{p.miembro.nombre}</p>
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-6">
            {p.miembro.arquetipo ?? "—"} · RANGO {p.miembro.rango.replace("_", " ")}
          </p>

          <div className="w-full">
            <div className="flex justify-between text-xs text-[#9CA3AF] mb-1">
              <span>PROGRESO DE RANGO</span>
              <span className="text-[#F97316]">
                {proximoRango ? `${p.miembro.xp.toLocaleString()} XP · faltan ${faltaXp.toLocaleString()}` : "MÁX"}
              </span>
            </div>
            <div className="h-2 bg-[#333] rounded-full mb-2">
              <div className="h-full bg-[#F97316] rounded-full" style={{ width: `${progresoRango}%` }} />
            </div>
            <div className="flex justify-between text-xs text-[#9CA3AF]">
              <span>ACTUAL: <span className="text-white font-bold">{p.miembro.rango.replace("_", " ")}</span></span>
              <span>PRÓXIMO: <span className="text-white font-bold">{proximoRango?.replace("_", " ") ?? "—"}</span></span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-[#242424] border border-[#333] rounded-xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2e2e2e] rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="text-[#F97316]" />
            </div>
            <div>
              <p className="font-heading font-bold text-xs text-[#9CA3AF] uppercase">XP TOTAL</p>
              <p className="font-heading font-bold text-2xl text-[#F97316]">{p.miembro.xp.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-[#242424] border border-[#333] rounded-xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2e2e2e] rounded-lg flex items-center justify-center shrink-0">
              <Coins size={20} className="text-[#F97316]" />
            </div>
            <div>
              <p className="font-heading font-bold text-xs text-[#9CA3AF] uppercase">COINS</p>
              <p className="font-heading font-bold text-2xl text-[#F97316]">{p.miembro.coins.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-[#242424] border border-[#333] rounded-xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2e2e2e] rounded-lg flex items-center justify-center shrink-0">
              <Flame size={20} className="text-[#F97316]" />
            </div>
            <div>
              <p className="font-heading font-bold text-xs text-[#9CA3AF] uppercase">ARQUETIPO</p>
              <p className="font-heading font-bold text-xl text-white">{p.miembro.arquetipo ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
