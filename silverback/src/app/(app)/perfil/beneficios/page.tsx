// S8-Perfil: CU-005-006 — Reclamar Beneficio de un Aliado Comercial. Lista real + reclamar.
import { Gift } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { getBeneficios } from "@/app/actions/perfil";
import { ReclamarBeneficioButton } from "./ReclamarBeneficioButton";

export default async function BeneficiosPage() {
  const beneficios = await getBeneficios();

  return (
    <div>
      <PageLabel page="P20" />
      <div className="mb-8">
        <h1 className="font-heading font-bold text-4xl text-white uppercase">BENEFICIOS DE ALIADOS</h1>
        <p className="text-sm text-[#9CA3AF]">
          Promos y cupones de los partners comerciales de Silverback, según tu rango.
        </p>
      </div>

      {beneficios.length === 0 ? (
        <div className="bg-[#242424] border border-[#333] rounded-xl p-12 text-center">
          <Gift size={32} className="text-[#555] mx-auto mb-3" />
          <p className="text-[#9CA3AF] text-sm">
            Todavía no hay beneficios disponibles para tu rango.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {beneficios.map((b) => {
            const reclamado = b.estado === "RECLAMADO";
            return (
              <div key={b.id} className="bg-[#242424] border border-[#333] rounded-xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-heading font-bold text-base text-white uppercase">{b.titulo}</h3>
                  <span className="text-[10px] font-heading font-bold uppercase text-[#F97316] bg-[#2e2e2e] px-2 py-0.5 rounded">
                    {b.tipo}
                  </span>
                </div>
                <p className="text-xs text-[#9CA3AF] mb-3">{b.descripcion}</p>
                <p className="text-[10px] text-[#9CA3AF] mb-3 uppercase">
                  Rango mínimo: <span className="text-white font-bold">{b.rangoMinimo.replace("_", " ")}</span>
                </p>
                <ReclamarBeneficioButton beneficioId={b.id} yaReclamado={reclamado} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
