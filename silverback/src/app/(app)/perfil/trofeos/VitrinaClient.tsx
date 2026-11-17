// S8-Perfil: Client Component — grilla de trofeos con destacado y modal de detalle (CU-005-005 FA-2)
"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import type { Trofeo } from "@/app/actions/perfil";

const EMOJI: Record<string, string> = { RACHA: "🔥", CER: "💪", CLAN: "🛡️", EVENTO: "🏆" };
// El destacado es el logro de mayor peso: victoria del clan > racha > rendimiento
const PESO: Record<string, number> = { CLAN: 3, EVENTO: 3, RACHA: 2, CER: 1 };

export function VitrinaClient({ trofeos }: { trofeos: Trofeo[] }) {
  const [abierto, setAbierto] = useState<Trofeo | null>(null);
  const ordenados = [...trofeos].sort(
    (a, b) => (PESO[b.tipo] ?? 0) - (PESO[a.tipo] ?? 0) || b.obtendioEn.localeCompare(a.obtendioEn),
  );
  const [destacado, ...resto] = ordenados;

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setAbierto(destacado)}
          data-testid="trofeo-destacado"
          className="col-span-2 row-span-2 text-left bg-[#242424] border-2 border-[#F97316] rounded-xl p-6 relative overflow-hidden"
        >
          <span className="text-[10px] font-heading font-bold uppercase bg-[#F97316] text-white px-2 py-0.5 rounded">{destacado.tipo}</span>
          <Star size={20} className="absolute top-5 right-5 text-yellow-400 fill-yellow-400" />
          <h3 className="font-heading font-bold text-4xl text-white uppercase mt-4 mb-2">{destacado.nombre}</h3>
          <p className="text-sm text-[#9CA3AF] max-w-xs">{destacado.descripcion}</p>
          <span className="absolute right-6 bottom-4 text-8xl opacity-30">{EMOJI[destacado.tipo] ?? "🏆"}</span>
        </button>
        {resto.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setAbierto(t)}
            data-testid="trofeo"
            className="text-left bg-[#242424] border border-[#333] hover:border-[#F97316] rounded-xl p-5"
          >
            <span className="text-3xl block mb-2">{EMOJI[t.tipo] ?? "🏆"}</span>
            <p className="font-heading font-bold text-white uppercase">{t.nombre}</p>
            <p className="text-xs text-[#9CA3AF]">{t.descripcion}</p>
          </button>
        ))}
      </div>

      {abierto && (
        <div role="dialog" aria-label="Detalle del trofeo" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#242424] border border-[#F97316] rounded-xl p-6 w-[420px] relative">
            <button type="button" onClick={() => setAbierto(null)} aria-label="Cerrar" className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white">
              <X size={18} />
            </button>
            <span className="text-5xl block mb-3">{EMOJI[abierto.tipo] ?? "🏆"}</span>
            <h3 className="font-heading font-bold text-2xl text-white uppercase mb-1">{abierto.nombre}</h3>
            <p className="text-xs text-[#F97316] uppercase font-bold mb-4">
              Obtenido el {new Date(abierto.obtendioEn).toLocaleDateString("es-AR")}
            </p>
            <p className="text-[10px] text-[#9CA3AF] uppercase font-bold mb-1">CONDICIONES CUMPLIDAS</p>
            <p className="text-sm text-white">{abierto.descripcion}</p>
          </div>
        </div>
      )}
    </>
  );
}
