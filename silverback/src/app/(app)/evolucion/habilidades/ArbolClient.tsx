// S7-Evolucion: Client Component del árbol (selección de nodo + mejora). CU-004-002 pasos 3–17.
"use client";

import { useState, useTransition } from "react";
import { Lock, TrendingUp, Dumbbell, Shield, Swords, Flame, Crown } from "lucide-react";
import { mejorarNodo, type Arbol, type NodoArbol } from "@/app/actions/evolucion";

// Posición en el lienzo (porcentajes). FUERZA arriba al centro, RESISTENCIA a la izquierda y ATAQUE a la derecha (paso 5)
const POSICION: Record<string, { x: number; y: number }> = {
  FUERZA: { x: 50, y: 14 },
  RESISTENCIA: { x: 22, y: 50 },
  ATAQUE: { x: 78, y: 50 },
  FUEGO: { x: 78, y: 86 },
  "TITÁN": { x: 40, y: 86 },
};

const ICONO: Record<string, React.ReactNode> = {
  FUERZA: <Dumbbell size={18} />,
  RESISTENCIA: <Shield size={18} />,
  ATAQUE: <Swords size={18} />,
  FUEGO: <Flame size={18} />,
  "TITÁN": <Crown size={18} />,
};

function posicionDe(n: NodoArbol, i: number, total: number) {
  return POSICION[n.nombre] ?? { x: 10 + (80 * i) / Math.max(1, total - 1), y: 50 };
}

