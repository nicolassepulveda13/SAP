// S8-Perfil: CU-005-004 — Monitorear Estado de Fatiga Biométrica (P18), según la carpeta (RF-009):
// indicador circular + barra "CARGA" %, DIAGNÓSTICO ESTRUCTURAL ("SOBRECARGA DETECTADA"), PROTOCOLO DE RECUPERACIÓN
// con insignia "MANDATO" y TENDENCIA SEMANAL (hoy en naranja, días futuros punteados).
// FA-1 rango seguro → "ESTADO ÓPTIMO" en verde · FA-2 biometría desactualizada → advertencia de sincronización.
import { AlertTriangle, CheckCircle, Activity } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { getFatiga } from "@/app/actions/perfil";

const ESTADO: Record<string, { titulo: string; color: string; borde: string; fondo: string; alerta: boolean }> = {
  OPTIMA: { titulo: "ESTADO ÓPTIMO", color: "text-green-400", borde: "border-green-500", fondo: "bg-green-950", alerta: false },
  MODERADA: { titulo: "CARGA MODERADA", color: "text-yellow-400", borde: "border-yellow-500", fondo: "bg-yellow-950", alerta: false },
  ELEVADA: { titulo: "RIESGO ELEVADO", color: "text-[#F97316]", borde: "border-[#F97316]", fondo: "bg-orange-950", alerta: true },
  CRITICA: { titulo: "ALTO RIESGO DE FATIGA", color: "text-[#F97316]", borde: "border-[#F97316]", fondo: "bg-orange-950", alerta: true },
};

// RF-009: protocolo mandatorio al superar el umbral crítico
const PROTOCOLO_MANDATORIO = [
  "Reducir la intensidad al 50%",
  "Priorizar movilidad y descanso activo",
  "Aumentar la ingesta hídrica",
];
const PROTOCOLO_PREVENTIVO = ["Mantener la intensidad sin aumentar la carga", "Dormir al menos 8 horas", "Incluir un día de descanso activo"];

const DIAS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

export default async function FatigaPage() {
  const f = await getFatiga();
  const e = ESTADO[f.nivelFatiga] ?? ESTADO.OPTIMA;
  const mandatorio = f.nivelFatiga === "CRITICA";
  const maxDia = Math.max(1, ...f.tendencia.map((t) => Number(t.cer)));

  return (
    <div>
      <PageLabel page="P18" />
      <div className="flex items-stretch gap-3 mb-8">
        <span className="w-1.5 bg-[#F97316] rounded" />
        <div>
          <p className="text-xs text-[#F97316] font-heading font-bold uppercase tracking-widest">MONITOR DE FATIGA</p>
          <h1 className="font-heading font-bold text-4xl text-white uppercase">ANÁLISIS BIOMÉTRICO DE RECUPERACIÓN</h1>
        </div>
      </div>

      {f.sincronizacionPendiente && (
        <p role="alert" className="mb-4 text-sm text-yellow-400 border border-yellow-400/40 rounded px-3 py-2">
          Sincronización pendiente: tus datos biométricos no están actualizados. Se muestra el último análisis disponible
          (peso de referencia {Number(f.pesoReferenciaKg)} kg).
        </p>
      )}

      <div className="grid grid-cols-[340px_1fr] gap-6">
        {/* Panel de estado actual */}
        <div className="bg-[#242424] border border-[#333] rounded-2xl p-8 text-center">
          <div
            data-testid="indicador-fatiga"
            className={`w-48 h-48 mx-auto rounded-full border-4 ${e.borde} ${e.fondo} flex flex-col items-center justify-center mb-6 ${e.color}`}
            style={e.alerta ? { boxShadow: "0 0 40px rgba(249,115,22,0.5)" } : undefined}
          >
            {e.alerta ? <AlertTriangle size={44} /> : <CheckCircle size={44} />}
            <p className="font-heading font-bold text-sm uppercase mt-2 px-4">{e.titulo}</p>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#9CA3AF] font-bold uppercase">CARGA</span>
            <span data-testid="porcentaje-carga" className="text-white font-bold">{f.porcentajeCarga}%</span>
          </div>
          <div className="h-3 bg-[#1a1a1a] rounded mb-3">
            <div className="h-full bg-[#F97316] rounded" style={{ width: `${f.porcentajeCarga}%` }} />
          </div>
          <p className="text-[10px] text-[#9CA3AF]">
            CER últimos 7 días: {Number(f.cargaSemanal).toLocaleString("es-AR")} · peso {Number(f.pesoReferenciaKg)} kg
          </p>
        </div>

        {/* Panel de diagnóstico */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#242424] border border-[#333] rounded-2xl p-6">
            <p className="font-heading font-bold text-sm text-white uppercase flex items-center gap-2 mb-4">
              <Activity size={16} className="text-[#F97316]" /> DIAGNÓSTICO ESTRUCTURAL
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className={`rounded-lg p-4 border ${e.alerta ? "border-[#F97316]" : "border-green-500"}`}>
                {e.alerta ? (
                  <>
                    <p className="font-heading font-bold text-[#F97316] uppercase mb-2">! SOBRECARGA DETECTADA</p>
                    <p className="text-xs text-[#9CA3AF]">
                      Tu carga de los últimos 7 días equivale al {f.porcentajeCarga}% del umbral seguro para tu peso corporal.
                      El volumen acumulado indica estrés sistémico y riesgo de lesión.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-heading font-bold text-green-400 uppercase mb-2">RECUPERACIÓN ADECUADA</p>
                    <p className="text-xs text-[#9CA3AF]">Tu carga está dentro del rango seguro. Podés sostener tu ritmo de entrenamiento.</p>
                  </>
                )}
              </div>
              <div className="rounded-lg p-4 border border-[#333]">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-heading font-bold text-white uppercase text-sm">PROTOCOLO DE RECUPERACIÓN</p>
                  {mandatorio && <span className="text-[10px] font-heading font-bold bg-[#F97316] text-white px-2 py-0.5 rounded">MANDATO</span>}
                </div>
                <ul data-testid="protocolo" className="text-xs text-[#9CA3AF] list-disc pl-4 flex flex-col gap-1">
                  {(mandatorio ? PROTOCOLO_MANDATORIO : PROTOCOLO_PREVENTIVO).map((a) => <li key={a}>{a}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[#242424] border border-[#333] rounded-2xl p-6">
            <p className="font-heading font-bold text-sm text-white uppercase mb-4">TENDENCIA SEMANAL</p>
            <div data-testid="tendencia" className="flex items-end gap-3 h-40">
              {f.tendencia.map((t, i) => {
                const alto = t.esFuturo ? 100 : Math.max(4, (Number(t.cer) * 100) / maxDia);
                return (
                  <div key={t.fecha} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div
                      className={`w-full rounded-t ${
                        t.esFuturo ? "border-2 border-dashed border-[#555]" : t.esHoy ? "bg-[#F97316]" : "bg-[#555]"
                      }`}
                      style={{ height: `${alto}%` }}
                      title={`${Math.round(Number(t.cer))} CER`}
                    />
                    <span className={`text-[10px] font-bold ${t.esHoy ? "text-[#F97316]" : "text-[#9CA3AF]"}`}>{DIAS[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
