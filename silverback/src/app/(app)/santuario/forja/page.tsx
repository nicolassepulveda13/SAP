import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageLabel } from "@/components/ui/PageLabel";

const challenges = [
  {
    tier: "TITAN TIER",
    tierColor: "#F97316",
    name: "SEMANA DE SENTADILLA PESADA",
    desc: "Acumula 10,000 lbs de volumen total en sentadilla trasera en 7 días. La forma no es negociable.",
    progress: 6000,
    goal: 10000,
    unit: "lbs",
    pct: 60,
    done: false,
  },
  {
    tier: "ENDURANCE",
    tierColor: "#f87171",
    name: "MOTOR METABÓLICO",
    desc: "Completa 50 rondas de sprints de 100m. Mantén un ritmo por debajo de 15s por sprint.",
    progress: 10,
    goal: 50,
    unit: "Rounds",
    pct: 20,
    done: false,
  },
  {
    tier: "COMPLETADO",
    tierColor: "#6b7280",
    name: "AGARRE DE HIERRO",
    desc: "Acumula 30 minutos de tiempo de colgado (dead hang) en 5 días.",
    progress: 30,
    goal: 30,
    unit: "Mins",
    pct: 100,
    done: true,
  },
];

export default function ChallengeForgePage() {
  return (
    <div>
      <PageLabel page="P5" />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/santuario" className="text-[#9CA3AF] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-heading font-bold text-3xl text-[#F97316] uppercase tracking-wider">ARENA DESAFÍOS</h1>
          </div>
        </div>
        <span className="text-xs text-[#9CA3AF] bg-[#2e2e2e] px-3 py-1 rounded font-heading uppercase tracking-wider">
          RANGO DEL CLAN: #4
        </span>
      </div>

      <div className="mb-6">
        <h2 className="font-heading font-bold text-xl text-white uppercase mb-1 border-l-2 border-[#F97316] pl-3">
          DIRECTIVAS SEMANALES
        </h2>
        <p className="text-sm text-[#9CA3AF] pl-3">Completa estos protocolos de alta intensidad para ganar reputación en el clan.</p>
      </div>

      <div className="space-y-4">
        {challenges.map((c) => (
          <div key={c.name} className={`bg-[#242424] border border-[#333] rounded-xl overflow-hidden flex ${c.done ? "opacity-70" : ""}`}>
            <div className="w-36 bg-[#1a1a1a] flex items-center justify-center shrink-0 relative">
              <span className="text-5xl">{c.done ? "💪" : "🏋️"}</span>
              <span
                className="absolute top-2 left-2 text-xs font-heading font-bold uppercase px-2 py-0.5 rounded"
                style={{ backgroundColor: c.tierColor, color: "white" }}
              >
                {c.tier}
              </span>
            </div>
            <div className="flex-1 p-5">
              <h3 className={`font-heading font-bold text-lg uppercase mb-1 ${c.done ? "line-through text-[#9CA3AF]" : "text-white"}`}>
                {c.name}
              </h3>
              <p className="text-xs text-[#9CA3AF] mb-3">{c.desc}</p>
              <div className="mb-1 flex justify-between text-xs text-[#9CA3AF]">
                <span>Progreso: {c.progress.toLocaleString()} / {c.goal.toLocaleString()} {c.unit}</span>
                <span>{c.pct}%</span>
              </div>
              <div className="h-1.5 bg-[#333] rounded-full mb-4">
                <div className="h-full bg-[#F97316] rounded-full" style={{ width: `${c.pct}%` }} />
              </div>
              <div className="flex justify-end">
                {c.done ? (
                  <button className="border border-[#555] text-[#9CA3AF] font-heading font-bold uppercase text-xs px-4 py-2 rounded tracking-wider">
                    PROTOCOLO ASEGURADO
                  </button>
                ) : (
                  <button className="bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase text-xs px-4 py-2 rounded tracking-wider transition-colors">
                    ACEPTAR DESAFÍO
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
