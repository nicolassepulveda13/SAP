// S7-Evolucion: CU-004-004 — Adquirir Ítem en el Marketplace (P15). Catálogo real + saldo real.
import { Coins } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { getProgreso, getItems } from "@/app/actions/evolucion";
import { TiendaClient } from "./TiendaClient";

export default async function TiendaPage({ searchParams }: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const [progreso, items] = await Promise.all([getProgreso(), getItems(cat)]);

  return (
    <div>
      <PageLabel page="P15" />
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-4xl text-white uppercase">MARKETPLACE</h1>
          <p className="text-sm text-[#9CA3AF]">Equipate con skins, hábitats, accesorios y auras.</p>
        </div>
        <div className="bg-[#242424] border border-[#333] rounded-xl px-5 py-3 shrink-0">
          <p className="text-xs text-[#9CA3AF] uppercase mb-1">TU SALDO</p>
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-[#F97316]" />
            <span className="font-heading font-bold text-xl text-white">
              {progreso.miembro.coins.toLocaleString()} SB
            </span>
          </div>
        </div>
      </div>

      <TiendaClient items={items} coins={progreso.miembro.coins} categoriaActiva={cat ?? "TODOS"} />
    </div>
  );
}
