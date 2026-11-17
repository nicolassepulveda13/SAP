// CU-004-004 paso 18: los ítems comprados quedan en el inventario y se activan desde el perfil (uno por categoría)
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { activarItem, type ItemInventario } from "@/app/actions/perfil";

const EMOJI: Record<string, string> = { SKIN: "🦍", AURA: "✨", ICONO: "🛡️" };

export function Inventario({ items }: { items: ItemInventario[] }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const activar = (itemId: string) =>
    startTransition(async () => {
      const r = await activarItem(itemId);
      setError(r.error ?? null);
    });

  return (
    <div data-testid="inventario" className="bg-[#242424] border border-[#333] rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <p className="font-heading font-bold text-xs text-[#9CA3AF] uppercase tracking-wider">INVENTARIO</p>
        <Link href="/evolucion/tienda" className="text-xs text-[#F97316] font-heading font-bold uppercase">IR AL MERCADO →</Link>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-[#9CA3AF]">Todavía no compraste ítems en el Marketplace.</p>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {items.map((i) => (
            <div key={i.itemId} data-testid="item-inventario" className={`rounded-lg p-3 border ${i.activo ? "border-[#F97316]" : "border-[#333]"}`}>
              <span className="text-2xl">{EMOJI[i.categoria] ?? "📦"}</span>
              <p className="font-heading font-bold text-white uppercase text-sm">{i.nombre}</p>
              <p className="text-[10px] text-[#9CA3AF] uppercase mb-2">{i.categoria} · {i.rareza}</p>
              {i.activo ? (
                <span className="text-[10px] font-heading font-bold uppercase bg-[#F97316] text-white px-2 py-0.5 rounded">ACTIVO</span>
              ) : (
                <button
                  type="button"
                  onClick={() => activar(i.itemId)}
                  disabled={pending}
                  className="text-[10px] font-heading font-bold uppercase border border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white px-2 py-0.5 rounded"
                >
                  ACTIVAR
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}
