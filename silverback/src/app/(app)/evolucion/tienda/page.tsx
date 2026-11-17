// S7-Evolucion: CU-004-004 — Adquirir Ítem en el Marketplace (P15), según la carpeta:
// saldo en SB arriba a la derecha, filtros TODOS / SKINS / AURAS / ICONOS, confirmación antes de comprar,
// FA-1 sin saldo → botón deshabilitado y precio en rojo · FA-2 "No hay ítems disponibles en esta categoría."
import { Coins } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { getProgreso, getItems } from "@/app/actions/evolucion";
import { TiendaClient } from "./TiendaClient";

const CATEGORIAS_VALIDAS = ["SKIN", "AURA", "ICONO"];

export default async function TiendaPage({ searchParams }: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const categoria = cat && CATEGORIAS_VALIDAS.includes(cat) ? cat : undefined;
  const [progreso, items] = await Promise.all([getProgreso(), getItems(categoria)]);

  return (
    <div>
      <PageLabel page="P15" />
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-4xl text-white uppercase">MARKETPLACE</h1>
          <p className="text-sm text-[#9CA3AF]">
            Equípate con las mejores skins, auras e iconos. Demuestra tu jerarquía en la arena.
          </p>
        </div>
        <div className="bg-[#242424] border border-[#333] rounded-xl px-5 py-3 shrink-0">
          <p className="text-xs text-[#9CA3AF] uppercase mb-1">TU SALDO</p>
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-[#F97316]" />
            <span data-testid="saldo-sb" className="font-heading font-bold text-xl text-white">
              {progreso.miembro.coins.toLocaleString("es-AR")} SB
            </span>
          </div>
        </div>
      </div>

      <TiendaClient items={items} coins={progreso.miembro.coins} categoriaActiva={categoria ?? "TODOS"} />
    </div>
  );
}
