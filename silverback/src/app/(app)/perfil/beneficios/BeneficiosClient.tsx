// S8-Perfil: Client Component — filtros, grilla con destacado y vencimientos en vivo (CU-005-006)
"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, Lock } from "lucide-react";
import type { Beneficio } from "@/app/actions/perfil";
import { ReclamarBeneficioButton } from "./ReclamarBeneficioButton";

const DIA_MS = 24 * 60 * 60 * 1000;

export function BeneficiosClient({ beneficios }: { beneficios: Beneficio[] }) {
  const categorias = ["TODAS", ...Array.from(new Set(beneficios.map((b) => b.categoria)))];
  const [filtro, setFiltro] = useState("TODAS");
  const [verFiltros, setVerFiltros] = useState(false);
  const [ahora, setAhora] = useState(() => Date.now());

  // FA-2: si un beneficio vence mientras la pantalla está abierta, pasa a EXPIRADO
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const visibles = beneficios.filter((b) => filtro === "TODAS" || b.categoria === filtro);

  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-4xl text-white uppercase">BENEFICIOS ALIADOS</h1>
          <p className="text-sm text-[#9CA3AF]">Arsenal de recompensas exclusivas para el Clan Silverback. Reclama tu ventaja.</p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setVerFiltros((v) => !v)}
            className="border border-[#333] hover:border-[#F97316] text-white font-heading font-bold uppercase text-sm px-4 py-2 rounded flex items-center gap-2"
          >
            <SlidersHorizontal size={14} /> FILTROS
          </button>
          {verFiltros && (
            <div className="absolute right-0 mt-2 bg-[#242424] border border-[#333] rounded-lg p-2 z-10 w-48">
              {categorias.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setFiltro(c); setVerFiltros(false); }}
                  className={`block w-full text-left text-xs font-heading font-bold uppercase px-3 py-2 rounded ${
                    filtro === c ? "bg-[#F97316] text-white" : "text-[#9CA3AF] hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {visibles.map((b) => {
          const vence = b.fechaVencimiento ? new Date(b.fechaVencimiento).getTime() : null;
          const estado = b.estado === "DISPONIBLE" && vence != null && vence < ahora ? "EXPIRADO" : b.estado;
          const diasRestantes = vence != null ? Math.ceil((vence - ahora) / DIA_MS) : null;
          const apagado = estado === "BLOQUEADO" || estado === "EXPIRADO";
          return (
            <div
              key={b.id}
              data-testid="beneficio"
              data-estado={estado}
              className={`bg-[#242424] rounded-xl p-5 border ${b.destacado ? "col-span-2 border-[#F97316]" : "border-[#333]"} ${apagado ? "opacity-60" : ""}`}
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {b.destacado && (
                  <span className="text-[10px] font-heading font-bold uppercase bg-[#F97316] text-white px-2 py-0.5 rounded">DESTACADO</span>
                )}
                <span className="text-[10px] font-heading font-bold uppercase bg-[#2e2e2e] text-[#F97316] px-2 py-0.5 rounded">{b.categoria}</span>
                {estado !== "EXPIRADO" && diasRestantes != null && diasRestantes <= 7 && (
                  <span className="text-[10px] font-heading font-bold uppercase bg-red-600 text-white px-2 py-0.5 rounded">
                    VENCE EN {diasRestantes} {diasRestantes === 1 ? "DÍA" : "DÍAS"}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#9CA3AF] uppercase font-bold">{b.aliado}</p>
              <h3 className={`font-heading font-bold text-white uppercase mb-1 ${b.destacado ? "text-2xl" : "text-base"}`}>{b.titulo}</h3>
              <p className="text-xs text-[#9CA3AF] mb-3">{b.descripcion}</p>
              <p className="text-[10px] text-[#9CA3AF] mb-3 uppercase">
                Nivel mínimo: <span className="text-white font-bold">{b.rangoMinimo}</span>
              </p>
              {estado === "BLOQUEADO" ? (
                // FA-1: el botón no ejecuta nada; se informa el nivel requerido
                <div className="w-full bg-[#333] text-[#9CA3AF] font-heading font-bold uppercase text-sm py-2 rounded flex items-center justify-center gap-2 cursor-not-allowed">
                  <Lock size={14} /> BLOQUEADO · REQUIERE {b.rangoMinimo}
                </div>
              ) : estado === "EXPIRADO" ? (
                <div className="w-full bg-[#333] text-[#9CA3AF] font-heading font-bold uppercase text-sm py-2 rounded text-center cursor-not-allowed">
                  EXPIRADO
                </div>
              ) : (
                <ReclamarBeneficioButton beneficio={b} />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
