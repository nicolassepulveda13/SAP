// S8-Perfil: CU-005-006 — Reclamar Beneficio de un Aliado Comercial (P20), según la carpeta (RF-016):
// tarjeta DESTACADO, FILTROS por categoría, acción según el tipo (DESBLOQUEAR CÓDIGO · CANJEAR → · COPIAR CUPÓN ·
// ACTIVAR OFERTA), vencimiento visible. FA-1 rango insuficiente → BLOQUEADO con el nivel requerido · FA-2 vence → EXPIRADO.
import { Gift } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { getBeneficios } from "@/app/actions/perfil";
import { BeneficiosClient } from "./BeneficiosClient";

export default async function BeneficiosPage() {
  const beneficios = await getBeneficios();

  return (
    <div>
      <PageLabel page="P20" />
      {beneficios.length === 0 ? (
        <>
          <h1 className="font-heading font-bold text-4xl text-white uppercase mb-6">BENEFICIOS ALIADOS</h1>
          <div className="bg-[#242424] border border-[#333] rounded-xl p-12 text-center">
            <Gift size={32} className="text-[#555] mx-auto mb-3" />
            <p className="text-[#9CA3AF] text-sm">Todavía no hay beneficios de aliados comerciales.</p>
          </div>
        </>
      ) : (
        <BeneficiosClient beneficios={beneficios} />
      )}
    </div>
  );
}
