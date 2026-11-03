// S7-Evolucion: CU-004-002 — Mejorar Nodo del Árbol de Habilidades (P13). Lista real de nodos.
import { Lock, Check } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { getProgreso, getNodos } from "@/app/actions/evolucion";
import { MejorarNodoButton } from "./MejorarNodoButton";

export default async function HabilidadesPage() {
  const [progreso, nodos] = await Promise.all([getProgreso(), getNodos()]);
  const invertidos = new Set(nodos.filter((n) => n.invertido).map((n) => n.id));
  const xp = progreso.miembro.xp;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <PageLabel page="P13" />
          <h1 className="font-heading font-bold text-4xl text-white uppercase">ÁRBOL DE HABILIDADES</h1>
          <p className="text-sm text-[#9CA3AF]">Invertí XP para desbloquear habilidades permanentes.</p>
        </div>
        <div className="bg-[#242424] border border-[#333] rounded-xl px-5 py-3 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-[#F97316] rounded-full flex items-center justify-center">
            <span className="text-sm">⚡</span>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF] uppercase">XP DISPONIBLE</p>
            <p className="font-heading font-bold text-xl text-[#F97316]">{xp.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {nodos.length === 0 ? (
        <p className="text-[#9CA3AF] text-sm text-center py-12">
          Todavía no hay nodos disponibles en el árbol.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {nodos.map((n) => {
            const prereqsOk = n.prerequisitos.every((id) => invertidos.has(id));
            const bloqueado = !prereqsOk;
            const sinXp = xp < n.costoXp;

            return (
              <div
                key={n.id}
                className={`bg-[#242424] border rounded-xl p-5 ${
                  n.invertido ? "border-[#F97316]" : bloqueado ? "border-[#333] opacity-70" : "border-[#333]"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-heading font-bold text-white uppercase">{n.nombre}</h3>
                  {n.invertido ? (
                    <span className="text-xs bg-[#F97316] text-white px-2 py-0.5 rounded font-heading uppercase flex items-center gap-1">
                      <Check size={10} /> INVERTIDO
                    </span>
                  ) : bloqueado ? (
                    <span className="text-xs bg-[#333] text-[#9CA3AF] px-2 py-0.5 rounded font-heading uppercase flex items-center gap-1">
                      <Lock size={10} /> BLOQUEADO
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-[#9CA3AF] mb-4">{n.descripcion}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9CA3AF] uppercase">
                    COSTO <span className="text-white font-bold">{n.costoXp.toLocaleString()} XP</span>
                  </span>
                  {!n.invertido && (
                    <MejorarNodoButton nodoId={n.id} disabled={bloqueado || sinXp} nombre={n.nombre} />
                  )}
                </div>
                {!n.invertido && bloqueado && (
                  <p className="text-xs text-[#9CA3AF] mt-2">Requiere invertir en los nodos previos.</p>
                )}
                {!n.invertido && !bloqueado && sinXp && (
                  <p className="text-xs text-red-400 mt-2">XP insuficiente.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
