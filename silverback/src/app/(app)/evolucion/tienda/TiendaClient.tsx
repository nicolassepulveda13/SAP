// S7-Evolucion: Client Component — filtros por categoría + compra con modal de confirmación (CU-004-004 pasos 15–17)
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { comprarItem, type ItemDTO } from "@/app/actions/evolucion";

const FILTROS = [
  { label: "TODOS", cat: "TODOS" },
  { label: "SKINS", cat: "SKIN" },
  { label: "AURAS", cat: "AURA" },
  { label: "ICONOS", cat: "ICONO" },
] as const;

const EMOJIS: Record<string, string> = { SKIN: "🦍", AURA: "✨", ICONO: "🛡️" };

export function TiendaClient({ items, coins, categoriaActiva }: { items: ItemDTO[]; coins: number; categoriaActiva: string }) {
  const [aConfirmar, setAConfirmar] = useState<ItemDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const confirmar = () => {
    if (!aConfirmar) return;
    const item = aConfirmar;
    startTransition(async () => {
      const r = await comprarItem(item.id);
      setAConfirmar(null);
      if (r.error) {
        setError(r.error);
        setOk(null);
      } else {
        setError(null);
        setOk(`Compraste ${item.nombre}. Ya está en tu inventario.`);
      }
    });
  };

  return (
    <>
      <div className="flex gap-2 mb-6">
        {FILTROS.map((f) => (
          <Link
            key={f.cat}
            href={f.cat === "TODOS" ? "/evolucion/tienda" : `/evolucion/tienda?cat=${f.cat}`}
            className={`font-heading font-bold uppercase text-sm px-4 py-2 rounded transition-colors ${
              categoriaActiva === f.cat
                ? "bg-[#F97316] text-white"
                : "bg-[#242424] border border-[#333] text-[#9CA3AF] hover:border-white hover:text-white"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {ok && <p className="text-green-400 text-sm mb-4">{ok}</p>}
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {items.length === 0 ? (
        <p className="text-[#9CA3AF] text-sm text-center py-12">No hay ítems disponibles en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {items.map((item) => {
            const sinSaldo = coins < item.precio;
            return (
              <div key={item.id} data-testid="item" className="bg-[#242424] border border-[#333] rounded-xl overflow-hidden">
                <div className="h-44 bg-[#1a1a1a] flex items-center justify-center relative">
                  <span className="text-6xl">{EMOJIS[item.categoria] ?? "📦"}</span>
                  <span className="absolute top-3 right-3 text-[10px] bg-[#2e2e2e] text-[#9CA3AF] px-2 py-0.5 rounded font-heading uppercase">
                    {item.categoria}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-heading font-bold uppercase text-[#9CA3AF] mb-1">{item.rareza}</p>
                  <h3 className="font-heading font-bold text-base text-white uppercase mb-1">{item.nombre}</h3>
                  <p className="text-xs text-[#9CA3AF] mb-4">{item.descripcion}</p>
                  <div className="flex items-center justify-between">
                    <span data-testid="precio" className={`font-heading font-bold ${sinSaldo ? "text-red-500" : "text-[#F97316]"}`}>
                      🪙 {item.precio.toLocaleString("es-AR")} SB
                    </span>
                    <button
                      type="button"
                      onClick={() => setAConfirmar(item)}
                      disabled={sinSaldo || pending}
                      className="border border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white disabled:border-[#555] disabled:text-[#555] disabled:cursor-not-allowed font-heading font-bold uppercase text-xs px-4 py-2 rounded transition-colors"
                    >
                      COMPRAR
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {aConfirmar && (
        <div role="dialog" aria-label="Confirmar compra" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#242424] border border-[#F97316] rounded-xl p-6 w-96">
            <h3 className="font-heading font-bold text-xl text-white uppercase mb-2">CONFIRMAR COMPRA</h3>
            <p className="text-sm text-[#9CA3AF] mb-1">{aConfirmar.nombre}</p>
            <p className="font-heading font-bold text-2xl text-[#F97316] mb-6">{aConfirmar.precio.toLocaleString("es-AR")} SB</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAConfirmar(null)}
                className="flex-1 border border-[#555] text-[#9CA3AF] font-heading font-bold uppercase py-2 rounded"
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={confirmar}
                disabled={pending}
                className="flex-1 bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase py-2 rounded"
              >
                {pending ? "..." : "CONFIRMAR"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
