// S7-Evolucion: Client Component — tabs de categoría (navegación) + comprar con feedback
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { comprarItem, type ItemDTO } from "@/app/actions/evolucion";

const CATEGORIAS = ["TODOS", "SKIN", "HABITAT", "ACCESORIO", "AURA"] as const;

const EMOJIS: Record<string, string> = {
  SKIN: "🦍",
  HABITAT: "🌋",
  ACCESORIO: "📿",
  AURA: "✨",
};

export function TiendaClient({
  items,
  coins,
  categoriaActiva,
}: {
  items: ItemDTO[];
  coins: number;
  categoriaActiva: string;
}) {
  return (
    <>
      <div className="flex gap-2 mb-6">
        {CATEGORIAS.map((c) => (
          <Link
            key={c}
            href={c === "TODOS" ? "/evolucion/tienda" : `/evolucion/tienda?cat=${c}`}
            className={`font-heading font-bold uppercase text-sm px-4 py-2 rounded transition-colors ${
              categoriaActiva === c
                ? "bg-[#F97316] text-white"
                : "bg-[#242424] border border-[#333] text-[#9CA3AF] hover:border-white hover:text-white"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-[#9CA3AF] text-sm text-center py-12">No hay ítems en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} coins={coins} />
          ))}
        </div>
      )}
    </>
  );
}

function ItemCard({ item, coins }: { item: ItemDTO; coins: number }) {
  const [state, action, pending] = useActionState(comprarItem, undefined);
  const sinSaldo = coins < item.precio;

  return (
    <div className="bg-[#242424] border border-[#333] rounded-xl overflow-hidden">
      <div className="h-44 bg-[#1a1a1a] flex items-center justify-center relative">
        <span className="text-6xl">{EMOJIS[item.categoria] ?? "📦"}</span>
        <span className="absolute top-3 right-3 text-[10px] bg-[#2e2e2e] text-[#9CA3AF] px-2 py-0.5 rounded font-heading uppercase">
          {item.categoria}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-heading font-bold text-base text-white uppercase mb-1">{item.nombre}</h3>
        <p className="text-xs text-[#9CA3AF] mb-4">{item.descripcion}</p>
        <form action={action} className="flex items-center justify-between">
          <input type="hidden" name="itemId" value={item.id} />
          <span className="font-heading font-bold text-[#F97316] flex items-center gap-1">
            🪙 {item.precio.toLocaleString()}
          </span>
          <button
            type="submit"
            disabled={sinSaldo || pending}
            className="border border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white disabled:border-[#555] disabled:text-[#555] disabled:cursor-not-allowed font-heading font-bold uppercase text-xs px-4 py-2 rounded transition-colors"
          >
            {pending ? "..." : sinSaldo ? "SIN SALDO" : "COMPRAR"}
          </button>
        </form>
        {state?.error && <p className="text-red-400 text-xs mt-2">{state.error}</p>}
      </div>
    </div>
  );
}
