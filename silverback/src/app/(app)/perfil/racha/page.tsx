// S8-Perfil: CU-005-002 + CU-005-003 — Termómetro de Racha (P17), según la carpeta:
// "RACHA ACTUAL", banner "RACHA A PUNTO DE PERDERSE", SALVAR RACHA con "costo pts (Tienes: saldo pts)" y
// "DEJAR MORIR LA RACHA". FA-1 ya entrenó hoy → sin banner ni opciones · FA-2 0 días → sin rescate.
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { getRacha, getDashboard } from "@/app/actions/perfil";
import { AccionesRacha } from "./AccionesRacha";

export default async function RachaPage() {
  const [racha, dashboard] = await Promise.all([getRacha(), getDashboard()]);
  const dias = racha?.diasConsecutivos ?? 0;
  const enRiesgo = racha?.estado === "EN_RIESGO" && dias > 0;
  const costo = racha?.costoRescate ?? 50;
  const puntos = dashboard.clan?.puntosClan ?? 0;

  return (
    <div>
      <PageLabel page="P17" />
      <div className="flex items-center gap-3 mb-8">
        <Link href="/santuario" aria-label="Volver al Santuario" className="text-[#9CA3AF] hover:text-white">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-heading font-bold text-xl text-[#F97316] tracking-widest">SILVERBACK</span>
      </div>

      <div className="bg-[#242424] border border-[#333] rounded-2xl p-8 text-center max-w-xl mx-auto">
        <h1 className="font-heading font-bold text-2xl text-white uppercase">RACHA ACTUAL</h1>
        <p className="text-sm text-[#9CA3AF] mb-6">
          {enRiesgo ? "Tu disciplina está en riesgo." : dias > 0 ? "Tu disciplina está intacta." : "Registrá un entrenamiento para empezar tu racha."}
        </p>
        <span
          data-testid="dias-racha"
          className="block font-heading font-bold text-[120px] leading-none text-[#F97316]"
          style={{ textShadow: "0 0 40px rgba(249,115,22,0.6)" }}
        >
          {dias}
        </span>
        <p className="text-sm text-[#9CA3AF] uppercase tracking-widest mb-6">DÍAS CONSECUTIVOS</p>

        {enRiesgo && (
          <>
            <div role="alert" className="bg-red-500/15 border border-red-500 text-red-400 rounded-lg px-4 py-3 mb-6 flex items-center justify-center gap-2 font-heading font-bold uppercase">
              <AlertTriangle size={18} /> RACHA A PUNTO DE PERDERSE
            </div>
            <AccionesRacha costo={costo} puntos={puntos} tieneClan={!!dashboard.clan} />
          </>
        )}
      </div>
    </div>
  );
}
