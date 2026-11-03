// S8-Perfil: CU-005-004 — Monitorear Estado de Fatiga Biométrica. Datos reales.
import { Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { getFatiga } from "@/app/actions/perfil";

const COLORES: Record<string, { borde: string; texto: string; icono: React.ReactNode; etiqueta: string }> = {
  OPTIMA: {
    borde: "border-green-500/50",
    texto: "text-green-400",
    icono: <CheckCircle size={28} />,
    etiqueta: "Carga óptima — podés seguir entrenando con normalidad.",
  },
  MODERADA: {
    borde: "border-yellow-500/50",
    texto: "text-yellow-400",
    icono: <Activity size={28} />,
    etiqueta: "Carga moderada — mantené intensidad baja/media.",
  },
  ELEVADA: {
    borde: "border-orange-500/50",
    texto: "text-orange-400",
    icono: <AlertTriangle size={28} />,
    etiqueta: "Carga elevada — considerá un día de descanso activo.",
  },
  CRITICA: {
    borde: "border-red-500/50",
    texto: "text-red-400",
    icono: <AlertTriangle size={28} />,
    etiqueta: "Carga crítica — descanso obligatorio.",
  },
};

export default async function FatigaPage() {
  const f = await getFatiga();
  const nivel = f.nivelFatiga;
  const c = COLORES[nivel] ?? COLORES.OPTIMA;

  return (
    <div>
      <PageLabel page="P18" />
      <div className="mb-8">
        <h1 className="font-heading font-bold text-4xl text-white uppercase">MONITOR DE FATIGA</h1>
        <p className="text-sm text-[#9CA3AF]">
          La carga biométrica se recalcula con cada entrenamiento registrado.
        </p>
      </div>

      <div className={`bg-[#242424] border-2 ${c.borde} rounded-2xl p-10 max-w-xl mx-auto text-center`}>
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#1a1a1a] mb-4 ${c.texto}`}>
          {c.icono}
        </div>
        <p className={`font-heading font-bold text-3xl uppercase tracking-wider mb-2 ${c.texto}`}>
          {nivel}
        </p>
        <p className="text-sm text-[#9CA3AF] mb-6">{c.etiqueta}</p>

        <div className="border-t border-[#333] pt-6 grid grid-cols-2 gap-4 text-left">
          <div>
            <p className="text-xs text-[#9CA3AF] uppercase mb-1">CARGA SEMANAL</p>
            <p className="font-heading font-bold text-2xl text-white">
              {Number(f.cargaSemanal).toLocaleString("es-AR")}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF] uppercase mb-1">ACTUALIZADO</p>
            <p className="font-heading font-bold text-base text-white">
              {new Date(f.actualizadoEn).toLocaleString("es-AR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
