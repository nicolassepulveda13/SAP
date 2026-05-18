import { Lock, Star } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";

const stats = [
  { label: "CAJAS", value: "12", color: "text-[#F97316]" },
  { label: "COFRES LISTOS", value: "03", color: "text-white" },
  { label: "MULTIPLICADOR XP", value: "1.5x", color: "text-white" },
  { label: "PRÓXIMO BOTÍN", value: "2h 14m", color: "text-white" },
];

const chests = [
  {
    label: "LISTO",
    labelColor: "bg-[#F97316]",
    name: "CAJA DE SUMINISTROS ALPHA",
    stars: 1,
    desc: "Contiene raciones de energía de alta densidad y posibles mejoras de equipo de nivel 2.",
    locked: false,
    action: "RECLAMAR",
  },
  {
    label: "BLOQUEADO",
    labelColor: "bg-[#333]",
    name: "BÓVEDA DE TITANIO",
    stars: 2,
    desc: "Recompensa élite. Requiere 5 Llaves de Acero para abrir los mecanismos de contención.",
    locked: true,
    action: "5 PUNTOS",
  },
  {
    label: "EVENTO LIMITADO",
    labelColor: "bg-[#ec4899]",
    name: "PAQUETE DE ASALTO OMEGA",
    stars: 3,
    desc: "Recompensa masiva garantizada. Incluye skins tácticas y tokens de arena de alto nivel.",
    locked: false,
    action: "RECLAMAR AHORA",
    featured: true,
  },
];

export default function BotinPage() {
  return (
    <div>
      <PageLabel page="P14" />
      <div className="mb-6">
        <h1 className="font-heading font-bold text-5xl text-white uppercase">BÓVEDA</h1>
        <p className="text-sm text-[#9CA3AF]">Reclama tus recompensas de alto rendimiento. El esfuerzo se paga en metal y recursos.</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#242424] border border-[#333] rounded-xl p-4">
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`font-heading font-bold text-2xl ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {chests.map((c) => (
          <div
            key={c.name}
            className={`bg-[#242424] rounded-xl overflow-hidden border ${c.featured ? "border-[#F97316]" : "border-[#333]"}`}
          >
            {/* Image area */}
            <div className="relative h-44 bg-[#1a1a1a] flex items-center justify-center">
              <span className="text-6xl">{c.locked ? "🔒" : c.featured ? "🏆" : "📦"}</span>
              <span className={`absolute top-3 left-3 text-xs font-heading font-bold uppercase px-2 py-0.5 rounded text-white ${c.labelColor}`}>
                {c.label}
              </span>
              {c.locked && (
                <div className="absolute inset-0 bg-[#000]/50 flex items-center justify-center">
                  <Lock size={24} className="text-[#9CA3AF]" />
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className={`font-heading font-bold text-base uppercase leading-tight ${c.featured ? "text-[#F97316]" : "text-white"}`}>
                  {c.name}
                </h3>
                <div className="flex shrink-0 ml-2">
                  {Array.from({ length: c.stars }).map((_, i) => (
                    <Star key={i} size={12} className="text-[#F97316] fill-[#F97316]" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-[#9CA3AF] mb-4">{c.desc}</p>
              <button
                className={`w-full font-heading font-bold uppercase tracking-wider py-2.5 rounded text-sm transition-colors ${
                  c.locked
                    ? "border border-[#555] text-[#9CA3AF] hover:border-white"
                    : "bg-[#F97316] hover:bg-[#EA6800] text-white"
                }`}
              >
                {c.locked && <Lock size={12} className="inline mr-1" />}
                {c.action}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
