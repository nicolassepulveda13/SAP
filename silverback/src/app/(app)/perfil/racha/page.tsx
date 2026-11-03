// S8-Perfil: CU-005-002 + CU-005-003 — Racha y Salvar Racha. Datos reales + acción.
import { PageLabel } from "@/components/ui/PageLabel";
import { getRacha, getDashboard } from "@/app/actions/perfil";
import { SalvarRachaButton } from "./SalvarRachaButton";

const COLOR_ESTADO: Record<string, string> = {
  ACTIVA: "text-[#F97316]",
  EN_RIESGO: "text-yellow-400",
  ROTA: "text-red-500",
};

const COSTO_SALVAR_PUNTOS = 50;

export default async function RachaPage() {
  const [racha, dashboard] = await Promise.all([getRacha(), getDashboard()]);
  const dias = racha?.diasConsecutivos ?? 0;
  const estado = racha?.estado ?? "ACTIVA";
  const enRiesgo = estado === "EN_RIESGO" || estado === "ROTA";
  const colorEstado = COLOR_ESTADO[estado] ?? "text-[#F97316]";
  const puntosClan = dashboard.clan?.puntosClan ?? 0;
  const puedeSalvar = enRiesgo && puntosClan >= COSTO_SALVAR_PUNTOS && dashboard.clan;

  return (
    <div>
      <PageLabel page="P17" />
      <div className="mb-8">
        <h1 className="font-heading font-bold text-4xl text-white uppercase">RACHA DE ENTRENAMIENTO</h1>
        <p className="text-sm text-[#9CA3AF]">Tu disciplina medida en días consecutivos.</p>
      </div>

      <div className="bg-[#242424] border border-[#333] rounded-2xl p-8 text-center max-w-xl mx-auto">
        <p className={`font-heading font-bold text-xs uppercase tracking-wider mb-4 ${colorEstado}`}>
          ESTADO: {estado.replace("_", " ")}
        </p>
        <div className="relative inline-block mb-4">
          <span
            className="font-heading font-bold text-[120px] leading-none text-[#F97316]"
            style={{ textShadow: "0 0 40px rgba(249,115,22,0.6)" }}
          >
            {dias}
          </span>
        </div>
        <p className="text-sm text-[#9CA3AF] uppercase tracking-widest mb-2">DÍAS CONSECUTIVOS</p>
        {racha?.ultimoEntrenamiento && (
          <p className="text-xs text-[#9CA3AF] mb-6">
            Último entrenamiento: {new Date(racha.ultimoEntrenamiento).toLocaleDateString("es-AR")}
          </p>
        )}

        {enRiesgo && (
          <div className="border-t border-[#333] pt-6 mt-6">
            <p className="text-sm text-white mb-2 font-heading font-bold uppercase">
              Salvá tu racha con puntos de clan
            </p>
            <p className="text-xs text-[#9CA3AF] mb-4">
              Costo: {COSTO_SALVAR_PUNTOS} puntos de clan · Disponibles: {puntosClan}
            </p>
            {dashboard.clan ? (
              <SalvarRachaButton clanId={dashboard.clan.id} disabled={!puedeSalvar} />
            ) : (
              <p className="text-xs text-red-400">Necesitás pertenecer a un clan para salvar la racha.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
