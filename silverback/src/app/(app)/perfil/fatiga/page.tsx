import { Activity, Wrench, AlertTriangle } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";

const weekDays = [
  { day: "L", h: 30 },
  { day: "M", h: 55 },
  { day: "M", h: 40 },
  { day: "J", h: 50 },
  { day: "V", h: 85, active: true },
  { day: "S", h: 15, future: true },
];

export default function FatigaPage() {
  return (
    <div>
      <PageLabel page="P18" />
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1 h-6 bg-[#F97316] rounded-full" />
          <p className="text-xs text-[#9CA3AF] uppercase tracking-widest">MONITOR DE FATIGA</p>
        </div>
        <h1 className="font-heading font-bold text-4xl text-white uppercase">Análisis Biométrico de Recuperación</h1>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-4">
        {/* Estado actual */}
        <div className="bg-[#242424] border border-[#F97316]/60 rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-[#F97316]" />
            <span className="text-xs font-heading font-bold text-white uppercase">ESTADO ACTUAL</span>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div
              className="w-36 h-36 rounded-full bg-[#2e1500] border-4 border-[#F97316] flex flex-col items-center justify-center"
              style={{ boxShadow: "0 0 30px rgba(249,115,22,0.3)" }}
            >
              <AlertTriangle size={28} className="text-[#F97316] mb-1" />
              <span className="font-heading font-bold text-[#F97316] uppercase text-xs text-center leading-tight">
                ALTO
                <br />
                RIESGO DE FATIGA
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#9CA3AF] uppercase">CARGA</span>
              <span className="text-white font-bold">85%</span>
            </div>
            <div className="h-2 bg-[#333] rounded-full">
              <div className="h-full bg-[#F97316] rounded-full" style={{ width: "85%" }} />
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Diagnóstico */}
          <div className="bg-[#242424] border border-[#333] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="text-[#F97316]" />
              <span className="text-xs font-heading font-bold text-white uppercase">DIAGNÓSTICO ESTRUCTURAL</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1a1a1a] border-l-2 border-[#F97316] pl-3 rounded-r-lg p-3">
                <p className="text-xs font-heading font-bold text-[#F97316] uppercase mb-2">! SOBRECARGA DETECTADA</p>
                <p className="text-xs text-[#9CA3AF]">
                  Los niveles de cortisol y la variabilidad de la frecuencia cardíaca indican estrés sistémico. El rendimiento muscular puede verse comprometido.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wrench size={12} className="text-[#9CA3AF]" />
                    <p className="text-xs font-heading font-bold text-white uppercase">PROTOCOLO DE RECUPERACIÓN</p>
                  </div>
                  <span className="text-[10px] bg-[#F97316] text-white px-1.5 py-0.5 rounded font-heading font-bold uppercase">MANDATO</span>
                </div>
                <ul className="text-xs text-[#9CA3AF] space-y-1">
                  <li>• Reducir intensidad al 50% RM.</li>
                  <li>• Priorizar movilidad y descanso activo.</li>
                  <li>• Aumentar ingesta hídrica.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tendencia semanal */}
          <div className="bg-[#242424] border border-[#333] rounded-xl p-6">
            <p className="text-xs font-heading font-bold text-white uppercase mb-4">TENDENCIA SEMANAL</p>
            <div className="flex items-end gap-3 h-24">
              {weekDays.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-[#333] rounded-sm relative flex items-end" style={{ height: 80 }}>
                    <div
                      className={`w-full rounded-sm ${d.active ? "bg-[#F97316]" : d.future ? "bg-[#333] border border-dashed border-[#555]" : "bg-[#9CA3AF]"}`}
                      style={{ height: `${d.h}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#9CA3AF] font-heading uppercase">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
