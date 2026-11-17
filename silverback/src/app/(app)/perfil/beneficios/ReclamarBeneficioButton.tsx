// S8-Perfil: Client Component — acción del beneficio según su tipo (CU-005-006 pasos 7–18)
//   CODIGO → DESBLOQUEAR CÓDIGO (muestra el código) · REDIRECCION → CANJEAR → (abre la plataforma del aliado)
//   CUPON → COPIAR CUPÓN (al portapapeles) · SUSCRIPCION → ACTIVAR OFERTA
"use client";

import { useActionState, useEffect, useState } from "react";
import { reclamarBeneficio, type Beneficio } from "@/app/actions/perfil";

const ACCION: Record<string, string> = {
  CODIGO: "DESBLOQUEAR CÓDIGO",
  REDIRECCION: "CANJEAR →",
  CUPON: "COPIAR CUPÓN",
  SUSCRIPCION: "ACTIVAR OFERTA",
};

export function ReclamarBeneficioButton({ beneficio }: { beneficio: Beneficio }) {
  const [state, action, pending] = useActionState(reclamarBeneficio, undefined);
  const [copiado, setCopiado] = useState(false);
  const codigo = state?.cupon ?? beneficio.codigo ?? null;

  // Efecto del reclamo recién hecho según el tipo
  useEffect(() => {
    if (!state?.cupon) return;
    if (beneficio.tipo === "CUPON") {
      navigator.clipboard?.writeText(state.cupon).then(() => setCopiado(true)).catch(() => setCopiado(false));
    }
    if (beneficio.tipo === "REDIRECCION" && state.url) {
      window.open(state.url, "_blank", "noopener");
    }
  }, [state, beneficio.tipo]);

  if (codigo) {
    return (
      <div className="border border-[#F97316] rounded p-3 text-center">
        <p className="text-[10px] text-[#9CA3AF] uppercase mb-1">
          {beneficio.tipo === "SUSCRIPCION" ? "OFERTA ACTIVADA · CÓDIGO" : beneficio.tipo === "CUPON" ? "TU CUPÓN" : "TU CÓDIGO"}
        </p>
        <p data-testid="codigo-beneficio" className="font-mono font-bold text-[#F97316] text-lg tracking-wider">{codigo}</p>
        {copiado && <p className="text-[10px] text-green-400 uppercase mt-1">COPIADO AL PORTAPAPELES</p>}
        {beneficio.tipo === "SUSCRIPCION" && (beneficio.suscripcionHasta || state?.cupon) && (
          <p data-testid="suscripcion-activa" className="text-[10px] text-green-400 uppercase mt-1">
            SUSCRIPCIÓN ACTIVA{beneficio.suscripcionHasta ? ` HASTA ${new Date(beneficio.suscripcionHasta).toLocaleDateString("es-AR")}` : ""}
          </p>
        )}
        {!state?.cupon && <p className="text-[10px] text-[#9CA3AF] uppercase mt-1">YA RECLAMADO</p>}
        {beneficio.tipo === "REDIRECCION" && (
          <a href={beneficio.urlAliado} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#F97316] underline uppercase">
            IR A {beneficio.aliado}
          </a>
        )}
      </div>
    );
  }

  return (
    <form action={action}>
      <input type="hidden" name="beneficioId" value={beneficio.id} />
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[#F97316] hover:bg-[#EA6800] disabled:opacity-50 text-white font-heading font-bold uppercase tracking-wider py-2 rounded text-sm"
      >
        {pending ? "..." : ACCION[beneficio.tipo] ?? "RECLAMAR"}
      </button>
      {state?.error && <p className="text-red-400 text-xs mt-2">{state.error}</p>}
    </form>
  );
}
