// S8-Perfil: CU-005-005 — Vitrina de Trofeos. Lista real.
import { Trophy } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { getTrofeos } from "@/app/actions/perfil";

const EMOJI_TIPO: Record<string, string> = {
  RACHA: "🔥",
  CER: "💪",
  CLAN: "🛡️",
  EVENTO: "🏆",
};

export default async function TrofeosPage() {
  const trofeos = await getTrofeos();

  return (
    <div>
      <PageLabel page="P19" />
      <div className="mb-8">
        <h1 className="font-heading font-bold text-4xl text-white uppercase">VITRINA DE TROFEOS</h1>
        <p className="text-sm text-[#9CA3AF]">Logros desbloqueados a lo largo de tu recorrido.</p>
      </div>

      {trofeos.length === 0 ? (
        <div className="bg-[#242424] border border-[#333] rounded-xl p-12 text-center">
          <Trophy size={32} className="text-[#555] mx-auto mb-3" />
          <p className="text-[#9CA3AF] text-sm">
            Todavía no desbloqueaste ningún trofeo. Entrená, ganá guerras y mantené tu racha para ganarlos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {trofeos.map((t) => (
            <div key={t.id} className="bg-[#242424] border border-[#333] rounded-xl overflow-hidden">
              <div className="h-32 bg-[#1a1a1a] flex items-center justify-center">
                <span className="text-5xl">{EMOJI_TIPO[t.tipo] ?? "🏅"}</span>
              </div>
              <div className="p-5">
                <p className="text-[10px] uppercase tracking-wider font-heading font-bold text-[#F97316] mb-1">
                  {t.tipo}
                </p>
                <h3 className="font-heading font-bold text-base text-white uppercase mb-1">{t.nombre}</h3>
                <p className="text-xs text-[#9CA3AF] mb-3">{t.descripcion}</p>
                <p className="text-xs text-[#9CA3AF]">
                  Obtenido el {new Date(t.obtendioEn).toLocaleDateString("es-AR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
