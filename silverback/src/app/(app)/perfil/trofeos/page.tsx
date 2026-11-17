// S8-Perfil: CU-005-005 — Consultar Vitrina de Trofeos (P19), según la carpeta:
// encabezado con avatar del clan, "VITRINA DE TROFEOS" + "LOGROS DE COMBATE", VICTORIAS y rango, trofeo destacado
// y grilla de logros. FA-1 sin trofeos → mensaje · FA-2 clic en un trofeo → modal con fecha y condiciones.
import { PageLabel } from "@/components/ui/PageLabel";
import { getVitrina } from "@/app/actions/perfil";
import { VitrinaClient } from "./VitrinaClient";

export default async function TrofeosPage() {
  const v = await getVitrina();

  return (
    <div>
      <PageLabel page="P19" />
      <div className="flex items-center gap-5 mb-6">
        <div className="w-20 h-20 border border-[#F97316] rounded flex items-center justify-center bg-[#1a1a1a] shrink-0">
          <span className="text-5xl">🦍</span>
        </div>
        <div className="flex-1">
          <h1 className="font-heading font-bold text-5xl text-white uppercase">VITRINA DE TROFEOS</h1>
          <p className="font-heading font-bold text-sm text-[#F97316] uppercase tracking-widest">LOGROS DE COMBATE</p>
        </div>
        <div className="bg-[#242424] border border-[#333] rounded-xl px-5 py-3">
          <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">VICTORIAS:</p>
          <p data-testid="victorias" className="font-heading font-bold text-3xl text-white">{v.victorias}</p>
        </div>
        <div className="bg-[#F97316] rounded-xl px-5 py-3">
          <p className="text-[10px] text-white/80 uppercase font-bold">RANGO</p>
          <p data-testid="rango-vitrina" className="font-heading font-bold text-3xl text-white">{v.rango}</p>
        </div>
      </div>
      <hr className="border-[#333] mb-6" />

      {v.trofeos.length === 0 ? (
        <div className="bg-[#242424] border border-[#333] rounded-xl p-12 text-center">
          <span className="text-5xl block mb-3">🏆</span>
          <p className="text-[#9CA3AF] text-sm">Aún no tienes trofeos. Participa en la Arena para comenzar tu historia.</p>
        </div>
      ) : (
        <VitrinaClient trofeos={v.trofeos} />
      )}
    </div>
  );
}
