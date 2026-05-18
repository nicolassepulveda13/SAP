import { Trophy, Star, Dumbbell, Activity } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";

const trophies = [
  {
    label: "TORNEO GLOBAL 2023",
    labelColor: "bg-[#F97316]",
    name: "CAMPEÓN ABSOLUTO",
    desc: "Dominio indiscutible en la categoría de peso pesado. Superó a 50 competidores en el evento principal del Arena Forge.",
    star: true,
    featured: true,
    icon: "🏆",
  },
  {
    label: "TEMPORADA 4",
    labelColor: "bg-[#2e2e2e]",
    name: "RESISTENCIA EXTREMA",
    desc: "Top 5% en la prueba de supervivencia de 24 horas.",
    icon: "🎖️",
  },
  {
    label: "DESAFÍO MENSUAL",
    labelColor: "bg-[#2e2e2e]",
    name: "RACHA DE FUEGO",
    desc: "100 días consecutivos completando rutinas nivel Overlord.",
    icon: "🔥",
  },
  {
    label: null,
    bg: "bg-[#1a1a1a]",
    name: "MAESTRO DEL HIERRO",
    desc: "Levantamiento Total: 50,000 KG",
    icon: "⚔️",
    iconBg: "bg-[#2e2e2e]",
  },
  {
    label: null,
    bg: "bg-[#F97316]",
    name: "VELOCIDAD TERMINAL",
    desc: "Sprint Máximo Registrado: 32 KM/H",
    icon: "⚡",
    iconBg: "bg-[#F97316]",
    featured: true,
  },
];

export default function TrofeosPage() {
  return (
    <div>
      {/* Header */}
      <PageLabel page="P19" />
      <div className="flex items-center gap-5 mb-8">
        <div className="w-20 h-20 bg-[#1a1a1a] border border-[#333] rounded-xl flex items-center justify-center shrink-0">
          <span className="text-4xl">🦍</span>
        </div>
        <div className="flex-1">
          <h1 className="font-heading font-bold text-5xl text-white uppercase">VITRINA DE TROFEOS</h1>
          <p className="text-[#F97316] font-heading font-bold uppercase tracking-widest text-sm">LOGROS DE COMBATE</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="bg-[#242424] border border-[#333] rounded-xl px-5 py-3 text-center">
            <p className="text-xs text-[#9CA3AF] uppercase">VICTORIAS</p>
            <p className="font-heading font-bold text-3xl text-white">124</p>
          </div>
          <div className="bg-[#F97316] rounded-xl px-5 py-3 text-center">
            <p className="text-xs text-white/70 uppercase">RANGO</p>
            <p className="font-heading font-bold text-3xl text-white">S+</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#333] mb-6" />

      {/* Trophy grid */}
      <div className="grid grid-cols-[2fr_1fr] gap-4">
        {/* Featured */}
        <div className="bg-[#242424] border border-[#333] rounded-xl p-6 relative min-h-56">
          <span className="bg-[#F97316] text-white text-xs font-heading font-bold uppercase px-2 py-0.5 rounded mb-4 inline-block">
            TORNEO GLOBAL 2023
          </span>
          {trophies[0].star && (
            <Star size={20} className="absolute top-4 right-4 text-[#F97316] fill-[#F97316]" />
          )}
          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="font-heading font-bold text-4xl text-white uppercase mb-2">{trophies[0].name}</h2>
              <p className="text-sm text-[#9CA3AF] max-w-sm">{trophies[0].desc}</p>
            </div>
            <span className="text-6xl opacity-30">{trophies[0].icon}</span>
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-4">
          <div className="bg-[#242424] border border-[#333] rounded-xl p-4">
            <div className="flex justify-between text-xs text-[#9CA3AF] mb-2">
              <span className="flex items-center gap-1"><Trophy size={10} className="text-[#F97316]" /></span>
              <span className="uppercase">TEMPORADA 4</span>
            </div>
            <h3 className="font-heading font-bold text-lg text-white uppercase">{trophies[1].name}</h3>
            <p className="text-xs text-[#9CA3AF]">{trophies[1].desc}</p>
          </div>
          <div className="bg-[#242424] border border-[#F97316]/40 rounded-xl p-4">
            <div className="flex justify-between text-xs text-[#9CA3AF] mb-2">
              <span className="flex items-center gap-1"><Activity size={10} className="text-[#F97316]" /></span>
              <span className="uppercase">DESAFÍO MENSUAL</span>
            </div>
            <h3 className="font-heading font-bold text-lg text-white uppercase">{trophies[2].name}</h3>
            <p className="text-xs text-[#9CA3AF]">{trophies[2].desc}</p>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-[#242424] border border-[#333] rounded-xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-[#2e2e2e] rounded-lg flex items-center justify-center shrink-0">
            <Dumbbell size={24} className="text-[#9CA3AF]" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl text-white uppercase">{trophies[3].name}</h3>
            <p className="text-xs text-[#9CA3AF]">{trophies[3].desc}</p>
          </div>
        </div>
        <div className="bg-[#F97316] rounded-xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-[#EA6800] rounded-lg flex items-center justify-center shrink-0">
            <Activity size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl text-white uppercase">{trophies[4].name}</h3>
            <p className="text-xs text-white/70">{trophies[4].desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
