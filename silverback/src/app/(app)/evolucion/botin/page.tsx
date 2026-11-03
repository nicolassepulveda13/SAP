// S7-Evolucion: CU-004-003 — Reclamar Recompensa de la Bóveda (P14). Lista real de cofres del miembro.
import { PageLabel } from "@/components/ui/PageLabel";
import { getCofres } from "@/app/actions/evolucion";
import { ReclamarCofreButton } from "./ReclamarCofreButton";

const RAREZA_COLORS: Record<string, string> = {
  COMUN: "border-[#9CA3AF] text-[#9CA3AF]",
  RARO: "border-[#3b82f6] text-[#3b82f6]",
  EPICO: "border-[#a855f7] text-[#a855f7]",
  LEGENDARIO: "border-[#F97316] text-[#F97316]",
};

const RAREZA_EMOJI: Record<string, string> = {
  COMUN: "📦",
  RARO: "🎁",
  EPICO: "💎",
  LEGENDARIO: "🏆",
};

export default async function BotinPage() {
  const cofres = await getCofres();

  return (
    <div>
      <PageLabel page="P14" />
      <div className="mb-6">
        <h1 className="font-heading font-bold text-4xl text-white uppercase">BÓVEDA</h1>
        <p className="text-sm text-[#9CA3AF]">
          Reclamá los cofres que ganaste con tus entrenamientos y guerras.
        </p>
      </div>

      {cofres.length === 0 ? (
        <div className="bg-[#242424] border border-[#333] rounded-xl p-12 text-center">
          <span className="text-5xl block mb-3">📭</span>
          <p className="text-[#9CA3AF] text-sm">
            No tenés cofres disponibles. Entrená y ganá guerras para desbloquear recompensas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {cofres.map((c) => {
            const color = RAREZA_COLORS[c.rareza] ?? "border-[#333]";
            const emoji = RAREZA_EMOJI[c.rareza] ?? "📦";
            return (
              <div key={c.id} className={`bg-[#242424] rounded-xl overflow-hidden border-2 ${color}`}>
                <div className="h-44 bg-[#1a1a1a] flex items-center justify-center">
                  <span className="text-7xl">{emoji}</span>
                </div>
                <div className="p-5">
                  <p className={`text-xs uppercase font-heading font-bold tracking-wider mb-2 ${color}`}>
                    COFRE {c.rareza}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mb-4">
                    Obtenido el {new Date(c.obtendioEn).toLocaleDateString("es-AR")}
                  </p>
                  <ReclamarCofreButton cofreId={c.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
