// S7-Evolucion: CU-004-002 — Mejorar Nodo del Árbol de Habilidades (P13), según la carpeta:
// árbol COLECTIVO del clan, se invierte con Puntos de Clan, nodos con nivel actual / máximo, panel de detalle
// e historial "ÚLTIMAS INVERSIONES". FA-1 nodo bloqueado → tooltip con el prerrequisito · FA-2 "PUNTOS INSUFICIENTES".
import { Shield } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { getArbol } from "@/app/actions/evolucion";
import { ArbolClient } from "./ArbolClient";

export default async function SkillTreePage() {
  const arbol = await getArbol();

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <PageLabel page="P13" />
          <h1 className="font-heading font-bold text-4xl text-white uppercase">SKILL TREE</h1>
          <p className="text-sm text-[#9CA3AF]">Invertí los Puntos de Clan en mejoras colectivas para toda la manada.</p>
        </div>
        <div className="bg-[#242424] border border-[#333] rounded-xl px-5 py-3 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-[#F97316] rounded-full flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF] uppercase">PUNTOS DE CLAN</p>
            <p data-testid="puntos-clan" className="font-heading font-bold text-xl text-[#F97316]">
              {arbol.puntosClan.toLocaleString("es-AR")}
            </p>
          </div>
        </div>
      </div>

      {arbol.nodos.length === 0 ? (
        <p className="text-[#9CA3AF] text-sm text-center py-12">Todavía no hay nodos disponibles en el árbol.</p>
      ) : (
        <ArbolClient arbol={arbol} />
      )}
    </div>
  );
}