export function ArbolClient({ arbol }: { arbol: Arbol }) {
  const [seleccionado, setSeleccionado] = useState<string>(arbol.nodos[0]?.id ?? "");
  const [aviso, setAviso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const porId = new Map(arbol.nodos.map((n) => [n.id, n]));
  const nodo = porId.get(seleccionado);
  const costo = nodo?.costoSiguienteNivel ?? null;
  const sinPuntos = costo != null && arbol.puntosClan < costo;
  const maximo = nodo != null && nodo.nivel >= nodo.nivelMaximo;

  const seleccionar = (n: NodoArbol) => {
    setError(null);
    if (n.bloqueado) {
      // FA-1: no se selecciona; se informa el prerrequisito
      setAviso(`${n.nombre} está BLOQUEADO: requiere ${n.prerequisitosFaltantes.join(" y ")}.`);
      return;
    }
    setAviso(null);
    setSeleccionado(n.id);
  };

  const mejorar = () => {
    if (!nodo) return;
    startTransition(async () => {
      const r = await mejorarNodo(nodo.id);
      setError(r.error ?? null);
    });
  };

  return (
    <div className="grid grid-cols-[1fr_340px] gap-6">
      <div>
        <div data-testid="arbol" className="relative bg-[#1a1a1a] border border-[#333] rounded-xl h-[420px]">
          <svg className="absolute inset-0 w-full h-full" aria-hidden>
            {arbol.nodos.flatMap((n, i) =>
              n.prerequisitos.map((pid) => {
                const pre = porId.get(pid);
                if (!pre) return null;
                const a = posicionDe(pre, arbol.nodos.indexOf(pre), arbol.nodos.length);
                const b = posicionDe(n, i, arbol.nodos.length);
                return (
                  <line
                    key={`${pid}-${n.id}`}
                    x1={`${a.x}%`} y1={`${a.y}%`} x2={`${b.x}%`} y2={`${b.y}%`}
                    stroke={n.bloqueado ? "#444" : "#F97316"} strokeWidth={2} strokeDasharray={n.bloqueado ? "6 6" : undefined}
                  />
                );
              }),
            )}
          </svg>
          {arbol.nodos.map((n, i) => {
            const pos = posicionDe(n, i, arbol.nodos.length);
            const activo = n.id === seleccionado;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => seleccionar(n)}
                title={n.bloqueado ? `Requiere ${n.prerequisitosFaltantes.join(" y ")}` : n.nombre}
                aria-label={`Nodo ${n.nombre}`}
                data-estado={n.bloqueado ? "bloqueado" : activo ? "seleccionado" : "desbloqueado"}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-24 rounded-lg border-2 px-2 py-2 text-center font-heading font-bold uppercase text-[11px] transition-colors ${
                  n.bloqueado
                    ? "border-[#333] bg-[#242424] text-[#555] cursor-not-allowed"
                    : activo
                      ? "border-[#F97316] bg-[#F97316] text-white"
                      : "border-[#F97316] bg-[#242424] text-white hover:bg-[#F97316]/20"
                }`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <span className="flex justify-center mb-1">{n.bloqueado ? <Lock size={18} /> : ICONO[n.nombre] ?? <TrendingUp size={18} />}</span>
                {n.nombre}
                <span className="block text-[10px] font-normal mt-0.5">
                  {n.bloqueado ? "BLOQUEADO" : n.nombre === "FUERZA" && n.nivel === 0 ? "ORIGEN" : `NV ${n.nivel}/${n.nivelMaximo}`}
                </span>
              </button>
            );
          })}
        </div>
        {aviso && (
          <p role="tooltip" className="mt-3 text-sm text-yellow-400 border border-yellow-400/40 rounded px-3 py-2">
            {aviso}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {nodo && (
          <div data-testid="panel-nodo" className="bg-[#242424] border border-[#333] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#F97316] rounded-lg flex items-center justify-center text-white">
                {ICONO[nodo.nombre] ?? <TrendingUp size={18} />}
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl text-white uppercase">{nodo.nombre}</h3>
                <p className="text-xs text-[#9CA3AF] uppercase">
                  NIVEL <span data-testid="nivel-nodo" className="text-white font-bold">{nodo.nivel} / {nodo.nivelMaximo}</span>
                </p>
              </div>
            </div>
            <p className="text-xs text-[#9CA3AF] mb-4">{nodo.descripcion}</p>
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
              <div className="bg-[#1a1a1a] rounded p-2">
                <p className="text-[#9CA3AF] uppercase mb-1">EFECTO ACTUAL</p>
                <p className="text-white font-bold">{nodo.efectoActual ?? "Sin mejoras"}</p>
              </div>
              <div className="bg-[#1a1a1a] rounded p-2 border border-[#F97316]/40">
                <p className="text-[#9CA3AF] uppercase mb-1">PRÓXIMO NIVEL</p>
                <p className="text-[#F97316] font-bold">{nodo.efectoSiguiente ?? "Nivel máximo"}</p>
              </div>
            </div>
            {!maximo && (
              <p className="text-xs text-[#9CA3AF] uppercase mb-3">
                COSTO <span className={`font-bold ${sinPuntos ? "text-red-400" : "text-white"}`}>{costo?.toLocaleString("es-AR")} PUNTOS DE CLAN</span>
              </p>
            )}
            <button
              type="button"
              onClick={mejorar}
              disabled={pending || sinPuntos || maximo}
              className="w-full bg-[#F97316] hover:bg-[#EA6800] disabled:bg-[#555] disabled:cursor-not-allowed text-white font-heading font-bold uppercase tracking-wider py-2.5 rounded"
            >
              {pending ? "MEJORANDO..." : maximo ? "NIVEL MÁXIMO" : sinPuntos ? "PUNTOS INSUFICIENTES" : "MEJORAR NODO"}
            </button>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>
        )}

        <div data-testid="ultimas-inversiones" className="bg-[#242424] border border-[#333] rounded-xl p-5">
          <p className="font-heading font-bold text-xs text-[#9CA3AF] uppercase mb-3">ÚLTIMAS INVERSIONES</p>
          {arbol.ultimasInversiones.length === 0 ? (
            <p className="text-xs text-[#9CA3AF]">Todavía no hay inversiones en el clan.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {arbol.ultimasInversiones.map((i) => (
                <li key={`${i.nodo}-${i.invertidoEn}`} className="flex justify-between text-xs">
                  <span className="text-white font-bold uppercase">
                    {i.nodo} → NV {i.nivelAlcanzado}
                    <span className="block text-[#9CA3AF] font-normal normal-case">{i.miembro}</span>
                  </span>
                  <span className="text-[#F97316] font-bold">−{i.costo.toLocaleString("es-AR")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
